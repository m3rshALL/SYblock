import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { redis } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CompileSchema = z.object({
  code: z.string().min(1, 'Пустой исходный код').max(200_000),
  optimize: z.boolean().optional().default(true),
  runs: z.number().int().min(1).max(1_000).optional().default(200)
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rlKey = `rl:compile:${ip}`
    const cur = Number(await redis.incr(rlKey))
    if (cur === 1) {
      await redis.expire(rlKey, 60) // окно 60 сек
    }
    if (cur > 10) { // 10 запросов/мин
      return NextResponse.json({ ok: false, message: 'Слишком много запросов, попробуйте позже' }, { status: 429 })
    }

    const parsed = CompileSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: parsed.error.errors[0]?.message || 'Некорректные данные' }, { status: 400 })
    }
    const { code: source, optimize, runs } = parsed.data

    if (!source || source.trim().length === 0) {
      return NextResponse.json({ ok: false, message: 'Пустой исходный код' }, { status: 400 })
    }

    // Динамический импорт solc, учитываем возможные формы экспорта
    const solcModule: any = await import('solc')
    const solc: any = solcModule?.default ?? solcModule
    if (!solc || typeof solc.compile !== 'function') {
      return NextResponse.json(
        { ok: false, message: 'Компилятор Solidity недоступен' },
        { status: 500 }
      )
    }

    const input = {
      language: 'Solidity',
      sources: {
        'Contract.sol': { content: source },
      },
      settings: {
        optimizer: {
          enabled: optimize,
          runs,
        },
        outputSelection: {
          '*': {
            '*': [
              'abi',
              'evm.bytecode.object',
              'evm.deployedBytecode.object',
              'evm.gasEstimates',
              'evm.methodIdentifiers',
              'metadata'
            ],
          },
        },
      },
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input)))

    const errors = (output.errors || []).filter((e: any) => e.severity === 'error')
    const warnings = (output.errors || []).filter((e: any) => e.severity === 'warning')

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          errors: errors.map((e: any) => ({
            message: e.formattedMessage || e.message,
            source: e.sourceLocation?.file || e.sourceLocation?.file || 'Contract.sol',
          })),
          warnings: warnings.map((w: any) => ({
            message: w.formattedMessage || w.message,
          })),
        },
        { status: 200 }
      )
    }

    // Сборка краткой информации об артефактах
    const artifacts: Array<{
      name: string
      abi: any
      bytecode: string
      bytecodeHash?: string
      gas?: {
        creation?: {
          codeDepositCost?: string
          executionCost?: string
          totalCost?: string
        }
        external?: Record<string, string>
        internal?: Record<string, string>
      }
    }> = []
    const contracts = output.contracts?.['Contract.sol'] || {}
    for (const name of Object.keys(contracts)) {
      const c = contracts[name]
      let bytecode: string = c.evm?.bytecode?.object || ''
      let bytecodeHash: string | undefined
      try {
        if (bytecode) {
          const { keccak256, getBytes } = await import('ethers')
          const hex = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`
          bytecodeHash = keccak256(getBytes(hex))
        }
      } catch {}
      artifacts.push({
        name,
        abi: c.abi,
        bytecode,
        bytecodeHash,
        gas: c.evm?.gasEstimates ? {
          creation: c.evm.gasEstimates.creation ? {
            codeDepositCost: String(c.evm.gasEstimates.creation.codeDepositCost ?? ''),
            executionCost: String(c.evm.gasEstimates.creation.executionCost ?? ''),
            totalCost: String(c.evm.gasEstimates.creation.totalCost ?? ''),
          } : undefined,
          external: c.evm.gasEstimates.external || undefined,
          internal: c.evm.gasEstimates.internal || undefined,
        } : undefined,
      })
    }

    return NextResponse.json(
      {
        ok: true,
        warnings: warnings.map((w: any) => ({
          message: w.formattedMessage || w.message,
        })),
        artifacts,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || 'Ошибка компиляции' },
      { status: 500 }
    )
  }
}


