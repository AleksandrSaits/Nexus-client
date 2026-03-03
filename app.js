const SUPABASE_URL = 'https://rfvdszroylnsdofgxkcv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_At3m6Dx9d-nU8YJvOL9YOw_1EprjJd6';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === ГЛОБАЛЬНЫЕ ===
let currentUser = null;
let postPhotoData = null;
let newBannerData = null;
let newAvatarData = null;
let tempAvatarEmoji = null;
let clanChatInterval = null;
let currentFeed = 'all';
let currentPostId = null;
let repostPostId = null;
let currentProfileUser = null;
let selectedBanner = 'default';

let registrationData = {
    realName: '', email: '', password: '', verificationCode: '',
    clan: 'Клан [owner]-а', avatarPreset: '👑', avatarUrl: null, banner: 'default'
};

const emojis = ['👑','💀','👻','🤖','👽','🎭','⚡','🔥','💎','🌙','☠️','🦾','👁️','🌀','🗝️','🧬','💊','🎯','🏴','🚫'];

const avatarPresets = [
    { emoji: '👑', color: '#ff0000' },
    { emoji: '💀', color: '#ff4757' },
    { emoji: '🤖', color: '#00d9ff' },
    { emoji: '👽', color: '#9933ff' },
    { emoji: '👁️', color: '#ffaa00' }
];

// === 13 КЛАНОВ ===
const clans = [
    { name: 'Клан [owner]-а', desc: 'Элита сервера', icon: '👑', color: '#ff0000', isOwner: true },
    { name: 'Клан [Защитники]', desc: 'Щит сообщества', icon: '🛡️', color: '#4a90e2' },
    { name: 'Клан [Атакующие]', desc: 'Сила и мощь', icon: '⚔️', color: '#e74c3c' },
    { name: 'Клан [Теневые личности]', desc: 'Невидимые, но влиятельные', icon: '🌑', color: '#9b59b6' },
    { name: 'Клан [Забытые]', desc: 'Из пепла восставшие', icon: '🔥', color: '#e67e22' },
    { name: 'Клан [Кодеры]', desc: 'Архитекторы реальности', icon: '💻', color: '#2ecc71' },
    { name: 'Клан [Хакеры]', desc: 'Взломщики систем', icon: '🔓', color: '#1abc9c' },
    { name: 'Клан [Анонимы]', desc: 'Без лица, без имени', icon: '🎭', color: '#34495e' },
    { name: 'Клан [Нейросети]', desc: 'Искусственный интеллект', icon: '🧠', color: '#9b59b6' },
    { name: 'Клан [Крипто]', desc: 'Властелины блокчейна', icon: '₿', color: '#f39c12' },
    { name: 'Клан [Фантомы]', desc: 'Призраки сети', icon: '👻', color: '#bdc3c7' },
    { name: 'Клан [Сталкеры]', desc: 'Охотники за данными', icon: '🎯', color: '#e74c3c' },
    { name: 'Клан [Свободные]', desc: 'Без границ и правил', icon: '🕊️', color: '#3498db' }
];

const ADMIN_EMAIL = 'boombl4you@gmail.com';
const OWNER_CLAN = 'Клан [owner]-а';

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('>> NEXUS OWNER EDITION INITIALIZED');
    initMatrixBackground();
    checkAuth();
});

function initMatrixBackground() {
    const container = document.getElementById('matrix-bg');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '0123456789ABCDEF';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let i = 0; i < columns; i++) drops[i] = Math.random() * -100;
    function draw() {
        ctx.fillStyle = 'rgba(5,5,5,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 35);
}

// === АВТОРИЗАЦИЯ ===
window.checkAuth = async function() {
    try {
        const saved = localStorage.getItem('nexus_user');
        if (saved) {
            currentUser = JSON.parse(saved);
            const { data: user, error } = await _supabase
                .from('users')
                .select('*')
                .eq('id', currentUser.id)
                .single();
                
            if (error || !user) {
                localStorage.removeItem('nexus_user');
                showRegistration();
                return;
            }
            currentUser = user;
            localStorage.setItem('nexus_user', JSON.stringify(currentUser));
            showMainScreen();
            
            // Показываем приветствие для новых пользователей
            checkWelcomeModal();
        } else {
            showRegistration();
        }
    } catch (err) {
        console.error('Auth error:', err);
        showRegistration();
    }
};

// === ПРОВЕРКА И ПОКАЗ ПРИВЕТСТВИЯ ===
async function checkWelcomeModal() {
    try {
        // Проверяем, видел ли пользователь приветствие
        const { data: welcome } = await _supabase
            .from('user_welcome')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        // Если не видел или запись отсутствует
        if (!welcome || !welcome.welcomed) {
            // Показываем модальное окно через 1 секунду
            setTimeout(() => {
                showWelcomeModal();
            }, 1000);
            
            // Отмечаем, что показали
            if (welcome) {
                await _supabase
                    .from('user_welcome')
                    .update({ welcomed: true })
                    .eq('user_id', currentUser.id);
            } else {
                await _supabase
                    .from('user_welcome')
                    .insert([{ user_id: currentUser.id, welcomed: true }]);
            }
        }
    } catch (err) {
        console.error('Welcome check error:', err);
    }
}

