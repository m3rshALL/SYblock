'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

const ClientOnlyWrapper: React.FC<ClientOnlyWrapperProps> = ({ 
  children, 
  fallback = <div>Загрузка...</div> 
}) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ClientOnlyWrapper 