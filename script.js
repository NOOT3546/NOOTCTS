document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('posts-container');
  const terminalPostsContainer = document.getElementById('terminal-posts-container');
  let posts = [];
  let currentUser = null;

  // Проверяем, существуют ли контейнеры на текущей странице
  if (!postsContainer && !terminalPostsContainer) {
    console.log('No post containers found on this page');
    return;
  }

  // Функция для определения текущего пользователя
  function getCurrentUser() {
    // Пытаемся получить username из localStorage или других источников
    const username = localStorage.getItem('telegram_username');
    return username ? username.toLowerCase() : null;
  }

  // Функция проверки прав пользователя
  function canDeletePost(post) {
    if (!currentUser) return false;
    
    // Пользователь может удалить свой пост
    if (post.username && post.username.toLowerCase() === currentUser) {
      return true;
    }
    
    // Администраторы могут удалять любые посты
    const adminUsernames = ['noot3546_official', 'noot3546'];
    return adminUsernames.includes(currentUser);
  }

  // Функция загрузки постов
  function loadPosts() {
    fetch('/api/posts')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const sortedPosts = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (JSON.stringify(sortedPosts) !== JSON.stringify(posts)) {
          posts = sortedPosts;
          renderPosts();
        }
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        showError('Ошибка загрузки постов. Пожалуйста, обновите страницу.');
      });
  }

  // Функция отображения ошибки
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #ef9a9a;
    `;
    
    if (postsContainer) {
      postsContainer.prepend(errorDiv);
    }
    if (terminalPostsContainer) {
      terminalPostsContainer.prepend(errorDiv);
    }
    
    // Автоматически удаляем ошибку через 5 секунд
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Функция удаления поста
  function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    const username = getCurrentUser();
    if (!username) {
      showError('Для удаления поста необходимо авторизоваться');
      return;
    }

    fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        postId: postId,
        userId: username // В реальном приложении здесь должен быть ID пользователя
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Удаляем пост из локального массива и перерисовываем
          posts = posts.filter(post => post.id !== postId);
          renderPosts();
          showSuccess('Пост успешно удален');
        } else {
          throw new Error(data.error || 'Неизвестная ошибка');
        }
      })
      .catch(error => {
        console.error('Error deleting post:', error);
        showError('Ошибка удаления поста: ' + error.message);
      });
  }

  // Функция отображения успешного сообщения
  function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #a5d6a7;
    `;
    
    if (postsContainer) {
      postsContainer.prepend(successDiv);
    }
    if (terminalPostsContainer) {
      terminalPostsContainer.prepend(successDiv);
    }
    
    // Автоматически удаляем сообщение через 3 секунды
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  // Функция рендеринга постов
  function renderPosts() {
    // Очищаем только существующие контейнеры
    if (postsContainer) {
      postsContainer.innerHTML = '';
    }
    if (terminalPostsContainer) {
      terminalPostsContainer.innerHTML = '';
    }
    
    if (posts.length === 0) {
      const noPostsMessage = document.createElement('div');
      noPostsMessage.className = 'no-posts';
      noPostsMessage.textContent = 'Пока нет постов. Будьте первым!';
      noPostsMessage.style.cssText = `
        text-align: center;
        padding: 40px;
        color: #666;
        font-style: italic;
      `;
      
      if (postsContainer) {
        postsContainer.appendChild(noPostsMessage);
      }
      if (terminalPostsContainer) {
        terminalPostsContainer.appendChild(noPostsMessage);
      }
      return;
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

  // Функция создания элемента поста
  function createPostElement(post) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.dataset.id = post.id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    
    // Создаем заголовок поста с информацией о пользователе
    const headerDiv = document.createElement('div');
    headerDiv.className = 'post-header';
    
    // Аватарка пользователя
    const avatarImg = document.createElement('img');
    avatarImg.className = 'user-avatar';
    avatarImg.alt = `Аватар ${post.username}`;
    avatarImg.src = `https://t.me/i/userpic/320/${post.username}.jpg`;
    avatarImg.onerror = function() {
      // Запасная аватарка если основная не загрузилась
      this.src = 'https://via.placeholder.com/40/0088cc/ffffff?text=' + (post.username ? post.username[0].toUpperCase() : '?');
    };
    
    // Информация о пользователе
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'user-info';
    
    const usernameLink = document.createElement('a');
    usernameLink.href = `https://t.me/${post.username}`;
    usernameLink.target = '_blank';
    usernameLink.textContent = `@${post.username}`;
    usernameLink.className = 'username';
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'post-date';
    dateSpan.textContent = new Date(post.date).toLocaleString();
    
    userInfoDiv.appendChild(usernameLink);
    userInfoDiv.appendChild(document.createElement('br'));
    userInfoDiv.appendChild(dateSpan);
    
    headerDiv.appendChild(avatarImg);
    headerDiv.appendChild(userInfoDiv);
    
    // Кнопка удаления (если есть права)
    if (canDeletePost(post)) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-post-btn';
      deleteButton.innerHTML = '×';
      deleteButton.title = 'Удалить пост';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        deletePost(post.id);
      };
      headerDiv.appendChild(deleteButton);
    }
    
    contentDiv.appendChild(headerDiv);
    
    // Контент поста
    if (post.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = 'post-text';
      textDiv.innerHTML = formatText(post.content);
      contentDiv.appendChild(textDiv);
    } 
    else if (post.type === 'photo') {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'media-container';
      
      const img = document.createElement('img');
      img.src = post.content;
      img.alt = 'Photo';
      img.className = 'post-media';
      img.onerror = function() {
        this.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'media-error';
        errorMsg.textContent = 'Не удалось загрузить изображение';
        mediaContainer.appendChild(errorMsg);
      };
      mediaContainer.appendChild(img);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        mediaContainer.appendChild(captionDiv);
      }
      
      contentDiv.appendChild(mediaContainer);
    } 
    else if (post.type === 'video') {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'media-container';
      
      const video = document.createElement('video');
      video.controls = true;
      video.className = 'post-media';
      video.preload = 'metadata';
      
      const source = document.createElement('source');
      source.src = post.content;
      source.type = 'video/mp4';
      video.appendChild(source);
      
      const fallbackText = document.createTextNode('Ваш браузер не поддерживает видео. ');
      video.appendChild(fallbackText);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = post.content;
      downloadLink.textContent = 'Скачать видео';
      downloadLink.download = true;
      video.appendChild(downloadLink);
      
      mediaContainer.appendChild(video);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        mediaContainer.appendChild(captionDiv);
      }
      
      contentDiv.appendChild(mediaContainer);
    } 
    else if (post.type === 'audio') {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'media-container';
      
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.className = 'post-media';
      
      const source = document.createElement('source');
      source.src = post.content;
      source.type = 'audio/mpeg';
      audio.appendChild(source);
      
      const fallbackText = document.createTextNode('Ваш браузер не поддерживает аудио. ');
      audio.appendChild(fallbackText);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = post.content;
      downloadLink.textContent = 'Скачать аудио';
      downloadLink.download = true;
      audio.appendChild(downloadLink);
      
      mediaContainer.appendChild(audio);
      
      if (post.caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'post-caption';
        captionDiv.textContent = post.caption;
        mediaContainer.appendChild(captionDiv);
      }
      
      contentDiv.appendChild(mediaContainer);
    }
    
    postElement.appendChild(contentDiv);
    return postElement;
  }

  // Функция форматирования текста
  function formatText(text) {
    if (!text) return '';
    
    // Экранируем HTML
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Находим и заменяем URL
    const urlRegex = /(\b(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?)/gi;
    
    let formatted = escaped.replace(urlRegex, url => {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    
    // Заменяем переносы строк
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  // Инициализация
  function init() {
    currentUser = getCurrentUser();
    
    // Загружаем посты только если есть контейнеры для них
    if (postsContainer || terminalPostsContainer) {
      loadPosts();
      
      // Обновляем посты каждые 5 секунд
      setInterval(loadPosts, 5000);
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
  }

  // Добавляем стили
  const styles = `
    .post {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .post-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      position: relative;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
      object-fit: cover;
    }
    
    .user-info {
      flex: 1;
    }
    
    .username {
      font-weight: bold;
      color: #0088cc;
      text-decoration: none;
    }
    
    .username:hover {
      text-decoration: underline;
    }
    
    .post-date {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .delete-post-btn {
      position: absolute;
      top: 0;
      right: 0;
      background: none;
      border: none;
      font-size: 20px;
      color: #ff4444;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .delete-post-btn:hover {
      background-color: rgba(255, 68, 68, 0.1);
    }
    
    .post-text {
      margin: 12px 0;
      line-height: 1.5;
      word-wrap: break-word;
    }
    
    .post-text a {
      color: #0088cc;
      text-decoration: none;
    }
    
    .post-text a:hover {
      text-decoration: underline;
    }
    
    .media-container {
      margin: 12px 0;
    }
    
    .post-media {
      max-width: 100%;
      border-radius: 4px;
      display: block;
    }
    
    video.post-media,
    audio.post-media {
      width: 100%;
    }
    
    .post-caption {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      color: #666;
      font-style: italic;
    }
    
    .no-posts {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #ef9a9a;
    }
    
    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #a5d6a7;
    }
    
    .media-error {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      border-radius: 4px;
      color: #666;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Запускаем инициализацию
  init();
});