// === ПОКАЗ ПРИВЕТСТВЕННОГО МОДАЛЬНОГО ОКНА ===
window.showWelcomeModal = function() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.closeWelcomeModal = function() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.showRegistration = function() {
    const reg = document.getElementById('registration-screen');
    const login = document.getElementById('login-screen');
    const main = document.getElementById('main-content');
    if (reg) reg.classList.remove('hidden');
    if (login) login.classList.add('hidden');
    if (main) main.classList.add('hidden');
    showRegStep(1);
    initClanSelector();
    initAvatarPresets();
};

window.showLoginScreen = function() {
    const reg = document.getElementById('registration-screen');
    const login = document.getElementById('login-screen');
    if (reg) reg.classList.add('hidden');
    if (login) login.classList.remove('hidden');
};

function showRegStep(step) {
    document.querySelectorAll('.cyber-reg-step').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(`reg-step-${step}`);
    if (el) el.classList.remove('hidden');
    
    document.querySelectorAll('.cyber-step').forEach(s => {
        s.classList.remove('active', 'completed');
        const n = parseInt(s.dataset.step);
        if (n < step) s.classList.add('completed');
        if (n === step) s.classList.add('active');
    });
    
    const container = document.querySelector('.auth-screen');
    if (container) {
        container.scrollTop = 0;
    }
}

window.registrationStep1 = async function() {
    const realName = document.getElementById('reg-real-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value.trim();
    
    if (!realName || realName.length < 2) { alert('Введите имя'); return; }
    if (!email || !email.includes('@')) { alert('Введите email'); return; }
    if (!password || password.length < 8) { alert('Пароль мин. 8 символов'); return; }
    
    const { data: existing, error } = await _supabase
        .from('users')
        .select('email')
        .eq('email', email);
        
    if (error) { alert('Ошибка: ' + error.message); return; }
    if (existing && existing.length > 0) { alert('Email занят'); return; }
    
    registrationData = { ...registrationData, realName, email, password };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    registrationData.verificationCode = code;
    alert('Код: ' + code);
    
    const info = document.getElementById('reg-email-info');
    if (info) info.textContent = 'Код на ' + email;
    showRegStep(2);
};

window.registrationStep2 = function() {
    const code = document.getElementById('reg-verification-code')?.value.trim();
    if (!code || code !== registrationData.verificationCode) { alert('Неверный код'); return; }
    showRegStep(3);
};

window.resendCode = function() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    registrationData.verificationCode = code;
    alert('Новый код: ' + code);
};

window.registrationStep3 = async function() {
    try {
        let username = registrationData.realName.toLowerCase().replace(/[^a-z0-9а-яё]/g, '') || 'user';
        let counter = 1;
        
        while (true) {
            const { data: ex } = await _supabase
                .from('users')
                .select('username')
                .eq('username', username)
                .single();
                
            if (!ex) break;
            username = username + counter;
            counter++;
            if (counter > 1000) { username = 'user_' + Date.now(); break; }
        }
        
        const isOwner = registrationData.email === ADMIN_EMAIL;
        
        const { data: user, error } = await _supabase
            .from('users')
            .insert([{
                username: username,
                email: registrationData.email,
                real_name: registrationData.realName,
                password_hash: btoa(registrationData.password),
                email_verified: true,
                clan: registrationData.clan,
                emoji: registrationData.avatarPreset,
                avatar_preset: registrationData.avatarPreset,
                avatar_url: registrationData.avatarUrl,
                banner_url: registrationData.banner,
                is_owner: isOwner,
                role: isOwner ? 'owner' : 'user'
            }])
            .select()
            .single();
            
        if (error) { 
            alert('Ошибка: ' + error.message); 
            return; 
        }
        
        currentUser = user;
        localStorage.setItem('nexus_user', JSON.stringify(currentUser));
        alert('✅ Добро пожаловать, ' + (isOwner ? 'OWNER!' : 'пользователь!'));
        showMainScreen();
        
        // Показываем приветствие новому пользователю
        setTimeout(() => {
            showWelcomeModal();
        }, 1000);
        
        // Создаем запись в user_welcome
        await _supabase
            .from('user_welcome')
            .insert([{ user_id: user.id, welcomed: true }]);
            
    } catch (err) {
        alert('Ошибка: ' + err.message);
    }
};

// === КЛАНЫ ===
function initClanSelector() {
    const c = document.getElementById('clan-selector');
    if (!c) return;
    c.innerHTML = '';
    
    clans.forEach(clan => {
        const d = document.createElement('div');
        d.className = 'cyber-clan-option' + (clan.name === registrationData.clan ? ' selected' : '');
        d.style.borderColor = clan.color;
        
        d.onclick = () => { 
            registrationData.clan = clan.name; 
            document.querySelectorAll('.cyber-clan-option').forEach(e => e.classList.remove('selected')); 
            d.classList.add('selected'); 
        };
        
        d.innerHTML = '<div class="cyber-clan-icon" style="color:'+clan.color+'">'+clan.icon+'</div>' +
                     '<div class="cyber-clan-name">'+clan.name+'</div>' +
                     '<div class="cyber-clan-desc">'+clan.desc+'</div>';
        c.appendChild(d);
    });
}

