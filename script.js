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
