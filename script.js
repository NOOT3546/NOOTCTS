document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts-container');
  const terminalPostsContainer = document.getElementById('terminal-posts-container');
  let posts = [];

  // Проверяем, существуют ли контейнеры на текущей странице
  if (!postsContainer && !terminalPostsContainer) {
    console.log('No post containers found on this page');
    return;
  }

  function loadPosts() {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data => {
        const sortedPosts = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (JSON.stringify(sortedPosts) !== JSON.stringify(posts)) {
          posts = sortedPosts;
          renderPosts();
        }
      })
      .catch(error => console.error('Error loading posts:', error));
  }

  function renderPosts() {
    // Очищаем только существующие контейнеры
    if (postsContainer) {
      postsContainer.innerHTML = '';
    }
    if (terminalPostsContainer) {
      terminalPostsContainer.innerHTML = '';
    }
    
    posts.forEach(post => {
      const postElement = createPostElement(post);
      
      // Добавляем посты только в существующие контейнеры
      if (postsContainer) {
        postsContainer.appendChild(postElement.cloneNode(true));
      }
      
      if (terminalPostsContainer) {
        const terminalPostElement = createPostElement(post);
        terminalPostsContainer.appendChild(terminalPostElement);
      }
    });
  }

  function createPostElement(post) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.dataset.id = post.id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    
    if (post.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = 'post-text';
      textDiv.innerHTML = formatText(post.content);
      contentDiv.appendChild(textDiv);
    } 
    else if (post.type === 'photo') {
      const img = document.createElement('img');
      img.src = post.content;
      img.alt = 'Photo';
      img.className = 'post-media';
      contentDiv.appendChild(img);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        contentDiv.appendChild(captionDiv);
      }
    } 
    else if (post.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.className = 'post-media';
      const source = document.createElement('source');
      source.src = post.content;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.appendChild(document.createTextNode('Ваш браузер не поддерживает видео.'));
      contentDiv.appendChild(video);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        contentDiv.appendChild(captionDiv);
      }
    } 
    else if (post.type === 'audio') {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.className = 'post-media';
      const source = document.createElement('source');
      source.src = post.content;
      source.type = 'audio/mpeg';
      audio.appendChild(source);
      audio.appendChild(document.createTextNode('Ваш браузер не поддерживает аудио.'));
      contentDiv.appendChild(audio);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        contentDiv.appendChild(captionDiv);
      }
    }
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'post-meta';
    const date = new Date(post.date).toLocaleString();
    const userLink = document.createElement('a');
    userLink.href = `https://t.me/${post.username}`;
    userLink.target = '_blank';
    
    // Создаем элемент для аватарки
    const avatarImg = document.createElement('img');
    avatarImg.className = 'user-avatar';
    avatarImg.alt = `Аватар ${post.username}`;
    avatarImg.src = `https://t.me/i/userpic/320/${post.username}.jpg`;
    
    // Добавляем аватарку и юзернейм
    userLink.appendChild(avatarImg);
    userLink.appendChild(document.createTextNode(`@${post.username}`));
    
    metaDiv.appendChild(document.createTextNode(`${date} `));
    metaDiv.appendChild(userLink);
    contentDiv.appendChild(metaDiv);
    
    postElement.appendChild(contentDiv);
    return postElement;
  }

  function formatText(text) {
    const urlRegex = /(\b(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?)/g;
    
    let formatted = text.replace(urlRegex, url => {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${fullUrl}" target="_blank">${url}</a>`;
    });
    
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  // Функционал вкладок - только если есть кнопки вкладок на странице
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Проверяем, ведет ли ссылка на другую страницу
        const href = button.getAttribute('href');
        if (href && (href.includes('.html') || href.startsWith('http'))) {
          // Если это ссылка на другую страницу, разрешаем переход
          return;
        }
        
        e.preventDefault();
        const tabId = button.dataset.tab;
          
          // Убираем активный класс у всех кнопок и контента
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Добавляем активный класс текущей кнопке и соответствующему контенту
          button.classList.add('active');
          const targetTab = document.getElementById(`${tabId}-tab`);
          if (targetTab) {
            targetTab.classList.add('active');
          }
          
          // Перезагружаем посты при переключении вкладок
          if (tabId === 'posts' || tabId === 'terminal') {
            loadPosts();
          }
        });
      });
    }

  // Загружаем посты только если есть контейнеры для них
  if (postsContainer || terminalPostsContainer) {
    loadPosts();
    
    // Обновляем посты
    setInterval(loadPosts, 1000);
  }
});

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const fsExtra = require('fs-extra');