function initAvatarPresets() {
    const c = document.getElementById('avatar-presets');
    if (!c) return;
    c.innerHTML = '';
    
    emojis.forEach(emoji => {
        const d = document.createElement('div');
        d.className = 'cyber-avatar-preset' + (emoji === registrationData.avatarPreset ? ' selected' : '');
        
        d.onclick = () => { 
            registrationData.avatarPreset = emoji; 
            registrationData.avatarUrl = null; 
            document.querySelectorAll('.cyber-avatar-preset').forEach(e => e.classList.remove('selected')); 
            d.classList.add('selected'); 
        };
        
        d.textContent = emoji;
        d.style.borderColor = '#00ff88';
        c.appendChild(d);
    });
}

// === ЗАГРУЗКА АВАТАРА ПРИ РЕГИСТРАЦИИ ===
window.uploadRegistrationAvatar = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
        alert('Макс. 5MB'); 
        return; 
    }
    
    try {
        const ext = file.name.split('.').pop();
        const fn = 'reg_avatar_' + Date.now() + '.' + ext;
        
        const { error: ue } = await _supabase.storage
            .from('user-avatars')
            .upload(fn, file, { cacheControl: '3600', upsert: true });
            
        if (ue) { 
            alert('Ошибка: ' + ue.message); 
            return; 
        }
        
        const { data: ud2 } = _supabase.storage
            .from('user-avatars')
            .getPublicUrl(fn);
            
        registrationData.avatarUrl = ud2?.publicUrl || null;
        registrationData.avatarPreset = null;
        
        alert('✅ Аватар загружен');
    } catch (err) { 
        alert('Ошибка: ' + err.message); 
    }
};

// === OWNER ПРОВЕРКИ ===
function isOwner(user) {
    return user?.email === ADMIN_EMAIL || user?.is_owner === true || user?.role === 'owner';
}

function formatUsername(user, forDisplay = false) {
    if (!user) return 'UNKNOWN';
    if (isOwner(user)) {
        if (forDisplay) return '[owner] ' + user.username;
        return '<span class="owner-username" title="Владелец системы">✓ ' + user.username + '</span>';
    }
    return escapeHtml(user.username);
}

// === ОСНОВНОЙ ЭКРАН ===
window.showMainScreen = function() {
    document.getElementById('registration-screen')?.classList.add('hidden');
    document.getElementById('login-screen')?.classList.add('hidden');
    
    const main = document.getElementById('main-content');
    const nav = document.getElementById('bottom-nav');
    
    if (main) { 
        main.classList.remove('hidden'); 
        main.style.display = 'block'; 
    }
    if (nav) nav.style.display = 'flex';
    
    const adminNav = document.getElementById('admin-nav-item');
    const newsNav = document.getElementById('news-nav-item');
    
    if (adminNav) {
        adminNav.style.display = isOwner(currentUser) ? 'flex' : 'none';
    }
    
    if (newsNav) {
        newsNav.style.display = 'flex'; // Новости видят все
    }
    
    const emoji = document.getElementById('user-emoji');
    const name = document.getElementById('user-name');
    
    if (emoji) {
        if (currentUser.avatar_url) {
            emoji.innerHTML = '<img src="' + currentUser.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
        } else {
            emoji.textContent = currentUser.emoji || currentUser.avatar_preset || '👤';
        }
    }
    
    if (name) {
        if (isOwner(currentUser)) {
            name.innerHTML = '<span class="owner-username">✓ ' + currentUser.username + '</span>';
        } else {
            name.textContent = '@' + currentUser.username;
        }
    }
    
    window.switchTab('feed');
};

window.logout = function() {
    localStorage.removeItem('nexus_user');
    location.reload();
};

// === НАВИГАЦИЯ ===
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.cyber-nav-item').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(tab + '-tab');
    if (target) target.classList.remove('hidden');
    
    const btn = document.querySelector('.cyber-nav-item[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    
    if (tab === 'feed') loadPosts();
    else if (tab === 'clan') loadClanChat();
    else if (tab === 'profile') showProfile(currentUser.id);
    else if (tab === 'admin') showAdminPanel();
    else if (tab === 'news') loadNews();
};

// === ЗАГРУЗКА НОВОСТЕЙ ===
window.loadNews = async function() {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">>> ЗАГРУЗКА НОВОСТЕЙ...</div>';
    
    const { data: news, error } = await _supabase
        .from('news')
        .select('*, users:author_id(username, email, is_owner)')
        .order('created_at', { ascending: false });
    
    if (error) {
        container.innerHTML = '>> ОШИБКА ЗАГРУЗКИ';
        return;
    }
    
    if (!news || news.length === 0) {
        container.innerHTML = '<div class="cyber-post">>> НОВОСТЕЙ ПОКА НЕТ</div>';
        return;
    }
    
    container.innerHTML = '';
    
    news.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cyber-post news-post';
        
        const authorName = item.users ? formatUsername(item.users, true) : 'NEXUS';
        const time = new Date(item.created_at).toLocaleString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let imageHtml = '';
        if (item.image_url) {
            imageHtml = '<div class="cyber-news-image"><img src="' + item.image_url + '" style="width:100%;border-radius:var(--radius-md);"></div>';
        }
        
        div.innerHTML = '<div class="cyber-post-header">' +
            '<div class="cyber-user-identity">' +
            '<div class="cyber-user-avatar">📢</div>' +
            '<span class="cyber-username">' + authorName + '</span>' +
            '</div>' +
            '<span class="cyber-post-time">' + time + '</span>' +
            '</div>' +
            '<h3 style="color:var(--green); margin-bottom:10px;">' + escapeHtml(item.title) + '</h3>' +
            imageHtml +
            '<div class="cyber-post-content" style="white-space:pre-line;">' + escapeHtml(item.content) + '</div>';
        
        container.appendChild(div);
    });
};

