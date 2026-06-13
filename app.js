document.addEventListener('DOMContentLoaded', () => {
  const els = {
    themeBtn: document.getElementById('theme-toggle'),
    name: document.getElementById('user-name'),
    headline: document.getElementById('user-headline'),
    location: document.getElementById('user-location'),
    institution: document.getElementById('user-institution'),
    connections: document.getElementById('connection-counter'),
    pollSection: document.getElementById('job-poll-section'),
    pollYes: document.getElementById('poll-yes-btn'),
    pollNo: document.getElementById('poll-no-btn'),
    pollStatus: document.getElementById('poll-status-msg'),
    pollGreeting: document.getElementById('poll-greeting-name'),
    feed: document.getElementById('posts-container'),
    reloadBtn: document.getElementById('reload-posts-btn'),
    postModal: document.getElementById('post-modal'),
    postTextarea: document.getElementById('post-textarea'),
    publishBtn: document.getElementById('publish-post-btn'),
    settingsModal: document.getElementById('profile-dropdown-modal')
  };

  let state = {
    name: localStorage.getItem('lk_name') || 'Emilio Josué Castillo Flores',
    headline: localStorage.getItem('lk_headline') || '--',
    location: localStorage.getItem('lk_location') || 'Quito, Pichincha',
    institution: localStorage.getItem('lk_institution') || 'Universidad Internacional del Ecuador',
    connections: parseInt(localStorage.getItem('lk_connections')) || 0,
    pollVoted: localStorage.getItem('lk_poll_voted') || 'false'
  };

  const getInitials = (fullName) => {
    return fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  function updateUI() {
    els.name.innerText = state.name;
    els.headline.innerText = state.headline;
    els.location.innerText = state.location;
    els.institution.innerText = state.institution;
    els.connections.innerText = state.connections;
    els.pollGreeting.innerText = state.name.split(' ')[0];

    const initials = getInitials(state.name);
    document.querySelectorAll('.no-profile-photo-mini, .nav-profile-avatar, .create-post-top .mini-avatar, .post-modal-user .mini-avatar')
      .forEach(el => {
        el.innerText = initials;
        el.style.backgroundColor = 'var(--hover-bg)';
      });
  }

  const toggleModal = (modal, show) => modal.classList.toggle('show', show);

  document.getElementById('profile-dropdown-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('input-name').value = state.name;
    document.getElementById('input-headline').value = state.headline === '--' ? '' : state.headline;
    document.getElementById('input-location').value = state.location;
    document.getElementById('input-institution').value = state.institution;
    toggleModal(els.settingsModal, true);
  });

  document.getElementById('save-settings-btn').addEventListener('click', () => {
    state.name = document.getElementById('input-name').value.trim() || 'Emilio Josué Castillo Flores';
    state.headline = document.getElementById('input-headline').value.trim() || '--';
    state.location = document.getElementById('input-location').value.trim() || 'Quito, Pichincha';
    state.institution = document.getElementById('input-institution').value.trim() || 'Universidad Internacional del Ecuador';
    
    Object.keys(state).forEach(k => localStorage.setItem(`lk_${k}`, state[k]));
    updateUI();
    toggleModal(els.settingsModal, false);
  });

  document.getElementById('cancel-settings-btn').addEventListener('click', () => toggleModal(els.settingsModal, false));
  document.getElementById('close-dropdown-modal-btn').addEventListener('click', () => toggleModal(els.settingsModal, false));

  els.themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      els.themeBtn.innerText = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      els.themeBtn.innerText = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  });

  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    els.themeBtn.innerText = '☀️';
  }

  if (localStorage.getItem('lk_poll_closed') === 'true') {
    els.pollSection.style.display = 'none';
  } else if (state.pollVoted !== 'false') {
    showPollVotedMsg(state.pollVoted);
  }

  document.getElementById('close-poll-btn').addEventListener('click', () => {
    els.pollSection.style.display = 'none';
    localStorage.setItem('lk_poll_closed', 'true');
  });

  function showPollVotedMsg(choice) {
    document.getElementById('poll-actions-container').style.display = 'none';
    els.pollStatus.innerText = `✓ Votaste: ${choice}. Tu respuesta se guardó de forma privada.`;
    els.pollStatus.style.display = 'block';
  }

  function registerVote(choice) {
    state.pollVoted = choice;
    localStorage.setItem('lk_poll_voted', choice);
    showPollVotedMsg(choice);
  }

  els.pollYes.addEventListener('click', () => registerVote('Sí'));
  els.pollNo.addEventListener('click', () => registerVote('No'));

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.follow-action-btn, .btn-follow-toggle');
    if (btn) {
      const isFollowing = btn.classList.toggle('following');
      btn.classList.toggle('connected', isFollowing);
      const name = btn.getAttribute('data-name') || btn.getAttribute('data-entity');

      if (btn.classList.contains('btn-follow-toggle')) {
        btn.innerText = isFollowing ? 'Siguiendo' : '+ Seguir';
      } else {
        btn.innerHTML = isFollowing ? '✓ Siguiendo' : '➕ Seguir';
        if (name !== 'Claude' && name !== 'EMBUTIDOS LA VIENESA') {
          state.connections += isFollowing ? 1 : -1;
          localStorage.setItem('lk_connections', state.connections);
          updateUI();
        }
      }
    }
  });

  const setupDrawer = (headerId, drawerId, toggleId) => {
    const header = document.getElementById(headerId);
    const drawer = document.getElementById(drawerId);
    const toggle = document.getElementById(toggleId);
    if (header && drawer) {
      header.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        if (toggle) toggle.innerText = isOpen ? '▼' : '▲';
      });
    }
  };
  setupDrawer('chat-header-manuel', 'chat-tab-manuel', 'chat-toggle-size-manuel');

  const msgTextarea = document.getElementById('chat-textarea-manuel');
  const msgMessages = document.getElementById('chat-messages-manuel');

  function sendChatMsg() {
    const text = msgTextarea.value.trim();
    if (!text) return;
    msgTextarea.value = '';

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appendBubble(text, time, 'sent');

    setTimeout(() => {
      let replyText = "¡Excelente! Nos vemos en clases el lunes.";
      if (text.toLowerCase().includes('hola') || text.toLowerCase().includes('buen')) {
        replyText = "¡Hola Emilio! ¿Cómo vas con las tareas de la UIDE?";
      } else if (text.toLowerCase().includes('uide') || text.toLowerCase().includes('universidad')) {
        replyText = "La UIDE tiene un campus muy chévere. Suerte con las materias de este ciclo.";
      }
      appendBubble(replyText, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 'received');
    }, 1200);
  }

  function appendBubble(content, time, type) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    bubble.innerHTML = `<p>${content}</p><span class="chat-time">${time}</span>`;
    msgMessages.appendChild(bubble);
    msgMessages.scrollTop = msgMessages.scrollHeight;
  }

  document.getElementById('send-chat-btn-manuel').addEventListener('click', sendChatMsg);
  msgTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMsg();
    }
  });

  let databasePosts = [];

  const getSkeletonHTML = () => `
    <div class="skeleton-post">
      <div class="skeleton-header">
        <div class="skeleton-avatar shimmer"></div>
        <div class="skeleton-header-text">
          <div class="skeleton-line shimmer title-line"></div>
          <div class="skeleton-line shimmer subtitle-line"></div>
        </div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-line shimmer body-line"></div>
        <div class="skeleton-line shimmer body-line short-line"></div>
      </div>
    </div>
  `;

  async function loadPosts() {
    els.feed.innerHTML = getSkeletonHTML() + getSkeletonHTML();
    els.reloadBtn.disabled = true;

    try {
      const response = await fetch('posts.json');
      if (!response.ok) throw new Error('API Error');
      databasePosts = await response.json();

      setTimeout(() => {
        renderPosts(databasePosts);
        els.reloadBtn.disabled = false;
      }, 1500);
    } catch (e) {
      els.feed.innerHTML = `<p style="padding:16px;text-align:center;color:red;">Error al cargar publicaciones.</p>`;
      els.reloadBtn.disabled = false;
    }
  }

  function renderPosts(posts) {
    els.feed.innerHTML = '';
    posts.forEach(post => {
      const initials = getInitials(post.author);
      let colorClass = `color-avatar-${(post.id % 3) + 1}`;
      if (post.id === 0) colorClass = 'color-avatar-default';

      const card = document.createElement('div');
      card.className = 'post-item';
      card.innerHTML = `
        <div class="post-header">
          <div class="post-author-info">
            <div class="post-avatar-initials ${colorClass}">${initials}</div>
            <div class="post-author-meta">
              <span class="post-author-name">${post.author}</span>
              <span class="post-author-title">${post.title}</span>
              <div class="post-time-row"><span>${post.time}</span></div>
            </div>
          </div>
          <button style="color:var(--text-muted);">•••</button>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-stats">
          <div class="post-reactions"><span class="react-circle react-like">👍</span><span>${post.likes}</span></div>
          <div><span>${post.comments} comentarios</span></div>
        </div>
        <div class="post-actions">
          <button class="action-btn" onclick="toggleLike(this)">👍 Reaccionar</button>
          <button class="action-btn" onclick="alert('Comentarios simulados.')">💬 Comentar</button>
          <button class="action-btn" onclick="alert('Enlace compartido.')">📤 Compartir</button>
        </div>
      `;
      els.feed.appendChild(card);
    });
  }

  els.reloadBtn.addEventListener('click', loadPosts);

  openPostModalBtn.addEventListener('click', () => {
    toggleModal(els.postModal, true);
    els.postTextarea.focus();
  });

  document.getElementById('close-post-modal-btn').addEventListener('click', () => toggleModal(els.postModal, false));
  els.postTextarea.addEventListener('input', () => els.publishBtn.disabled = els.postTextarea.value.trim().length === 0);

  els.publishBtn.addEventListener('click', () => {
    const text = els.postTextarea.value.trim();
    if (!text) return;
    toggleModal(els.postModal, false);

    els.feed.innerHTML = getSkeletonHTML() + els.feed.innerHTML;

    setTimeout(() => {
      databasePosts.unshift({
        id: Date.now(),
        author: state.name,
        title: `${state.headline !== '--' ? state.headline : 'Estudiante'} @ ${state.institution}`,
        time: 'Ahora',
        content: text,
        likes: 0,
        comments: 0
      });
      renderPosts(databasePosts);
    }, 1000);
  });

  window.toggleLike = (btn) => {
    const active = btn.classList.toggle('active');
    const stats = btn.closest('.post-item').querySelector('.post-reactions span:last-child');
    let likes = parseInt(stats.innerText);
    stats.innerText = likes + (active ? 1 : -1);
    btn.style.color = active ? 'var(--primary-color)' : '';
  };

  updateUI();
  loadPosts();
});