const config = {
  token: '8145514786:AAENP05n3lDDtfiIBqzRIk68LNPiWj5_rAA',
  weatherApiKey: 'ece0a3ad3fbc11e5b30c64b8294e6d96',
  adminUsernames: ['NOOT3546_OFFICIAL', 'NOOT3546'],
  maxPostsPerDay: 30,
  maxTextLength: 1000,
  errorChatId: '7376699012'
};

const bot = new TelegramBot(config.token, { polling: true });
const app = express();

// Объект для хранения ID сообщений, которые нужно удалить
const messagesToDelete = new Map();

// Функция для удаления сообщения через указанное время
function scheduleMessageDeletion(chatId, messageId, delayMs = 5 * 60 * 1000) {
  const timeoutId = setTimeout(async () => {
    try {
      await bot.deleteMessage(chatId, messageId);
      messagesToDelete.delete(`${chatId}_${messageId}`);
    } catch (error) {
      // Игнорируем ошибки удаления (сообщение могло быть уже удалено)
      messagesToDelete.delete(`${chatId}_${messageId}`);
    }
  }, delayMs);

  messagesToDelete.set(`${chatId}_${messageId}`, timeoutId);
}

// Функция для отправки сообщения с последующим удалением
async function sendMessageWithAutoDelete(chatId, text, options = {}) {
  try {
    const message = await bot.sendMessage(chatId, text, options);
    scheduleMessageDeletion(chatId, message.message_id);
    return message;
  } catch (error) {
    await logError(error, { function: 'sendMessageWithAutoDelete', chatId: chatId, text: text });
    throw error;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nootcts.html'));
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'css', 'js']
}));

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

const dataFiles = {
  posts: path.join(__dirname, 'data', 'posts.json'),
  users: path.join(__dirname, 'data', 'users.json'),
  bans: path.join(__dirname, 'data', 'bans.json'),
  messages: path.join(__dirname, 'data', 'messages.json'),
  user_statuses: path.join(__dirname, 'data', 'user_statuses.json'),
  errors: path.join(__dirname, 'data', 'errors.json')
};

for (const file of Object.values(dataFiles)) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]));
  }
}

function readData(file) {
  return JSON.parse(fs.readFileSync(dataFiles[file]));
}

function writeData(file, data) {
  fs.writeFileSync(dataFiles[file], JSON.stringify(data, null, 2));
}

const statusMap = new Map();

setInterval(() => {
  const users = readData('users');
  const now = Date.now();
  const statuses = users.map(u => {
    const lastSeen = statusMap.get(u.username) || 0;
    return { ...u, status: now - lastSeen < 15000 ? 'online' : 'offline' };
  });
  writeData('user_statuses', statuses);
}, 5000);

app.use((req, res, next) => {
  const auth = req.headers['x-username'];
  if (auth) statusMap.set(auth, Date.now());
  next();
});