// === ЗАГРУЗКА ПОСТОВ ===
window.loadPosts = async function(feedType = 'all') {
    currentFeed = feedType;
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    feed.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    let query = _supabase
        .from('posts')
        .select('*, users:user_id(username, avatar_preset, avatar_url, emoji, clan, email, is_owner, role)')
        .order('created_at', { ascending: false });
    
    const { data: posts, error } = await query;
    
    if (error) { 
        feed.innerHTML = '>> ОШИБКА: ' + error.message; 
        return; 
    }
    
    feed.innerHTML = '';
    
    if (!posts || posts.length === 0) { 
        feed.innerHTML = '<div class="cyber-post">>> НЕТ ПОСТОВ</div>'; 
        return; 
    }
    
    const { data: likes } = await _supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.id);
        
    const liked = likes?.map(l => l.post_id) || [];
    
    let filteredPosts = posts;
    if (feedType === 'clan' && currentUser.clan) {
        filteredPosts = posts.filter(post => post.users?.clan === currentUser.clan);
    }
    
    filteredPosts.forEach(post => {
        const div = createPostElement(post, liked.includes(post.id));
        feed.appendChild(div);
    });
};

// === КНОПКИ ФИЛЬТРА ЛЕНТЫ ===
window.toggleFeedFilter = function(type) {
    document.querySelectorAll('.feed-filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadPosts(type);
};

function createPostElement(post, isLiked) {
    const div = document.createElement('div');
    div.className = 'cyber-post';
    const u = post.users || {};
    
    let av = '';
    if (u.avatar_url) {
        av = '<img src="' + u.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    } else {
        av = u.emoji || u.avatar_preset || '👤';
    }
    
    const avatarHtml = '<div class="cyber-user-avatar">' + 
        (isOwner(u) ? '<span class="owner-badge">✓</span>' : '') + 
        av + '</div>';
    
    let content = '';
    if (post.has_drawing && post.drawing_data) {
        div.classList.add('has-drawing');
        content = '<div class="cyber-post-content">' + escapeHtml(post.content) + '</div>' +
                 '<div class="cyber-photo-display"><img src="' + post.drawing_data + '"></div>';
    } else if (post.audio_url) {
        content = '<div class="cyber-post-content">' + escapeHtml(post.content) + '</div>' +
                 '<div class="cyber-audio-message"><audio controls><source src="' + post.audio_url + '"></audio></div>';
    } else {
        content = '<div class="cyber-post-content">' + escapeHtml(post.content) + '</div>';
    }
    
    const time = new Date(post.created_at).toLocaleString('ru-RU', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const usernameDisplay = formatUsername(u, true);
    
    div.innerHTML = '<div class="cyber-post-header">' +
        '<div class="cyber-user-identity">' +
        avatarHtml +
        '<span class="cyber-username" onclick="showProfile(\'' + (post.user_id || '') + '\')">' + usernameDisplay + '</span>' +
        '</div>' +
        '<span class="cyber-post-time">' + time + '</span>' +
        '</div>' +
        content +
        '<div class="cyber-post-actions">' +
        '<button class="cyber-action-btn like' + (isLiked ? ' liked' : '') + '" onclick="toggleLike(\'' + post.id + '\')">' +
        '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
        '<span>' + (post.likes_count || 0) + '</span>' +
        '</button>' +
        '<button class="cyber-action-btn comment" onclick="openComments(\'' + post.id + '\')">' +
        '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>' +
        '<span>' + (post.comments_count || 0) + '</span>' +
        '</button>' +
        '<button class="cyber-action-btn repost" onclick="openRepost(\'' + post.id + '\')">' +
        '<svg viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>' +
        '<span>' + (post.reposts_count || 0) + '</span>' +
        '</button>' +
        '</div>';
    
    return div;
}

// === ЛАЙКИ ===
window.toggleLike = async function(id) {
    const btn = event.currentTarget;
    const span = btn.querySelector('span');
    const liked = btn.classList.contains('liked');
    
    if (liked) {
        await _supabase
            .from('likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', currentUser.id);
            
        btn.classList.remove('liked');
        span.textContent = parseInt(span.textContent) - 1;
    } else {
        await _supabase
            .from('likes')
            .insert([{ post_id: id, user_id: currentUser.id }]);
            
        btn.classList.add('liked');
        span.textContent = parseInt(span.textContent) + 1;
    }
};

// === КОММЕНТАРИИ ===
window.openComments = async function(id) {
    currentPostId = id;
    const modal = document.getElementById('comments-modal');
    const list = document.getElementById('modal-comments-list');
    
    if (!modal || !list) return;
    
    list.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    const { data: comments } = await _supabase
        .from('comments')
        .select('*, users:user_id(username, avatar_preset, avatar_url, emoji, email, is_owner, role)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });
    
    list.innerHTML = '';
    
    if (!comments || comments.length === 0) { 
        list.innerHTML = '<div class="loading">>> НЕТ КОММЕНТАРИЕВ</div>'; 
    } else {
        comments.forEach(c => {
            const d = document.createElement('div');
            d.className = 'cyber-comment-item';
            
            let av = c.users?.avatar_url 
                ? '<img src="' + c.users.avatar_url + '" style="width:100%;height:100%;border-radius:50%;">' 
                : (c.users?.emoji || c.users?.avatar_preset || '👤');
                
            const avatarHtml = '<div class="cyber-comment-avatar">' + 
                (isOwner(c.users) ? '<span class="owner-badge">✓</span>' : '') + 
                av + '</div>';
            
            d.innerHTML = avatarHtml +
                '<div class="cyber-comment-content">' +
                '<div class="cyber-comment-user">' + formatUsername(c.users, true) + '</div>' +
                '<div class="cyber-comment-text">' + escapeHtml(c.content) + '</div>' +
                '</div>';
                
            list.appendChild(d);
        });
    }
    
    modal.classList.add('active');
};

window.closeComments = function() {
    const m = document.getElementById('comments-modal');
    if (m) m.classList.remove('active');
};

window.sendModalComment = async function() {
    const input = document.getElementById('modal-comment-input');
    const content = input?.value.trim();
    
    if (!content || !currentPostId) return;
    
    await _supabase
        .from('comments')
        .insert([{ 
            post_id: currentPostId, 
            user_id: currentUser.id, 
            content: content 
        }]);
        
    if (input) input.value = '';
    openComments(currentPostId);
};

// === РЕПОСТЫ ===
window.openRepost = function(id) {
    repostPostId = id;
    const m = document.getElementById('repost-modal');
    if (m) m.classList.add('active');
};

window.closeRepost = function() {
    const m = document.getElementById('repost-modal');
    if (m) m.classList.remove('active');
};

window.confirmRepost = async function() {
    if (!repostPostId) return;
    
    await _supabase
        .from('reposts')
        .insert([{ 
            post_id: repostPostId, 
            user_id: currentUser.id 
        }]);
        
    closeRepost();
    alert('>> РЕПОСТ');
    loadPosts();
};

// === ПРОФИЛЬ ===
window.showProfile = async function(userId) {
    const screen = document.getElementById('profile-tab');
    const feed = document.getElementById('profile-feed');
    
    if (!userId || userId === currentUser.id) {
        currentProfileUser = currentUser;
    } else {
        const { data: user } = await _supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (!user) { 
            alert('Не найден'); 
            return; 
        }
        currentProfileUser = user;
    }
    
    const banner = document.getElementById('profile-banner');
    if (banner) {
        if (currentProfileUser.banner_url && currentProfileUser.banner_url.startsWith('http')) {
            banner.style.backgroundImage = 'url(' + currentProfileUser.banner_url + ')';
            banner.style.backgroundSize = 'cover';
            banner.className = 'cyber-profile-header custom-banner';
        } else {
            banner.style.backgroundImage = '';
            banner.className = 'cyber-profile-header ' + (currentProfileUser.banner_url || 'default');
        }
    }
    
    const avatar = document.getElementById('profile-avatar-large');
    if (avatar) {
        let avContent = '';
        if (currentProfileUser.avatar_url) {
            avContent = '<img src="' + currentProfileUser.avatar_url + '" style="width:100%;height:100%;border-radius:50%;">';
        } else {
            avContent = currentProfileUser.emoji || currentProfileUser.avatar_preset || '👤';
        }
        
        if (isOwner(currentProfileUser)) {
            avContent = '<span class="owner-badge-large">✓</span>' + avContent;
        }
        
        avatar.innerHTML = avContent + '<button class="change-avatar-btn" onclick="openAvatarModal()">✎</button>';
    }
    
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) {
        if (isOwner(currentProfileUser)) {
            usernameEl.innerHTML = '<span class="owner-username-large">✓ [owner] ' + currentProfileUser.username + '</span>';
        } else {
            usernameEl.textContent = '@' + currentProfileUser.username;
        }
    }
    
    document.getElementById('profile-real-name').textContent = currentProfileUser.real_name || '';
    document.getElementById('profile-clan').textContent = currentProfileUser.clan || 'Независимый';
    document.getElementById('profile-joined').textContent = 'В сети: ' + new Date(currentProfileUser.created_at).toLocaleDateString('ru-RU');
    
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) editBtn.style.display = (currentProfileUser.id === currentUser.id) ? 'block' : 'none';
    
    const { data: posts } = await _supabase
        .from('posts')
        .select('*')
        .eq('user_id', currentProfileUser.id)
        .order('created_at', { ascending: false });
    
    if (feed) {
        feed.innerHTML = '';
        const cnt = document.getElementById('profile-posts-count');
        if (cnt) cnt.textContent = posts?.length || 0;
        
        if (posts && posts.length > 0) {
            posts.forEach(p => feed.appendChild(createPostElement(p, false)));
        } else {
            feed.innerHTML = '<div class="cyber-post">>> НЕТ ПОСТОВ</div>';
        }
    }
    
    if (screen) screen.classList.remove('hidden');
};

// === ПОСТ МОДАЛКА ===
window.openPostModal = function() {
    const m = document.getElementById('post-modal');
    if (m) { 
        m.classList.add('active'); 
        document.getElementById('modal-post-content')?.focus(); 
    }
};

window.closePostModal = function() {
    const m = document.getElementById('post-modal');
    if (m) { 
        m.classList.remove('active'); 
        document.getElementById('modal-post-content').value = ''; 
        postPhotoData = null; 
        removePhotoPreview(); 
    }
};

window.handlePostPhoto = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
        alert('Макс. 10MB'); 
        return; 
    }
    
    const reader = new FileReader();
    reader.onload = function(ev) { 
        postPhotoData = ev.target.result; 
        showPhotoPreview(ev.target.result); 
    };
    reader.readAsDataURL(file);
};

