/**
 * Безопасные утилиты для работы с localStorage
 * Обрабатывают случаи когда localStorage недоступен (SSR, приватный режим)
 */

/**
 * Безопасно получает значение из localStorage
 * @param key - ключ
 * @param defaultValue - значение по умолчанию если ключ не найден или localStorage недоступен
 * @returns значение из localStorage или defaultValue
 */
export function safeGetItem(key: string, defaultValue: string | null = null): string | null {
  if (typeof window === 'undefined') {
    return defaultValue
  }
  
  try {
    return localStorage.getItem(key) || defaultValue
  } catch (error) {
    console.warn('Ошибка доступа к localStorage:', error)
    return defaultValue
  }
}

/**
 * Безопасно устанавливает значение в localStorage
 * @param key - ключ
 * @param value - значение
 * @returns true если успешно, false если ошибка
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn('Ошибка записи в localStorage:', error)
    return false
  }
}

/**
 * Безопасно удаляет значение из localStorage
 * @param key - ключ
 * @returns true если успешно, false если ошибка
 */
export function safeRemoveItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn('Ошибка удаления из localStorage:', error)
    return false
  }
}

/**
 * Проверяет доступность localStorage
 * @returns true если localStorage доступен, false если нет
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  try {
    const testKey = '__localStorage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}