async function logError(error, context = {}) {
  try {
    const errorId = Date.now().toString();
    const errorData = {
      id: errorId,
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: context
    };

    const errors = readData('errors');
    errors.push(errorData);
    writeData('errors', errors);

    const errorMessage = `🚨 *Ошибка в боте* 🚨\n\n` +
      `🆔 *ID ошибки:* ${errorId}\n` +
      `⏰ *Время:* ${new Date().toLocaleString()}\n` +
      `📛 *Тип:* ${error.name}\n` +
      `📝 *Сообщение:* ${error.message}`;

    if (config.errorChatId) {
      await bot.sendMessage(config.errorChatId, errorMessage, { parse_mode: 'Markdown' });
    }

    return errorId;
  } catch (e) {
    console.error('Ошибка при логировании ошибки:', e);
    return null;
  }
}

function generateCode(length, difficulty) {
  let chars = '';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  switch (difficulty) {
    case 'easy': chars = lowercase; break;
    case 'medium': chars = lowercase + numbers; break;
    case 'hard': chars = lowercase + uppercase + numbers; break;
    case 'impossible': chars = lowercase + uppercase + numbers + symbols; break;
    default: chars = lowercase + numbers;
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateQRCode(text) {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(text, { margin: 1 });
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    await logError(error, { function: 'generateQRCode', text: text });
    throw error;
  }
}

async function getWeather(location) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.weatherApiKey}&units=metric&lang=ru`
    );
    const weather = response.data;
    
    const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString('ru-RU', {timeStyle: 'short'});
    const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString('ru-RU', {timeStyle: 'short'});
    
    return `🌤 Подробный прогноз погоды в ${weather.name}:
    
🌡 Температура:
  • Сейчас: ${weather.main.temp}°C
  • Ощущается как: ${weather.main.feels_like}°C

💧 Влажность: ${weather.main.humidity}%
☁️ Облачность: ${weather.clouds.all}%
🌬 Ветер: ${weather.wind.speed} м/с, направление: ${getWindDirection(weather.wind.deg)}

🌅 Восход: ${sunrise}
🌇 Закат: ${sunset}