function showPhotoPreview(url) {
    const p = document.getElementById('photo-preview');
    const img = document.getElementById('preview-img');
    if (p && img) { 
        img.src = url; 
        p.classList.remove('hidden'); 
    }
}

function removePhotoPreview() {
    const p = document.getElementById('photo-preview');
    const i = document.getElementById('post-photo-input');
    if (p) p.classList.add('hidden');
    if (i) i.value = '';
}

window.removePhoto = function() { 
    postPhotoData = null; 
    removePhotoPreview(); 
};

window.createPostFromModal = async function() {
    const el = document.getElementById('modal-post-content');
    const content = el?.value.trim();
    
    if (!content && !postPhotoData) { 
        alert('Текст или фото!'); 
        return; 
    }
    
    let photoUrl = null;
    if (postPhotoData) {
        try {
            const r = await fetch(postPhotoData);
            const blob = await r.blob();
            const fn = 'post_' + Date.now() + '.jpg';
            
            const { error: ue } = await _supabase.storage
                .from('user-avatars')
                .upload(fn, blob, { cacheControl: '3600', upsert: false });
                
            if (!ue) {
                const { data: ud2 } = _supabase.storage
                    .from('user-avatars')
                    .getPublicUrl(fn);
                photoUrl = ud2?.publicUrl || null;
            }
        } catch (err) { 
            console.error(err); 
        }
    }
    
    const { error } = await _supabase
        .from('posts')
        .insert([{ 
            user_id: currentUser.id, 
            content: content || (photoUrl ? '[📷 ФОТО]' : ''), 
            drawing_data: photoUrl, 
            has_drawing: !!photoUrl 
        }]);
        
    if (error) { 
        alert('Ошибка: ' + error.message); 
        return; 
    }
    
    closePostModal();
    loadPosts();
};

