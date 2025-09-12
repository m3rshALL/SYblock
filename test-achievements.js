// Тест системы достижений
// Запускать в браузере через консоль

const testAchievements = async () => {
  console.log('🧪 ТЕСТ СИСТЕМЫ ДОСТИЖЕНИЙ НАЧАТ')
  console.log('=======================================')
  
  try {
    // 1. Получаем текущий прогресс
    console.log('📊 1. Получение текущего прогресса...')
    const initialProgress = GameStorage.getProgress()
    console.log('Начальные достижения:', initialProgress.achievements.filter(a => a.unlocked).map(a => a.title))
    console.log('Завершенные уровни:', initialProgress.completedLevels)
    console.log('Total XP:', initialProgress.totalXP)
    
    // 2. Симулируем завершение 1-го уровня
    console.log('\n🎮 2. Симуляция завершения 1-го уровня...')
    const progressAfterLevel1 = GameStorage.completeLevel(1, 100)
    console.log('После завершения 1-го уровня:')
    console.log('Разблокированные достижения:', progressAfterLevel1.achievements.filter(a => a.unlocked).map(a => a.title))
    console.log('Завершенные уровни:', progressAfterLevel1.completedLevels) 
    console.log('Total XP:', progressAfterLevel1.totalXP)
    
    // 3. Проверяем что достижения разблокированы локально
    const expectedAchievements = ['Первые шаги', 'Новичок в коде']
    const unlockedTitles = progressAfterLevel1.achievements.filter(a => a.unlocked).map(a => a.title)
    
    expectedAchievements.forEach(title => {
      if (unlockedTitles.includes(title)) {
        console.log(`✅ ${title} - разблокировано`)
      } else {
        console.log(`❌ ${title} - НЕ разблокировано`)
      }
    })
    
    // 4. Ждем сохранения в БД
    console.log('\n💾 3. Ожидание сохранения в БД (3 секунды)...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 5. Перезагружаем прогресс из БД
    console.log('\n🔄 4. Перезагрузка прогресса из БД...')
    const playerName = progressAfterLevel1.player.name
    const reloadedProgress = await GameStorage.getProgressFromDB(playerName)
    
    console.log('После перезагрузки из БД:')
    console.log('Разблокированные достижения:', reloadedProgress.achievements.filter(a => a.unlocked).map(a => a.title))
    console.log('Завершенные уровни:', reloadedProgress.completedLevels)
    console.log('Total XP:', reloadedProgress.totalXP)
    
    // 6. Финальная проверка
    console.log('\n🏁 5. ФИНАЛЬНАЯ ПРОВЕРКА')
    const reloadedUnlockedTitles = reloadedProgress.achievements.filter(a => a.unlocked).map(a => a.title)
    
    let allTestsPassed = true
    expectedAchievements.forEach(title => {
      if (reloadedUnlockedTitles.includes(title)) {
        console.log(`✅ ${title} - СОХРАНЕНО в БД`)
      } else {
        console.log(`❌ ${title} - НЕ СОХРАНЕНО в БД`)
        allTestsPassed = false
      }
    })
    
    // Проверяем завершенные уровни
    if (reloadedProgress.completedLevels.includes(1)) {
      console.log(`✅ Уровень 1 - отмечен как завершенный`)
    } else {
      console.log(`❌ Уровень 1 - НЕ отмечен как завершенный`)
      allTestsPassed = false
    }
    
    // Проверяем XP
    if (reloadedProgress.totalXP >= 100) {
      console.log(`✅ XP сохранены корректно (${reloadedProgress.totalXP})`)
    } else {
      console.log(`❌ XP не сохранены (${reloadedProgress.totalXP})`)
      allTestsPassed = false
    }
    
    console.log('\n=======================================')
    if (allTestsPassed) {
      console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!')
    } else {
      console.log('❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ!')
    }
    console.log('=======================================')
    
    return allTestsPassed
    
  } catch (error) {
    console.error('💥 ОШИБКА В ТЕСТАХ:', error)
    return false
  }
}

// Дополнительный тест для проверки множественных уровней
const testMultipleLevels = async () => {
  console.log('\n🧪 ТЕСТ МНОЖЕСТВЕННЫХ УРОВНЕЙ')
  console.log('===============================')
  
  try {
    // Завершаем уровни 2, 3, 4, 5
    for (let level = 2; level <= 5; level++) {
      console.log(`🎮 Завершение уровня ${level}...`)
      const progress = GameStorage.completeLevel(level, 100 * level)
      const unlockedCount = progress.achievements.filter(a => a.unlocked).length
      console.log(`Уровень ${level}: ${unlockedCount} достижений разблокировано`)
    }
    
    // Ждем сохранения
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Проверяем финальное состояние
    const finalProgress = GameStorage.getProgress()
    console.log('\n📊 ФИНАЛЬНАЯ СТАТИСТИКА:')
    console.log('Завершенные уровни:', finalProgress.completedLevels)
    console.log('Разблокированные достижения:', finalProgress.achievements.filter(a => a.unlocked).map(a => a.title))
    console.log('Total XP:', finalProgress.totalXP)
    
    // Проверяем ключевые достижения
    const expectedFinalAchievements = [
      'Первые шаги',
      'Новичок в коде', 
      'Защитник демократии',
      'NFT-кузнец',
      'DAO-мастер',
      'Страж безопасности',
      'Страж блокчейна'
    ]
    
    const unlockedTitles = finalProgress.achievements.filter(a => a.unlocked).map(a => a.title)
    const missingAchievements = expectedFinalAchievements.filter(title => !unlockedTitles.includes(title))
    
    if (missingAchievements.length === 0) {
      console.log('✅ Все ожидаемые достижения разблокированы!')
      return true
    } else {
      console.log('❌ Недостающие достижения:', missingAchievements)
      return false
    }
    
  } catch (error) {
    console.error('💥 Ошибка в тесте множественных уровней:', error)
    return false
  }
}

// Экспортируем функции для использования в консоли браузера
if (typeof window !== 'undefined') {
  window.testAchievements = testAchievements
  window.testMultipleLevels = testMultipleLevels
  window.GameStorage = GameStorage // Для доступа к GameStorage в консоли
}

console.log('🧪 Тесты загружены! Запустите в консоли браузера:')
console.log('testAchievements() - базовый тест')
console.log('testMultipleLevels() - тест всех уровней')
console.log('GameStorage.resetProgress() - сброс прогресса')