📝 Описание: ${weather.weather[0].description}`;
  } catch (error) {
    await logError(error, { function: 'getWeather', location: location });
    console.error('Weather API error:', error);
    return 'Не удалось получить данные о погоде. Проверьте название места.';
  }
}

function getWindDirection(degrees) {
  const directions = ['северный', 'северо-восточный', 'восточный', 'юго-восточный', 'южный', 'юго-западный', 'западный', 'северо-западный'];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeText = `👋 Привет, ${msg.from.first_name || 'пользователь'}! Я бот NOOTB.\n\n` +
    'Я могу:\n' +
    '🔹 Генерировать коды и QR-коды\n' +
    '🔹 Показывать погоду\n' +
    '🔹 Размещать контент в Terminal на сайте NOOTCTS\n' +
    'Используй /help для получения информации и команд.\n\n' +
    'Автор: @NOOT3546\n' +
    'ТГК Автора: @NOOTISGONEWILD';
  
  bot.sendMessage(chatId, welcomeText).catch(error => {
    logError(error, { command: '/start', chatId: chatId, user: msg.from });
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = '🆘 Помощь по боту NOOTB:\n\n' +
    '/generate - Генератор кодов и QR-кодов\n' +
    '/weather - Погода по местоположению\n' +
    '/nootcts - Разместить контент в Terminal на сайте NOOTCTS\n' +
    '/start - Приветственное сообщение\n' +
    'Для технической поддержки обращайтесь к @NOOT3546';
  
  bot.sendMessage(chatId, helpText).catch(error => {
    logError(error, { command: '/help', chatId: chatId, user: msg.from });
  });
});

bot.onText(/\/generate/, (msg) => {
  const chatId = msg.chat.id;
  
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '🔢 Генератор кодов', callback_data: 'code_generator' }],
        [{ text: '📷 Генератор QR-кодов', callback_data: 'qr_generator' }]
      ]
    })
  };
  
  bot.sendMessage(chatId, 'Выберите тип генерации:', options).catch(error => {
    logError(error, { command: '/generate', chatId: chatId, user: msg.from });
  });
});

bot.onText(/\/weather/, (msg) => {
  const chatId = msg.chat.id;
  sendMessageWithAutoDelete(chatId, 'Введите название города для получения прогноза погоды:').catch(error => {
    logError(error, { command: '/weather', chatId: chatId, user: msg.from });
  });
  
  bot.once('message', async (response) => {
    const city = response.text;
    try {
      const weatherInfo = await getWeather(city);
      bot.sendMessage(chatId, weatherInfo).catch(error => {
        logError(error, { command: '/weather response', chatId: chatId, city: city });
      });
    } catch (error) {
      sendMessageWithAutoDelete(chatId, 'Произошла ошибка при получении данных о погоде. Пожалуйста, проверьте название города и попробуйте еще раз.').catch(e => {
        logError(e, { command: '/weather error', chatId: chatId, city: city, originalError: error });
      });
    }
  });
});

bot.onText(/\/nootcts/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  
  if (!username) {
    return sendMessageWithAutoDelete(chatId, '❌ Для использования этой функции вам необходимо установить username в настройках Telegram.').catch(error => {
      logError(error, { command: '/nootcts', chatId: chatId, user: msg.from });
    });
  }
  
  const bans = readData('bans');
  if (bans.includes(username)) {
    return sendMessageWithAutoDelete(chatId, '❌ Вы заблокированы и не можете размещать контент. Обратитесь к @NOOT3546 для разблокировки.').catch(error => {
      logError(error, { command: '/nootcts banned', chatId: chatId, user: msg.from });
    });
  }
  
  const users = readData('users');
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    const registerOptions = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '✅ Зарегистрироваться', callback_data: `register_${userId}` }]
        ]
      })
    };
    
    return bot.sendMessage(chatId, 'Для размещения контента на Termial необходимо зарегистрироваться.', registerOptions).catch(error => {
      logError(error, { command: '/nootcts registration', chatId: chatId, user: msg.from });
    });
  }
  
  const today = new Date().toISOString().split('T')[0];
  const userPostsToday = readData('posts').filter(post => 
    post.userId === userId && post.date.startsWith(today)
  ).length;
  
  if (userPostsToday >= config.maxPostsPerDay) {
    return sendMessageWithAutoDelete(chatId, `❌ Вы превысили лимит в ${config.maxPostsPerDay} постов в день.`).catch(error => {
      logError(error, { command: '/nootcts limit', chatId: chatId, user: msg.from, postsToday: userPostsToday });
    });
  }
  
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '📝 Текст', callback_data: 'post_text' }],
        [{ text: '🖼 Фото', callback_data: 'post_photo' }],
        [{ text: '🎥 Видео', callback_data: 'post_video' }],
        [{ text: '🎧 Аудио', callback_data: 'post_audio' }]
      ]
    })
  };
  
  bot.sendMessage(chatId, 'Что вы хотите разместить на Terminal?', options).catch(error => {
    logError(error, { command: '/nootcts menu', chatId: chatId, user: msg.from });
  });
});

bot.onText(/\/ban (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const targetUsername = match[1].replace('@', '');
  
  if (!username) {
    return sendMessageWithAutoDelete(chatId, '❌ Для использования этой команды вам необходимо установить username в настройках Telegram.').catch(error => {
      logError(error, { command: '/ban', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  if (!config.adminUsernames.includes(username)) {
    return sendMessageWithAutoDelete(chatId, '❌ У вас нет прав для выполнения этой команды.').catch(error => {
      logError(error, { command: '/ban unauthorized', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  const bans = readData('bans');
  if (bans.includes(targetUsername)) {
    return sendMessageWithAutoDelete(chatId, '❌ Этот пользователь уже заблокирован.').catch(error => {
      logError(error, { command: '/ban already', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  bans.push(targetUsername);
  writeData('bans', bans);
  
  bot.sendMessage(chatId, `✅ Пользователь @${targetUsername} заблокирован.`).catch(error => {
    logError(error, { command: '/ban success', chatId: chatId, user: msg.from, target: targetUsername });
  });
});

bot.onText(/\/unban (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const targetUsername = match[1].replace('@', '');
  
  if (!username) {
    return sendMessageWithAutoDelete(chatId, '❌ Для использования этой команды вам необходимо установить username в настройках Telegram.').catch(error => {
      logError(error, { command: '/unban', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  if (!config.adminUsernames.includes(username)) {
    return sendMessageWithAutoDelete(chatId, '❌ У вас нет прав для выполнения этой команды.').catch(error => {
      logError(error, { command: '/unban unauthorized', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  const bans = readData('bans');
  if (!bans.includes(targetUsername)) {
    return sendMessageWithAutoDelete(chatId, '❌ Этот пользователь не заблокирован.').catch(error => {
      logError(error, { command: '/unban not banned', chatId: chatId, user: msg.from, target: targetUsername });
    });
  }
  
  writeData('bans', bans.filter(u => u !== targetUsername));
  bot.sendMessage(chatId, `✅ Пользователь @${targetUsername} разблокирован.`).catch(error => {
    logError(error, { command: '/unban success', chatId: chatId, user: msg.from, target: targetUsername });
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const userId = query.from.id;
  const username = query.from.username;
  
  try {
    if (data === 'code_generator') {
      const difficultyOptions = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Лёгкий (строчные буквы)', callback_data: 'difficulty_easy' }],
            [{ text: 'Средний (строчные + цифры)', callback_data: 'difficulty_medium' }],
            [{ text: 'Сложный (строчные + заглавные + цифры)', callback_data: 'difficulty_hard' }],
            [{ text: 'Невозможный (строчные + заглавные + цифры + символы)', callback_data: 'difficulty_impossible' }]
          ]
        })
      };
      
      await bot.editMessageText('Выберите сложность кода:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: difficultyOptions.reply_markup
      });
    }
    else if (data.startsWith('difficulty_')) {
      const difficulty = data.split('_')[1];
      
      const lengthOptions = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '16 символов', callback_data: `length_16_${difficulty}` }],
            [{ text: '32 символа', callback_data: `length_32_${difficulty}` }],
            [{ text: '64 символа', callback_data: `length_64_${difficulty}` }],
            [{ text: '128 символов', callback_data: `length_128_${difficulty}` }],
            [{ text: '256 символов', callback_data: `length_256_${difficulty}` }]
          ]
        })
      };
      
      await bot.editMessageText('Выберите длину кода:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: lengthOptions.reply_markup
      });
    }
    else if (data.startsWith('length_')) {
      const [_, length, difficulty] = data.split('_');
      const code = generateCode(parseInt(length), difficulty);
      
      await bot.editMessageText(`🔐 Ваш сгенерированный код:\n\n\`${code}\``, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown'
      });
    }
    else if (data === 'qr_generator') {
      await bot.editMessageText('Отправьте мне текст или ссылку, для которой нужно создать QR-код:', {
        chat_id: chatId,
        message_id: messageId
      });
      
      bot.once('message', async (msg) => {
        if (msg.text && !msg.text.startsWith('/')) {
          const text = msg.text;
          try {
            const qrCode = await generateQRCode(text);
            await bot.sendPhoto(chatId, qrCode, {
              caption: `QR-код для: ${text}`
            });
          } catch (error) {
            await sendMessageWithAutoDelete(chatId, 'Произошла ошибка при генерации QR-кода. Пожалуйста, попробуйте еще раз.');
          }
        }
      });
    }
    else if (data.startsWith('register_')) {
      const users = readData('users');
      const registeringUserId = parseInt(data.split('_')[1]);
      
      if (!username) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Для регистрации вам необходимо установить username в настройках Telegram!' });
        return await bot.editMessageText('❌ Для регистрации вам необходимо установить username в настройках Telegram.', {
          chat_id: chatId,
          message_id: messageId
        });
      }
      
      if (users.some(u => u.id === registeringUserId)) {
        return bot.answerCallbackQuery(query.id, { text: 'Вы уже зарегистрированы!' });
      }
      
      users.push({
        id: registeringUserId,
        username: username,
        firstName: query.from.first_name || '',
        lastName: query.from.last_name || '',
        registeredAt: new Date().toISOString()
      });
      
      writeData('users', users);
      
      await bot.answerCallbackQuery(query.id, { text: '✅ Регистрация успешна!' });
      await bot.editMessageText('✅ Вы успешно зарегистрированы. Теперь вы можете размещать контент на Terminal.', {
        chat_id: chatId,
        message_id: messageId
      });
    }
    else if (data.startsWith('post_')) {
      const postType = data.split('_')[1];
      
      if (!username) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Для размещения постов вам необходимо установить username в настройках Telegram!' });
        return await bot.editMessageText('❌ Для размещения постов вам необходимо установить username в настройках Telegram.', {
          chat_id: chatId,
          message_id: messageId
        });
      }
      
      if (postType === 'text') {
        await bot.editMessageText('Введите текст для размещения на Terminal (максимум 1000 символов):', {
          chat_id: chatId,
          message_id: messageId
        });
        
        bot.once('message', async (msg) => {
          if (msg.text && !msg.text.startsWith('/')) {
            if (msg.text.length > config.maxTextLength) {
              return sendMessageWithAutoDelete(chatId, `❌ Превышен лимит в ${config.maxTextLength} символов.`);
            }
            
            createPost({
              type: 'text',
              content: msg.text,
              userId: msg.from.id,
              username: msg.from.username,
              caption: null
            }, chatId);
          }
        });
      } else {
        await bot.editMessageText(`Отправьте ${getMediaTypeName(postType)}. Вы можете добавить подпись (максимум 1000 символов).`, {
          chat_id: chatId,
          message_id: messageId
        });
        
        bot.once('message', async (msg) => {
          if (!msg.from.username) {
            return sendMessageWithAutoDelete(chatId, '❌ Для размещения постов вам необходимо установить username в настройках Telegram.');
          }
          
          if (msg[postType]) {
            let fileId;
            if (postType === 'photo') {
              fileId = msg.photo[msg.photo.length - 1].file_id;
            } else {
              fileId = msg[postType].file_id;
            }
            
            const caption = msg.caption && msg.caption.length <= 1000 ? msg.caption : null;
            
            createPost({
              type: postType,
              content: fileId,
              userId: msg.from.id,
              username: msg.from.username,
              caption: caption
            }, chatId);
          }
        });
      }
    }
    else if (data.startsWith('delete_')) {
      const postId = data.split('_')[1];
      const posts = readData('posts');
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        return bot.answerCallbackQuery(query.id, { text: 'Пост не найден!' });
      }
      
      if (posts[postIndex].userId !== userId && !config.adminUsernames.includes(username)) {
        return bot.answerCallbackQuery(query.id, { text: 'Вы не можете удалить этот пост!' });
      }
      
      posts.splice(postIndex, 1);
      writeData('posts', posts);
      
      await bot.answerCallbackQuery(query.id, { text: 'Пост удален!' });
      await bot.editMessageText('Пост успешно удален с Terminal.', {
        chat_id: chatId,
        message_id: messageId
      });
    }
  } catch (error) {
    const errorId = await logError(error, {
      callback_data: data,
      chatId: chatId,
      userId: userId,
      username: username
    });
    
    sendMessageWithAutoDelete(chatId, `Произошла ошибка (ID: ${errorId}). Пожалуйста, попробуйте еще раз или обратитесь к @NOOT3546.`);
  }
});