// === БАННЕР МОДАЛКА ===
window.openBannerModal = function() { 
    const m = document.getElementById('banner-modal'); 
    if (m) m.classList.add('active'); 
};

window.closeBannerModal = function() { 
    const m = document.getElementById('banner-modal'); 
    if (m) m.classList.remove('active'); 
    newBannerData = null; 
};

window.setBanner = function(b) { 
    newBannerData = b; 
    document.querySelectorAll('.cyber-banner-option').forEach(e => e.classList.remove('selected')); 
    if(event.target) event.target.classList.add('selected'); 
};

window.handleBannerUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
        alert('Макс. 10MB'); 
        return; 
    }
    
    try {
        const ext = file.name.split('.').pop();
        const fn = 'banner_' + currentUser.id + '_' + Date.now() + '.' + ext;
        
        const { error: ue } = await _supabase.storage
            .from('user-avatars')
            .upload(fn, file, { cacheControl: '3600', upsert: true });
            
        if (ue) { 
            alert('Ошибка: ' + ue.message); 
            return; 
        }
        
        const { data: ud2 } = _supabase.storage
            .from('user-avatars')
            .getPublicUrl(fn);
            
        newBannerData = ud2?.publicUrl || null;
        alert('✅ Баннер загружен');
    } catch (err) { 
        alert('Ошибка: ' + err.message); 
    }
};

window.saveBanner = async function() {
    if (!newBannerData) { 
        alert('Выберите баннер'); 
        return; 
    }
    
    const { error } = await _supabase
        .from('users')
        .update({ banner_url: newBannerData })
        .eq('id', currentUser.id);
        
    if (error) { 
        alert('Ошибка: ' + error.message); 
        return; 
    }
    
    currentUser.banner_url = newBannerData;
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    closeBannerModal();
    showProfile(currentUser.id);
    alert('>> БАННЕР ОБНОВЛЁН');
};

// === АВАТАР МОДАЛКА ===
window.openAvatarModal = function() {
    const modal = document.getElementById('avatar-modal');
    const c = document.getElementById('avatar-modal-presets');
    
    if (!modal || !c) return;
    
    c.innerHTML = '';
    
    emojis.forEach(em => {
        const d = document.createElement('div');
        d.className = 'cyber-avatar-preset';
        d.textContent = em;
        
        d.onclick = () => { 
            tempAvatarEmoji = em; 
            newAvatarData = null; 
            c.querySelectorAll('.cyber-avatar-preset').forEach(x => x.classList.remove('selected')); 
            d.classList.add('selected'); 
        };
        
        c.appendChild(d);
    });
    
    tempAvatarEmoji = currentUser.emoji || currentUser.avatar_preset;
    modal.classList.add('active');
};

window.closeAvatarModal = function() { 
    const m = document.getElementById('avatar-modal'); 
    if (m) m.classList.remove('active'); 
    newAvatarData = null; 
    tempAvatarEmoji = null; 
};

