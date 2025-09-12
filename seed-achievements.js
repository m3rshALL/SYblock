const fetch = require('node-fetch');

async function seedAchievements() {
  try {
    const response = await fetch('http://localhost:3001/api/seed-achievements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Результат:', result);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

seedAchievements();