async function createPost(postData, chatId) {
  try {
    postData.id = Date.now().toString();
    postData.date = new Date().toISOString();
    
if (postData.type !== 'text') {
  try {
    const fileLink = await bot.getFileLink(postData.content);
    postData.content = fileLink;
  } catch (error) {
    console.error('Error getting file link:', error);
    // Сохраняем fileId как есть, если не удалось получить ссылку
    postData.content = `file_id:${postData.content}`;
  }
}
    
    const posts = readData('posts');
    posts.push(postData);
    writeData('posts', posts);
    
    const deleteOptions = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '❌ Удалить пост', callback_data: `delete_${postData.id}` }]
        ]
      })
    };
    
    bot.sendMessage(chatId, '✅ Контент успешно размещен на Trminal!\n\n' +
      `Ссылка: noot3546.github.io/NOOTCTS/terminal.html`, deleteOptions).catch(error => {
      logError(error, { function: 'createPost success', postData: postData, chatId: chatId });
    });
  } catch (error) {
    const errorId = await logError(error, {
      function: 'createPost',
      postData: postData,
      chatId: chatId
    });
    
    sendMessageWithAutoDelete(chatId, `❌ Ошибка создания поста (ID: ${errorId}). Пожалуйста, попробуйте позже.`);
  }
}