window.handleAvatarModalUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { 
        alert('Макс. 5MB'); 
        return; 
    }
    
    try {
        const ext = file.name.split('.').pop();
        const fn = 'avatar_' + currentUser.id + '_' + Date.now() + '.' + ext;
        
        const { error: ue } = await _supabase.storage
            .from('user-avatars')
            .upload(fn, file, { cacheControl: '3600', upsert: true });
            
        if (ue) { 
            alert('Ошибка: ' + ue.message); 
            return; 
        }
        
        const { data: ud2 } = _supabase.storage
            .from('user-avatars')
            .getPublicUrl(fn);
            
        newAvatarData = ud2?.publicUrl || null;
        tempAvatarEmoji = null;
        alert('✅ Аватар загружен');
    } catch (err) { 
        alert('Ошибка: ' + err.message); 
    }
};

window.saveAvatar = async function() {
    if (!newAvatarData && !tempAvatarEmoji) { 
        alert('Выберите аватар'); 
        return; 
    }
    
    const upd = {};
    if (newAvatarData) { 
        upd.avatar_url = newAvatarData; 
        upd.avatar_preset = null; 
        upd.emoji = null; 
    } else { 
        upd.emoji = tempAvatarEmoji; 
        upd.avatar_url = null; 
    }
    
    const { error } = await _supabase
        .from('users')
        .update(upd)
        .eq('id', currentUser.id);
        
    if (error) { 
        alert('Ошибка: ' + error.message); 
        return; 
    }
    
    currentUser = { ...currentUser, ...upd };
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    closeAvatarModal();
    showProfile(currentUser.id);
    alert('>> АВАТАР ОБНОВЛЁН');
};

window.toggleEditProfile = function() { 
    const m = document.getElementById('edit-profile-modal'); 
    if (m) m.classList.toggle('active'); 
};

window.selectBanner = function(b) { 
    selectedBanner = b; 
    document.querySelectorAll('.cyber-banner-option').forEach(e => e.classList.remove('selected')); 
    if (event.target) event.target.classList.add('selected'); 
};

window.saveProfileChanges = async function() {
    const { error } = await _supabase
        .from('users')
        .update({ banner_url: selectedBanner })
        .eq('id', currentUser.id);
        
    if (error) { 
        alert('Ошибка: ' + error.message); 
        return; 
    }
    
    currentUser.banner_url = selectedBanner;
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    toggleEditProfile();
    showProfile(currentUser.id);
    alert('>> ОБНОВЛЕНО');
};

// === ЧАТ КЛАНА ===
window.loadClanChat = async function() {
    const c = document.getElementById('clan-chat-messages');
    const name = document.getElementById('clan-chat-name');
    const icon = document.getElementById('clan-chat-icon');
    const mem = document.getElementById('clan-chat-members');
    
    if (!currentUser.clan) { 
        c.innerHTML = '<div class="loading">>> НЕ В КЛАНЕ</div>'; 
        return; 
    }
    
    const cd = clans.find(x => x.name === currentUser.clan);
    if (cd) { 
        if (name) name.textContent = 'Чат: ' + cd.name; 
        if (icon) icon.textContent = cd.icon; 
    }
    
    const { data: msgs, error } = await _supabase
        .from('clan_messages')
        .select('*, users:user_id(username, emoji, avatar_preset, avatar_url, email, is_owner, role)')
        .eq('clan', currentUser.clan)
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) { 
        c.innerHTML = '>> ОШИБКА'; 
        return; 
    }
    
    if (!msgs || msgs.length === 0) { 
        c.innerHTML = '<div class="loading">>> НЕТ СООБЩЕНИЙ</div>'; 
    } else {
        c.innerHTML = '';
        msgs.reverse().forEach(m => {
            const d = document.createElement('div');
            d.className = 'cyber-chat-message';
            
            let av = m.users?.avatar_url 
                ? '<img src="' + m.users.avatar_url + '" style="width:100%;height:100%;border-radius:50%;">' 
                : (m.users?.emoji || m.users?.avatar_preset || '👤');
                
            const avatarHtml = '<div class="cyber-chat-avatar">' + 
                (isOwner(m.users) ? '<span class="owner-badge">✓</span>' : '') + 
                av + '</div>';
            
            d.innerHTML = avatarHtml +
                '<div class="cyber-chat-content">' +
                '<div class="cyber-chat-user">' + formatUsername(m.users, true) + '</div>' +
                '<div class="cyber-chat-text">' + escapeHtml(m.message) + '</div>' +
                '<div class="cyber-chat-time">' + new Date(m.created_at).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + '</div>' +
                '</div>';
                
            c.appendChild(d);
        });
        c.scrollTop = c.scrollHeight;
    }
    
    const { count } = await _supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clan', currentUser.clan);
        
    if (mem) mem.textContent = (count || 0) + ' участников';
};

window.sendClanMessage = async function() {
    const i = document.getElementById('clan-chat-message');
    const msg = i?.value.trim();
    
    if (!msg || !currentUser.clan) return;
    
    const { error } = await _supabase
        .from('clan_messages')
        .insert([{ 
            user_id: currentUser.id, 
            clan: currentUser.clan, 
            message: msg 
        }]);
        
    if (error) { 
        alert('Ошибка: ' + error.message); 
        return; 
    }
    
    if (i) i.value = '';
    loadClanChat();
};