function getMediaTypeName(type) {
  switch (type) {
    case 'photo': return 'фото';
    case 'video': return 'видео';
    case 'audio': return 'аудио';
    default: return 'файл';
  }
}

app.get('/api/posts', (req, res) => {
  try {
    const posts = readData('posts');
    res.json(posts);
  } catch (error) {
    logError(error, { endpoint: '/api/posts' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/delete', async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const posts = readData('posts');
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (posts[postIndex].userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    posts.splice(postIndex, 1);
    writeData('posts', posts);
    
    res.json({ success: true });
  } catch (error) {
    const errorId = await logError(error, { endpoint: '/api/delete', body: req.body });
    res.status(500).json({ error: 'Internal server error', errorId: errorId });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = readData('users');
    const statuses = readData('user_statuses');
    res.json(statuses.map(u => ({
      username: u.username,
      photo_url: `https://t.me/i/userpic/320/${u.username}.jpg`,
      status: u.status
    })));
  } catch (error) {
    logError(error, { endpoint: '/api/users' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile', (req, res) => {
  try {
    const username = req.headers['x-username'];
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    // Проверяем, существует ли пользователь
    const users = readData('users');
    const user = users.find(u => u.username === username);
    
    if (!user) {
      // Возвращаем одинаковый ответ для существующих/несуществующих пользователей
      // для предотвращения перебора
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Возвращаем только публичные данные
    const publicData = {
      username: user.username,
      firstName: user.firstName,
      registeredAt: user.registeredAt,
      postsCount: readData('posts').filter(p => p.username === username).length
    };
    
    res.json(publicData);
  } catch (error) {
    logError(error, { endpoint: '/api/profile', headers: req.headers });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages', (req, res) => {
  try {
    const username = req.headers['x-username'];
    const other = req.query.user;
    const messages = readData('messages');
    const relevant = messages.filter(m => (m.from === username && m.to === other) || (m.from === other && m.to === username));
    res.json(relevant);
  } catch (error) {
    logError(error, { endpoint: '/api/messages', query: req.query, headers: req.headers });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const username = req.headers['x-username'];
    
    // Проверяем существует ли пользователь
    const users = readData('users');
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' }); // 401 вместо 500
    }
    
    // Остальная логика...
  } catch (error) {
    const errorId = await logError(error, { 
      endpoint: '/api/messages', 
      body: req.body, 
      headers: req.headers 
    });
    res.status(500).json({ error: 'Internal server error', errorId: errorId });
  }
});

app.get('/api/error/:id', (req, res) => {
  try {
    const errors = readData('errors');
    const error = errors.find(e => e.id === req.params.id);
    if (!error) return res.status(404).json({ error: 'Error not found' });
    res.json(error);
  } catch (error) {
    logError(error, { endpoint: '/api/error/' + req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen('https://noot3546.github.io/NOOTCTS/', () => {
  console.log(`Сервер запущен`);
});

console.log('Бот NOOTB запущен...');