// === АДМИН ПАНЕЛЬ - С ВОЗМОЖНОСТЬЮ ДОБАВЛЯТЬ НОВОСТИ ===
window.showAdminPanel = async function() {
    if (!isOwner(currentUser)) { 
        alert('❌ ЗАПРЕЩЕНО. Только для OWNER'); 
        return; 
    }
    
    const t = document.getElementById('admin-tab');
    if (!t) return;
    
    t.classList.remove('hidden');
    document.querySelectorAll('.cyber-nav-item').forEach(b => b.classList.remove('active'));
    
    const { count: uc } = await _supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
        
    const { count: pc } = await _supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
        
    const { count: mc } = await _supabase
        .from('clan_messages')
        .select('*', { count: 'exact', head: true });
    
    const { count: nc } = await _supabase
        .from('news')
        .select('*', { count: 'exact', head: true });
    
    document.getElementById('admin-total-users').textContent = uc || 0;
    document.getElementById('admin-total-posts').textContent = pc || 0;
    document.getElementById('admin-total-messages').textContent = mc || 0;
    document.getElementById('admin-total-news').textContent = nc || 0;
    
    const { data: users } = await _supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
    
    const l = document.getElementById('admin-users-list');
    if (l) {
        l.innerHTML = '';
        users?.forEach(u => {
            const d = document.createElement('div');
            d.className = 'cyber-admin-user-item';
            
            const ownerBadge = isOwner(u) ? '<span class="owner-badge-small">✓</span>' : '';
            
            d.innerHTML = '<div class="cyber-admin-user-info">' +
                '<span style="font-size:2rem;">' + (u.emoji || u.avatar_preset || '👤') + '</span>' +
                '<div>' +
                '<div style="font-weight:600;">' + ownerBadge + formatUsername(u, true) + '</div>' +
                '<div style="font-size:0.8rem;color:var(--text-dim);">' + (u.real_name || 'Нет') + '</div>' +
                '<div style="font-size:0.75rem;color:var(--green);">' + (u.clan || 'Независимый') + '</div>' +
                '</div>' +
                '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-dim);">' + new Date(u.created_at).toLocaleDateString('ru-RU') + '</div>';
                
            l.appendChild(d);
        });
    }
    
    // Загружаем список новостей для админа
    loadAdminNews();
};

// === ЗАГРУЗКА НОВОСТЕЙ ДЛЯ АДМИНА ===
async function loadAdminNews() {
    const container = document.getElementById('admin-news-list');
    if (!container) return;
    
    const { data: news } = await _supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
    
    container.innerHTML = '';
    
    if (!news || news.length === 0) {
        container.innerHTML = '<div class="loading">>> НОВОСТЕЙ НЕТ</div>';
        return;
    }
    
    news.forEach(item => {
        const d = document.createElement('div');
        d.className = 'cyber-admin-news-item';
        d.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div><strong>' + escapeHtml(item.title) + '</strong><br>' +
            '<small>' + new Date(item.created_at).toLocaleDateString('ru-RU') + '</small></div>' +
            '<button onclick="deleteNews(\'' + item.id + '\')" style="background:var(--red);color:white;border:none;border-radius:50%;width:30px;height:30px;">✕</button>' +
            '</div>';
        container.appendChild(d);
    });
}

// === СОЗДАНИЕ НОВОСТИ (ДЛЯ OWNER) ===
window.openNewsModal = function() {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.closeNewsModal = function() {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('news-title').value = '';
        document.getElementById('news-content').value = '';
    }
};

window.createNews = async function() {
    const title = document.getElementById('news-title')?.value.trim();
    const content = document.getElementById('news-content')?.value.trim();
    
    if (!title || !content) {
        alert('Введите заголовок и содержание');
        return;
    }
    
    const { error } = await _supabase
        .from('news')
        .insert([{
            title: title,
            content: content,
            author_id: currentUser.id,
            image_url: null
        }]);
    
    if (error) {
        alert('Ошибка: ' + error.message);
        return;
    }
    
    alert('✅ Новость опубликована!');
    closeNewsModal();
    loadAdminNews();
    loadNews(); // Обновляем ленту новостей
};

window.deleteNews = async function(id) {
    if (!confirm('Удалить новость?')) return;
    
    const { error } = await _supabase
        .from('news')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Ошибка: ' + error.message);
        return;
    }
    
    loadAdminNews();
    loadNews();
};

// === УТИЛИТЫ ===
function escapeHtml(t) {
    if (!t) return '';
    return t.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

window.performLogin = async function() {
    const email = document.getElementById('login-email')?.value.trim();
    const pass = document.getElementById('login-password')?.value.trim();
    
    if (!email || !pass) { 
        alert('Введите данные'); 
        return; 
    }
    
    const { data: user, error } = await _supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', btoa(pass))
        .single();
        
    if (error || !user) { 
        alert('Неверный email или пароль'); 
        return; 
    }
    
    currentUser = user;
    localStorage.setItem('nexus_user', JSON.stringify(currentUser));
    showMainScreen();
    
    // Показываем приветствие
    checkWelcomeModal();
};

// Запускаем автообновление чата
function startClanChatAutoRefresh() {
    if (clanChatInterval) clearInterval(clanChatInterval);
    clanChatInterval = setInterval(() => {
        const t = document.getElementById('clan-chat-tab');
        if (t && !t.classList.contains('hidden')) loadClanChat();
    }, 5000);
}

startClanChatAutoRefresh();