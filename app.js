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
let notificationsInterval = null;
let currentChatUser = null;
let userSettings = null;

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

// === ТЕМЫ ===
const themes = {
    dark: {
        '--bg': '#050505',
        '--bg-secondary': '#0a0a0a',
        '--bg-card': '#0f0f0f',
        '--text': '#ffffff',
        '--text-dim': '#666666',
        '--border': '#1a1a1a',
        name: 'Тёмная'
    },
    light: {
        '--bg': '#f5f5f5',
        '--bg-secondary': '#ffffff',
        '--bg-card': '#ffffff',
        '--text': '#000000',
        '--text-dim': '#666666',
        '--border': '#dddddd',
        name: 'Светлая'
    },
    cyber: {
        '--bg': '#0a0f0f',
        '--bg-secondary': '#1a1f1f',
        '--bg-card': '#1f2a2a',
        '--text': '#00ff88',
        '--text-dim': '#00aa55',
        '--border': '#00ff88',
        name: 'Кибер'
    }
};

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('>> NEXUS OWNER EDITION INITIALIZED');
    initMatrixBackground();
    checkAuth();
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    if (postId) {
        setTimeout(() => {
            openPostById(postId);
        }, 1500);
    }
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
            
            // Загружаем настройки
            await loadUserSettings();
            
            showMainScreen();
            startNotifications();
            checkWelcomeModal();
        } else {
            showRegistration();
        }
    } catch (err) {
        console.error('Auth error:', err);
        showRegistration();
    }
};

// === ЗАГРУЗКА НАСТРОЕК ===
async function loadUserSettings() {
    const { data: settings } = await _supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
    
    if (settings) {
        userSettings = settings;
        // Применяем тему
        applyTheme(settings.theme || 'dark');
    } else {
        // Создаем настройки по умолчанию
        const { data: newSettings } = await _supabase
            .from('user_settings')
            .insert([{
                user_id: currentUser.id,
                theme: 'dark',
                notifications_enabled: true,
                sound_enabled: true,
                bio: '',
                reactions_enabled: true
            }])
            .select()
            .single();
        
        userSettings = newSettings;
        applyTheme('dark');
    }
}

// === ПРИМЕНЕНИЕ ТЕМЫ ===
function applyTheme(themeName) {
    const theme = themes[themeName] || themes.dark;
    const root = document.documentElement;
    
    Object.keys(theme).forEach(key => {
        if (key !== 'name') {
            root.style.setProperty(key, theme[key]);
        }
    });
    
    localStorage.setItem('nexus_theme', themeName);
}

// === НАСТРОЙКИ ===
window.openSettings = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
        loadSettingsData();
    }
};

window.closeSettings = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

async function loadSettingsData() {
    if (!userSettings) return;
    
    // Тема
    const themeSelect = document.getElementById('settings-theme');
    if (themeSelect) {
        themeSelect.value = userSettings.theme || 'dark';
    }
    
    // Уведомления
    const notificationsCheck = document.getElementById('settings-notifications');
    if (notificationsCheck) {
        notificationsCheck.checked = userSettings.notifications_enabled;
    }
    
    // Звуки
    const soundCheck = document.getElementById('settings-sound');
    if (soundCheck) {
        soundCheck.checked = userSettings.sound_enabled;
    }
    
    // Реакции
    const reactionsCheck = document.getElementById('settings-reactions');
    if (reactionsCheck) {
        reactionsCheck.checked = userSettings.reactions_enabled;
    }
    
    // Био
    const bioInput = document.getElementById('settings-bio');
    if (bioInput) {
        bioInput.value = userSettings.bio || '';
    }
    
    // Загружаем историю входов
    loadLoginHistory();
}

window.saveSettings = async function() {
    const theme = document.getElementById('settings-theme')?.value;
    const notifications = document.getElementById('settings-notifications')?.checked;
    const sound = document.getElementById('settings-sound')?.checked;
    const reactions = document.getElementById('settings-reactions')?.checked;
    const bio = document.getElementById('settings-bio')?.value.trim();
    
    const updates = {
        theme: theme,
        notifications_enabled: notifications,
        sound_enabled: sound,
        reactions_enabled: reactions,
        bio: bio,
        updated_at: new Date()
    };
    
    const { error } = await _supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', currentUser.id);
    
    if (!error) {
        userSettings = { ...userSettings, ...updates };
        applyTheme(theme);
        alert('✅ Настройки сохранены');
        closeSettings();
    } else {
        alert('❌ Ошибка: ' + error.message);
    }
};

// === ИСТОРИЯ ВХОДОВ ===
async function loadLoginHistory() {
    const container = document.getElementById('login-history-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    const { data: history } = await _supabase
        .from('login_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);
    
    container.innerHTML = '';
    
    if (!history || history.length === 0) {
        container.innerHTML = '<div class="loading">>> ИСТОРИЯ ВХОДОВ ПУСТА</div>';
        return;
    }
    
    history.forEach(entry => {
        const d = document.createElement('div');
        d.className = 'login-history-item';
        
        const date = new Date(entry.created_at).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const device = entry.device_info || 'Неизвестное устройство';
        const location = entry.location || 'Неизвестно';
        const ip = entry.ip_address || 'IP скрыт';
        
        d.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem;">🕒</span>
                <div style="flex:1;">
                    <div><strong>${date}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">${device}</div>
                    <div style="font-size:0.7rem; color:var(--text-dim);">📍 ${location} | IP: ${ip}</div>
                </div>
            </div>
        `;
        
        container.appendChild(d);
    });
}

// === СОХРАНЕНИЕ ИСТОРИИ ВХОДА ===
async function saveLoginHistory() {
    try {
        const userAgent = navigator.userAgent;
        const deviceInfo = getDeviceInfo(userAgent);
        
        // Получаем IP (через бесплатный сервис)
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Получаем локацию (примерно)
        let location = 'Неизвестно';
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const geoData = await geoResponse.json();
            location = `${geoData.city || ''}, ${geoData.country_name || ''}`.trim() || 'Неизвестно';
        } catch (e) {
            console.log('Geo error:', e);
        }
        
        await _supabase
            .from('login_history')
            .insert([{
                user_id: currentUser.id,
                ip_address: ipData.ip,
                user_agent: userAgent,
                device_info: deviceInfo,
                location: location
            }]);
            
    } catch (err) {
        console.error('Login history error:', err);
    }
}

function getDeviceInfo(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Неизвестное устройство';
}

// === РЕАКЦИИ НА ПОСТЫ ===
window.toggleReaction = async function(postId, type) {
    if (!userSettings?.reactions_enabled) {
        alert('❌ Реакции отключены в настройках');
        return;
    }
    
    const btn = event.currentTarget;
    const reactionsBar = btn.closest('.post-reactions');
    
    // Проверяем, есть ли уже реакция от пользователя
    const { data: existing } = await _supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();
    
    if (existing) {
        if (existing.reaction_type === type) {
            // Убираем реакцию
            await _supabase
                .from('post_reactions')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', currentUser.id);
        } else {
            // Меняем реакцию
            await _supabase
                .from('post_reactions')
                .update({ reaction_type: type })
                .eq('post_id', postId)
                .eq('user_id', currentUser.id);
        }
    } else {
        // Добавляем новую реакцию
        await _supabase
            .from('post_reactions')
            .insert([{
                post_id: postId,
                user_id: currentUser.id,
                reaction_type: type
            }]);
    }
    
    // Обновляем отображение реакций
    await loadPostReactions(postId, reactionsBar);
};

async function loadPostReactions(postId, container) {
    const { data: reactions } = await _supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', postId);
    
    if (!reactions) return;
    
    const counts = {
        like: reactions.filter(r => r.reaction_type === 'like').length,
        fire: reactions.filter(r => r.reaction_type === 'fire').length,
        mindblown: reactions.filter(r => r.reaction_type === 'mindblown').length,
        cry: reactions.filter(r => r.reaction_type === 'cry').length
    };
    
    // Обновляем счетчики
    if (container) {
        container.querySelectorAll('.reaction-count').forEach(el => {
            const type = el.dataset.reaction;
            if (type && counts[type] !== undefined) {
                el.textContent = counts[type];
            }
        });
    }
}

// === БИН-КОД (2FA) ===
let userBinCode = null;

window.generateBinCode = function() {
    // Генерируем 6-значный код из букв и цифр
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    
    userBinCode = code;
    
    const display = document.getElementById('bin-code-display');
    if (display) {
        display.textContent = code;
        display.style.display = 'block';
    }
    
    alert(`🔐 Ваш БИН-код: ${code}\nСохраните его!`);
};

window.verifyBinCode = function() {
    const input = document.getElementById('bin-code-input')?.value.trim().toUpperCase();
    
    if (!userBinCode) {
        alert('❌ Сначала сгенерируйте код');
        return false;
    }
    
    if (input === userBinCode) {
        alert('✅ Код верный!');
        return true;
    } else {
        alert('❌ Неверный код');
        return false;
    }
};

// === ПРОВЕРКА И ПОКАЗ ПРИВЕТСТВИЯ ===
async function checkWelcomeModal() {
    try {
        const { data: welcome } = await _supabase
            .from('user_welcome')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (!welcome || !welcome.welcomed) {
            setTimeout(() => {
                showWelcomeModal();
            }, 1000);
            
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
        
        // Сохраняем историю входа
        saveLoginHistory();
        
    } catch (err) {
        console.error('Welcome check error:', err);
    }
}

window.showWelcomeModal = function() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('active');
};

window.closeWelcomeModal = function() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.remove('active');
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
    if (container) container.scrollTop = 0;
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
        
        // Создаем настройки по умолчанию
        await _supabase
            .from('user_settings')
            .insert([{
                user_id: user.id,
                theme: 'dark',
                notifications_enabled: true,
                sound_enabled: true,
                bio: '',
                reactions_enabled: true
            }]);
        
        alert('✅ Добро пожаловать, ' + (isOwner ? 'OWNER!' : 'пользователь!'));
        showMainScreen();
        
        setTimeout(() => {
            showWelcomeModal();
        }, 1000);
        
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
    const settingsNav = document.getElementById('settings-nav-item');
    
    if (adminNav) {
        adminNav.style.display = isOwner(currentUser) ? 'flex' : 'none';
    }
    if (newsNav) {
        newsNav.style.display = 'flex';
    }
    if (settingsNav) {
        settingsNav.style.display = 'flex';
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
    else if (tab === 'settings') openSettings();
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
        
    const likedPosts = new Set(likes?.map(l => l.post_id) || []);
    
    let filteredPosts = posts;
    if (feedType === 'clan' && currentUser.clan) {
        filteredPosts = posts.filter(post => post.users?.clan === currentUser.clan);
    }
    
    for (const post of filteredPosts) {
        const div = await createPostElement(post, likedPosts.has(post.id));
        feed.appendChild(div);
    }
};

async function createPostElement(post, isLiked) {
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
                 '<div class="cyber-photo-display">' +
                 '<img src="' + post.drawing_data + '" onclick="openFullImage(\'' + post.drawing_data + '\')" style="cursor: pointer; transition: 0.3s;">' +
                 '<div style="text-align: center; margin-top: 5px; font-size: 0.7rem; color: var(--cyan);">🔍 Нажмите на фото для просмотра</div>' +
                 '</div>';
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
    
    let actionButtons = '';
    if (u.id === currentUser?.id || isOwner(currentUser)) {
        actionButtons = `
            <button class="cyber-action-btn" onclick="editPost('${post.id}')" style="color:var(--cyan);" title="Редактировать">✏️</button>
            <button class="cyber-action-btn" onclick="deletePost('${post.id}')" style="color:var(--red);" title="Удалить">🗑️</button>
        `;
    }
    
    // Получаем реакции
    const { data: reactions } = await _supabase
        .from('post_reactions')
        .select('reaction_type')
        .eq('post_id', post.id);
    
    const reactionCounts = {
        like: reactions?.filter(r => r.reaction_type === 'like').length || 0,
        fire: reactions?.filter(r => r.reaction_type === 'fire').length || 0,
        mindblown: reactions?.filter(r => r.reaction_type === 'mindblown').length || 0,
        cry: reactions?.filter(r => r.reaction_type === 'cry').length || 0
    };
    
    const userReaction = reactions?.find(r => r.user_id === currentUser.id)?.reaction_type;
    
    // Блок реакций
    const reactionsHtml = userSettings?.reactions_enabled ? `
        <div class="post-reactions" style="display:flex; gap:5px; margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">
            <button class="reaction-btn ${userReaction === 'like' ? 'active' : ''}" onclick="toggleReaction('${post.id}', 'like')">
                ❤️ <span class="reaction-count" data-reaction="like">${reactionCounts.like}</span>
            </button>
            <button class="reaction-btn ${userReaction === 'fire' ? 'active' : ''}" onclick="toggleReaction('${post.id}', 'fire')">
                🔥 <span class="reaction-count" data-reaction="fire">${reactionCounts.fire}</span>
            </button>
            <button class="reaction-btn ${userReaction === 'mindblown' ? 'active' : ''}" onclick="toggleReaction('${post.id}', 'mindblown')">
                🤯 <span class="reaction-count" data-reaction="mindblown">${reactionCounts.mindblown}</span>
            </button>
            <button class="reaction-btn ${userReaction === 'cry' ? 'active' : ''}" onclick="toggleReaction('${post.id}', 'cry')">
                😢 <span class="reaction-count" data-reaction="cry">${reactionCounts.cry}</span>
            </button>
        </div>
    ` : '';
    
    div.innerHTML = '<div class="cyber-post-header">' +
        '<div class="cyber-user-identity">' +
        avatarHtml +
        '<span class="cyber-username" onclick="showProfile(\'' + (post.user_id || '') + '\')">' + usernameDisplay + '</span>' +
        '</div>' +
        '<div style="display:flex; gap:5px;">' +
        '<span class="cyber-post-time">' + time + '</span>' +
        actionButtons +
        '</div>' +
        '</div>' +
        content +
        reactionsHtml +
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
        '<button class="cyber-action-btn" onclick="copyPostLink(\'' + post.id + '\')" title="Копировать ссылку">🔗</button>' +
        '</div>';
    
    return div;
}

// === ОТКРЫТИЕ КАРТИНКИ ===
window.openFullImage = function(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'image-modal';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
    
    modal.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 90vh;">
            <img src="${imageUrl}" style="max-width: 100%; max-height: 90vh; border-radius: var(--radius-lg); border: 2px solid var(--green);">
            <button onclick="this.closest('.modal').remove()" style="position: absolute; top: -40px; right: -40px; width: 40px; height: 40px; border-radius: 50%; background: var(--red); color: white; border: none; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
            <button onclick="downloadImage('${imageUrl}')" style="position: absolute; bottom: -40px; right: -40px; width: 40px; height: 40px; border-radius: 50%; background: var(--green); color: black; border: none; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">⬇️</button>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.downloadImage = async function(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus-image-' + Date.now() + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert('Не удалось скачать изображение');
    }
};

// === РЕДАКТИРОВАНИЕ ПОСТА ===
window.editPost = async function(postId) {
    const { data: post } = await _supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
    
    if (!post) return;
    
    if (post.user_id !== currentUser.id && !isOwner(currentUser)) {
        alert('❌ Нельзя редактировать чужой пост');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'edit-post-modal';
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="cyber-modal-header">
                <h3>>> РЕДАКТИРОВАТЬ ПОСТ</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                <textarea id="edit-post-content" rows="4" placeholder="Текст поста..." style="width:100%; padding:12px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text);">${escapeHtml(post.content || '')}</textarea>
                <button onclick="saveEditedPost('${postId}')" class="cyber-btn-primary" style="margin-top:15px;">>> СОХРАНИТЬ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.saveEditedPost = async function(postId) {
    const content = document.getElementById('edit-post-content')?.value.trim();
    if (!content) {
        alert('Введите текст');
        return;
    }
    
    const { error } = await _supabase
        .from('posts')
        .update({ content: content })
        .eq('id', postId);
    
    if (error) {
        alert('Ошибка: ' + error.message);
        return;
    }
    
    document.getElementById('edit-post-modal')?.remove();
    alert('✅ Пост обновлен');
    loadPosts(currentFeed);
};

// === УДАЛЕНИЕ ПОСТА - ИСПРАВЛЕНО ===
window.deletePost = async function(postId) {
    const { data: post, error: fetchError } = await _supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
    
    if (fetchError || !post) {
        alert('❌ Пост не найден');
        return;
    }
    
    if (post.user_id !== currentUser.id && !isOwner(currentUser)) {
        alert('❌ Нельзя удалить чужой пост');
        return;
    }
    
    if (!confirm('🚨 ТОЧНО УДАЛИТЬ ПОСТ? Это действие нельзя отменить!')) return;
    
    try {
        await _supabase.from('likes').delete().eq('post_id', postId);
        await _supabase.from('comments').delete().eq('post_id', postId);
        await _supabase.from('reposts').delete().eq('post_id', postId);
        await _supabase.from('post_reactions').delete().eq('post_id', postId);
        
        const { error } = await _supabase
            .from('posts')
            .delete()
            .eq('id', postId);
        
        if (error) {
            alert('❌ Ошибка при удалении: ' + error.message);
            return;
        }
        
        alert('✅ Пост успешно удален из базы данных');
        await loadPosts(currentFeed);
        
    } catch (err) {
        console.error('Delete error:', err);
        alert('❌ Критическая ошибка при удалении');
    }
};

// === КОПИРОВАТЬ ССЫЛКУ ===
window.copyPostLink = function(postId) {
    const link = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ Ссылка скопирована!');
    }).catch(() => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="cyber-modal-content">
                <div class="cyber-modal-header">
                    <h3>>> ССЫЛКА НА ПОСТ</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="cyber-modal-body">
                    <p>Скопируйте ссылку:</p>
                    <input type="text" value="${link}" readonly style="width:100%; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text); margin:10px 0;">
                    <button onclick="this.previousElementSibling.select(); document.execCommand('copy'); alert('Скопировано!')" class="cyber-btn-primary">>> КОПИРОВАТЬ</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    });
};

// === ОТКРЫТИЕ ПОСТА ПО ССЫЛКЕ ===
window.openPostById = async function(postId) {
    const { data: post } = await _supabase
        .from('posts')
        .select('*, users:user_id(username, avatar_preset, avatar_url, emoji, clan, email, is_owner, role)')
        .eq('id', postId)
        .single();
    
    if (!post) {
        alert('Пост не найден');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content" style="max-width:600px;">
            <div class="cyber-modal-header">
                <h3>>> ПРОСМОТР ПОСТА</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                ${(await createPostElement(post, false)).outerHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// === ЛАЙКИ ===
window.toggleLike = async function(postId) {
    const btn = event.currentTarget;
    const span = btn.querySelector('span');
    const liked = btn.classList.contains('liked');
    
    try {
        if (liked) {
            const { error } = await _supabase
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', currentUser.id);
                
            if (!error) {
                btn.classList.remove('liked');
                span.textContent = parseInt(span.textContent) - 1;
            }
        } else {
            const { error } = await _supabase
                .from('likes')
                .insert([{ post_id: postId, user_id: currentUser.id }]);
                
            if (!error) {
                btn.classList.add('liked');
                span.textContent = parseInt(span.textContent) + 1;
                
                const { data: post } = await _supabase
                    .from('posts')
                    .select('user_id')
                    .eq('id', postId)
                    .single();
                    
                if (post && post.user_id !== currentUser.id && userSettings?.notifications_enabled) {
                    await _supabase
                        .from('notifications')
                        .insert([{
                            user_id: post.user_id,
                            type: 'like',
                            from_user_id: currentUser.id,
                            post_id: postId
                        }]);
                }
            }
        }
    } catch (err) {
        console.error('Like error:', err);
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
            for (const p of posts) {
                feed.appendChild(await createPostElement(p, false));
            }
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
    if (!c) return;
    
    if (!currentUser.clan) { 
        c.innerHTML = '<div class="loading">>> ВЫ НЕ СОСТОИТЕ В КЛАНЕ</div>'; 
        return; 
    }
    
    c.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    const cd = clans.find(x => x.name === currentUser.clan);
    if (cd) {
        const nameEl = document.getElementById('clan-chat-name');
        const iconEl = document.getElementById('clan-chat-icon');
        if (nameEl) nameEl.textContent = cd.name;
        if (iconEl) iconEl.textContent = cd.icon;
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
    
    c.innerHTML = '';
    
    if (!msgs || msgs.length === 0) { 
        c.innerHTML = '<div class="loading">>> НЕТ СООБЩЕНИЙ</div>'; 
    } else {
        msgs.reverse().forEach(m => {
            const d = document.createElement('div');
            d.className = 'clan-message';
            
            let av = '';
            if (m.users?.avatar_url) {
                av = '<img src="' + m.users.avatar_url + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">';
            } else {
                av = '<span style="font-size:1.8rem;">' + (m.users?.emoji || m.users?.avatar_preset || '👤') + '</span>';
            }
            
            const time = new Date(m.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            d.innerHTML = `
                <div style="display:flex; gap:10px;">
                    <div style="position:relative;">
                        ${av}
                        ${isOwner(m.users) ? '<span class="owner-badge-small" style="position:absolute; bottom:-2px; right:-2px;">✓</span>' : ''}
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color:${isOwner(m.users) ? '#ff0000' : 'var(--green)'};">${m.users?.username || 'Unknown'}</strong>
                            <span style="color:var(--text-dim); font-size:0.7rem;">${time}</span>
                        </div>
                        <div style="margin-top:4px;">${escapeHtml(m.message)}</div>
                    </div>
                </div>
            `;
            
            c.appendChild(d);
        });
        c.scrollTop = c.scrollHeight;
    }
    
    const { count } = await _supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clan', currentUser.clan);
    
    const memEl = document.getElementById('clan-chat-members');
    if (memEl) memEl.textContent = (count || 0) + ' участников';
};

window.sendClanMessage = async function() {
    const input = document.getElementById('clan-chat-input');
    const msg = input?.value.trim();
    
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
    
    if (input) input.value = '';
    loadClanChat();
};

// === УВЕДОМЛЕНИЯ ===
function startNotifications() {
    if (notificationsInterval) clearInterval(notificationsInterval);
    
    notificationsInterval = setInterval(async () => {
        if (userSettings?.notifications_enabled) {
            await loadNotifications();
        }
    }, 10000);
    
    if (userSettings?.notifications_enabled) {
        loadNotifications();
    }
}

async function loadNotifications() {
    if (!currentUser || !userSettings?.notifications_enabled) return;
    
    const { data: notifications } = await _supabase
        .from('notifications')
        .select('*, from_user:from_user_id(username, emoji, avatar_url, is_owner), post:post_id(content)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (notifications && notifications.length > 0) {
        updateNotificationBadge(notifications.filter(n => !n.is_read).length);
        displayNotifications(notifications);
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="loading">>> НЕТ УВЕДОМЛЕНИЙ</div>';
        return;
    }
    
    notifications.forEach(n => {
        const d = document.createElement('div');
        d.className = 'notification-item' + (n.is_read ? '' : ' unread');
        d.onclick = () => markNotificationAsRead(n.id);
        
        let icon = '🔔';
        let text = '';
        
        switch(n.type) {
            case 'like':
                icon = '❤️';
                text = 'лайкнул(а) ваш пост';
                break;
            case 'comment':
                icon = '💬';
                text = 'оставил(а) комментарий';
                break;
            case 'repost':
                icon = '🔄';
                text = 'репостнул(а) ваш пост';
                break;
            case 'message':
                icon = '✉️';
                text = 'написал(а) вам';
                break;
        }
        
        const fromName = n.from_user ? (isOwner(n.from_user) ? '[owner] ' + n.from_user.username : n.from_user.username) : 'Кто-то';
        
        d.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem;">${icon}</span>
                <div>
                    <div><strong>${fromName}</strong> ${text}</div>
                    <small style="color:var(--text-dim);">${new Date(n.created_at).toLocaleString('ru-RU')}</small>
                </div>
            </div>
        `;
        
        container.appendChild(d);
    });
}

async function markNotificationAsRead(id) {
    await _supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    
    loadNotifications();
}

window.openNotifications = function() {
    const modal = document.getElementById('notifications-modal');
    if (modal) {
        modal.classList.add('active');
        loadNotifications();
    }
};

window.closeNotifications = function() {
    const modal = document.getElementById('notifications-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// === ЛИЧНЫЕ СООБЩЕНИЯ ===
window.openPrivateMessages = function() {
    const modal = document.getElementById('private-messages-modal');
    if (modal) {
        modal.classList.add('active');
        loadPrivateChats();
    }
};

window.closePrivateMessages = function() {
    const modal = document.getElementById('private-messages-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

async function loadPrivateChats() {
    const list = document.getElementById('private-chats-list');
    if (!list) return;
    
    list.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    const { data: messages } = await _supabase
        .from('private_messages')
        .select('*, sender:sender_id(*), receiver:receiver_id(*)')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });
    
    const chats = new Map();
    
    messages?.forEach(msg => {
        const otherUser = msg.sender_id === currentUser.id ? msg.receiver : msg.sender;
        if (!chats.has(otherUser.id)) {
            chats.set(otherUser.id, {
                user: otherUser,
                lastMessage: msg,
                unread: !msg.is_read && msg.receiver_id === currentUser.id
            });
        }
    });
    
    list.innerHTML = '';
    
    if (chats.size === 0) {
        list.innerHTML = '<div class="loading">>> НЕТ ЧАТОВ</div>';
        return;
    }
    
    Array.from(chats.values()).forEach(chat => {
        const d = document.createElement('div');
        d.className = 'private-chat-item' + (chat.unread ? ' unread' : '');
        d.onclick = () => openPrivateChat(chat.user);
        
        let av = '';
        if (chat.user.avatar_url) {
            av = '<img src="' + chat.user.avatar_url + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">';
        } else {
            av = '<span style="font-size:2rem;">' + (chat.user.emoji || '👤') + '</span>';
        }
        
        d.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="position:relative;">
                    ${av}
                    ${isOwner(chat.user) ? '<span class="owner-badge-small" style="position:absolute; bottom:-2px; right:-2px;">✓</span>' : ''}
                </div>
                <div style="flex:1;">
                    <div><strong>${isOwner(chat.user) ? '[owner] ' + chat.user.username : '@' + chat.user.username}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-dim);">${escapeHtml(chat.lastMessage.content.substring(0, 30))}${chat.lastMessage.content.length > 30 ? '...' : ''}</div>
                </div>
                <div style="font-size:0.7rem; color:var(--text-dim);">${new Date(chat.lastMessage.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        
        list.appendChild(d);
    });
}

async function openPrivateChat(user) {
    currentChatUser = user;
    
    const header = document.getElementById('private-chat-header');
    const messages = document.getElementById('private-chat-messages');
    const input = document.getElementById('private-chat-input-container');
    
    if (header) {
        let av = '';
        if (user.avatar_url) {
            av = '<img src="' + user.avatar_url + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">';
        } else {
            av = '<span style="font-size:2rem;">' + (user.emoji || '👤') + '</span>';
        }
        
        header.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; padding:10px;">
                <button onclick="closePrivateChat()" style="background:none; border:none; color:var(--green); font-size:1.5rem; cursor:pointer;">←</button>
                <div style="position:relative;">
                    ${av}
                    ${isOwner(user) ? '<span class="owner-badge-small" style="position:absolute; bottom:-2px; right:-2px;">✓</span>' : ''}
                </div>
                <div>
                    <div><strong>${isOwner(user) ? '[owner] ' + user.username : '@' + user.username}</strong></div>
                </div>
            </div>
        `;
    }
    
    if (messages) messages.classList.remove('hidden');
    if (input) input.classList.remove('hidden');
    
    await loadPrivateMessages(user.id);
}

function closePrivateChat() {
    currentChatUser = null;
    
    const header = document.getElementById('private-chat-header');
    const messages = document.getElementById('private-chat-messages');
    const input = document.getElementById('private-chat-input-container');
    
    if (header) header.innerHTML = '';
    if (messages) messages.classList.add('hidden');
    if (input) input.classList.add('hidden');
    
    loadPrivateChats();
}

async function loadPrivateMessages(userId) {
    const container = document.getElementById('private-chat-messages');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">>> ЗАГРУЗКА...</div>';
    
    const { data: messages } = await _supabase
        .from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
    
    container.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="loading">>> НЕТ СООБЩЕНИЙ</div>';
        return;
    }
    
    messages.forEach(msg => {
        const d = document.createElement('div');
        d.className = 'private-message ' + (msg.sender_id === currentUser.id ? 'outgoing' : 'incoming');
        
        d.innerHTML = `
            <div class="message-content">${escapeHtml(msg.content)}</div>
            <div class="message-time">${new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        
        container.appendChild(d);
    });
    
    container.scrollTop = container.scrollHeight;
    
    await _supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', userId)
        .eq('is_read', false);
}

window.sendPrivateMessage = async function() {
    const input = document.getElementById('private-message-input');
    const content = input?.value.trim();
    
    if (!content || !currentChatUser) return;
    
    const { error } = await _supabase
        .from('private_messages')
        .insert([{
            sender_id: currentUser.id,
            receiver_id: currentChatUser.id,
            content: content,
            is_read: false
        }]);
    
    if (!error) {
        input.value = '';
        await loadPrivateMessages(currentChatUser.id);
        
        if (userSettings?.notifications_enabled) {
            await _supabase
                .from('notifications')
                .insert([{
                    user_id: currentChatUser.id,
                    type: 'message',
                    from_user_id: currentUser.id,
                    content: content.substring(0, 50)
                }]);
        }
    }
};

// === АДМИН ПАНЕЛЬ ===
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
    
    loadAdminNews();
};

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
            '<button onclick="deleteNews(\'' + item.id + '\')" style="background:var(--red);color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">✕</button>' +
            '</div>';
        container.appendChild(d);
    });
}

window.openNewsModal = function() {
    const modal = document.getElementById('news-modal');
    if (modal) modal.classList.add('active');
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
    loadNews();
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
    await loadUserSettings();
    showMainScreen();
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
// === ПРОВЕРКА БАНА ===
async function checkUserBan(userId) {
    const { data: ban } = await _supabase
        .from('user_bans')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (ban) {
        const now = new Date();
        const banUntil = new Date(ban.ban_until);
        
        if (banUntil > now) {
            return {
                isBanned: true,
                until: banUntil,
                reason: ban.reason,
                bannedBy: ban.banned_by
            };
        } else {
            await _supabase
                .from('user_bans')
                .delete()
                .eq('user_id', userId);
        }
    }
    
    return { isBanned: false };
}

// === ПОЛУЧЕНИЕ МЕДАЛЕК ПОЛЬЗОВАТЕЛЯ ===
async function getUserMedals(userId) {
    const { data: userMedals } = await _supabase
        .from('user_medals')
        .select('*, medals(*), awarded_by:users!user_medals_awarded_by_fkey(username)')
        .eq('user_id', userId);
    
    return userMedals || [];
}

// === ОТОБРАЖЕНИЕ МЕДАЛЕК В ПРОФИЛЕ ===
async function displayUserMedals(userId, container) {
    const medals = await getUserMedals(userId);
    
    container.innerHTML = '';
    
    if (medals.length === 0) {
        container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem;">Нет медалек</div>';
        return;
    }
    
    medals.forEach(item => {
        const medal = item.medals;
        const medalDiv = document.createElement('div');
        medalDiv.className = 'medal-item';
        medalDiv.setAttribute('data-medal-id', medal.id);
        medalDiv.setAttribute('data-medal-name', medal.name);
        medalDiv.setAttribute('data-medal-desc', medal.description);
        medalDiv.setAttribute('data-medal-awarded', new Date(item.awarded_at).toLocaleDateString('ru-RU'));
        medalDiv.setAttribute('data-medal-awarded-by', item.awarded_by?.username || 'OWNER');
        
        medalDiv.onclick = () => showMedalInfo(medalDiv);
        
        medalDiv.innerHTML = `
            <div style="width:50px; height:50px; cursor:pointer; transition:transform 0.2s;" 
                 onmouseover="this.style.transform='scale(1.1)'" 
                 onmouseout="this.style.transform='scale(1)'">
                ${medal.icon_svg}
            </div>
        `;
        
        container.appendChild(medalDiv);
    });
}

// === ПОКАЗ ИНФОРМАЦИИ О МЕДАЛЬКЕ ===
window.showMedalInfo = function(medalElement) {
    const name = medalElement.getAttribute('data-medal-name');
    const desc = medalElement.getAttribute('data-medal-desc');
    const awarded = medalElement.getAttribute('data-medal-awarded');
    const awardedBy = medalElement.getAttribute('data-medal-awarded-by');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content" style="max-width:400px;">
            <div class="cyber-modal-header">
                <h3>>> ${name}</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body" style="text-align:center;">
                <div style="width:100px; height:100px; margin:20px auto;">
                    ${medalElement.querySelector('svg')?.outerHTML || ''}
                </div>
                <p style="margin:20px 0; color:var(--text-dim);">${desc}</p>
                <p style="font-size:0.8rem;">Выдана: ${awarded}</p>
                <p style="font-size:0.8rem; color:var(--green);">Кем: ${awardedBy}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// === КНОПКИ ДЛЯ OWNER В ПРОФИЛЕ ===
async function addOwnerButtonsToProfile(profileUser) {
    const container = document.getElementById('profile-owner-actions');
    if (!container) return;
    
    if (!isOwner(currentUser)) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = '';
    
    const { data: availableMedals } = await _supabase
        .from('medals')
        .select('*')
        .order('name');
    
    const medalBtn = document.createElement('button');
    medalBtn.className = 'cyber-btn-outline';
    medalBtn.style.margin = '5px';
    medalBtn.style.background = 'var(--green-dim)';
    medalBtn.innerHTML = '🏅 Дать медальку';
    medalBtn.onclick = () => showAwardMedalModal(profileUser.id, availableMedals);
    container.appendChild(medalBtn);
    
    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'cyber-btn-outline';
    verifyBtn.style.margin = '5px';
    verifyBtn.style.background = '#4169E1';
    verifyBtn.style.color = 'white';
    verifyBtn.innerHTML = '✓ Дать галочку';
    verifyBtn.onclick = () => toggleUserVerification(profileUser.id, !profileUser.is_verified);
    container.appendChild(verifyBtn);
    
    const banStatus = await checkUserBan(profileUser.id);
    
    const banBtn = document.createElement('button');
    banBtn.className = 'cyber-btn-outline';
    banBtn.style.margin = '5px';
    
    if (banStatus.isBanned) {
        banBtn.style.background = 'var(--red)';
        banBtn.style.color = 'white';
        banBtn.innerHTML = '🔴 Снять бан';
        banBtn.onclick = () => removeUserBan(profileUser.id);
    } else {
        banBtn.style.background = '#ff9800';
        banBtn.style.color = 'white';
        banBtn.innerHTML = '⛔ Забанить';
        banBtn.onclick = () => showBanModal(profileUser.id);
    }
    container.appendChild(banBtn);
}

// === МОДАЛКА ВЫДАЧИ МЕДАЛЬКИ ===
function showAwardMedalModal(userId, availableMedals) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="cyber-modal-header">
                <h3>>> ВЫДАТЬ МЕДАЛЬКУ</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; max-height:400px; overflow-y:auto;">
                    ${availableMedals.map(medal => `
                        <div onclick="awardMedalToUser('${userId}', '${medal.id}')" 
                             style="padding:15px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-md); cursor:pointer; text-align:center; transition:0.2s;"
                             onmouseover="this.style.borderColor='var(--green)'"
                             onmouseout="this.style.borderColor='var(--border)'">
                            <div style="width:60px; height:60px; margin:0 auto 10px;">
                                ${medal.icon_svg}
                            </div>
                            <div style="font-weight:600;">${medal.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${medal.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// === ВЫДАТЬ МЕДАЛЬКУ ===
window.awardMedalToUser = async function(userId, medalId) {
    const { error } = await _supabase
        .from('user_medals')
        .insert([{
            user_id: userId,
            medal_id: medalId,
            awarded_by: currentUser.id
        }]);
    
    if (error) {
        if (error.code === '23505') {
            alert('❌ У пользователя уже есть эта медалька');
        } else {
            alert('❌ Ошибка: ' + error.message);
        }
        return;
    }
    
    alert('✅ Медалька выдана!');
    document.querySelector('.modal.active')?.remove();
    
    const medalsContainer = document.getElementById('profile-medals');
    if (medalsContainer) {
        await displayUserMedals(userId, medalsContainer);
    }
};

// === ПЕРЕКЛЮЧЕНИЕ ГАЛОЧКИ ===
window.toggleUserVerification = async function(userId, verified) {
    const { error } = await _supabase
        .from('users')
        .update({ is_verified: verified })
        .eq('id', userId);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert(verified ? '✅ Галочка выдана!' : '✅ Галочка убрана!');
    
    const user = currentProfileUser;
    if (user && user.id === userId) {
        user.is_verified = verified;
        const usernameEl = document.getElementById('profile-username');
        if (usernameEl) {
            if (isOwner(user)) {
                usernameEl.innerHTML = '<span class="owner-username-large">✓ [owner] ' + user.username + '</span>';
            } else if (verified) {
                usernameEl.innerHTML = '<span style="color:var(--cyan);">✓ ' + user.username + '</span>';
            } else {
                usernameEl.textContent = '@' + user.username;
            }
        }
    }
};

// === МОДАЛКА БАНА ===
function showBanModal(userId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="cyber-modal-header">
                <h3>>> ЗАБАНИТЬ ПОЛЬЗОВАТЕЛЯ</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                <label class="cyber-label">Причина бана:</label>
                <input type="text" id="ban-reason" placeholder="Нарушение правил..." style="width:100%; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text); border-radius:var(--radius-md); margin-bottom:15px;">
                
                <label class="cyber-label">Длительность:</label>
                <select id="ban-duration" style="width:100%; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text); border-radius:var(--radius-md); margin-bottom:20px;">
                    <option value="1">1 час</option>
                    <option value="3">3 часа</option>
                    <option value="6">6 часов</option>
                    <option value="12">12 часов</option>
                    <option value="24">24 часа</option>
                    <option value="72">3 дня</option>
                    <option value="168">7 дней</option>
                    <option value="720">30 дней</option>
                </select>
                
                <button onclick="banUser('${userId}')" class="cyber-btn-primary" style="background:var(--red);">>> ЗАБАНИТЬ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// === ЗАБАНИТЬ ПОЛЬЗОВАТЕЛЯ ===
window.banUser = async function(userId) {
    const reason = document.getElementById('ban-reason')?.value.trim() || 'Нарушение правил';
    const duration = parseInt(document.getElementById('ban-duration')?.value || '24');
    
    const banUntil = new Date();
    banUntil.setHours(banUntil.getHours() + duration);
    
    await _supabase
        .from('user_bans')
        .delete()
        .eq('user_id', userId);
    
    const { error } = await _supabase
        .from('user_bans')
        .insert([{
            user_id: userId,
            banned_by: currentUser.id,
            ban_until: banUntil,
            reason: reason
        }]);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert(`✅ Пользователь забанен до ${banUntil.toLocaleString('ru-RU')}`);
    document.querySelector('.modal.active')?.remove();
    
    if (currentProfileUser && currentProfileUser.id === userId) {
        showProfile(userId);
    }
};

// === СНЯТЬ БАН ===
window.removeUserBan = async function(userId) {
    const { error } = await _supabase
        .from('user_bans')
        .delete()
        .eq('user_id', userId);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert('✅ Бан снят');
    
    if (currentProfileUser && currentProfileUser.id === userId) {
        showProfile(userId);
    }
};
// === ПРОВЕРКА БАНА ===
async function checkUserBan(userId) {
    const { data: ban } = await _supabase
        .from('user_bans')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (ban) {
        const now = new Date();
        const banUntil = new Date(ban.ban_until);
        
        if (banUntil > now) {
            return {
                isBanned: true,
                until: banUntil,
                reason: ban.reason,
                bannedBy: ban.banned_by
            };
        } else {
            await _supabase
                .from('user_bans')
                .delete()
                .eq('user_id', userId);
        }
    }
    
    return { isBanned: false };
}

// === ПОЛУЧЕНИЕ МЕДАЛЕК ПОЛЬЗОВАТЕЛЯ ===
async function getUserMedals(userId) {
    const { data: userMedals } = await _supabase
        .from('user_medals')
        .select('*, medals(*), awarded_by:users!user_medals_awarded_by_fkey(username)')
        .eq('user_id', userId);
    
    return userMedals || [];
}

// === ОТОБРАЖЕНИЕ МЕДАЛЕК В ПРОФИЛЕ ===
async function displayUserMedals(userId, container) {
    const medals = await getUserMedals(userId);
    
    container.innerHTML = '';
    
    if (medals.length === 0) {
        container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem;">Нет медалек</div>';
        return;
    }
    
    medals.forEach(item => {
        const medal = item.medals;
        const medalDiv = document.createElement('div');
        medalDiv.className = 'medal-item';
        medalDiv.setAttribute('data-medal-id', medal.id);
        medalDiv.setAttribute('data-medal-name', medal.name);
        medalDiv.setAttribute('data-medal-desc', medal.description);
        medalDiv.setAttribute('data-medal-awarded', new Date(item.awarded_at).toLocaleDateString('ru-RU'));
        medalDiv.setAttribute('data-medal-awarded-by', item.awarded_by?.username || 'OWNER');
        
        medalDiv.onclick = () => showMedalInfo(medalDiv);
        
        medalDiv.innerHTML = `
            <div style="width:50px; height:50px; cursor:pointer; transition:transform 0.2s;" 
                 onmouseover="this.style.transform='scale(1.1)'" 
                 onmouseout="this.style.transform='scale(1)'">
                ${medal.icon_svg}
            </div>
        `;
        
        container.appendChild(medalDiv);
    });
}

// === ПОКАЗ ИНФОРМАЦИИ О МЕДАЛЬКЕ ===
window.showMedalInfo = function(medalElement) {
    const name = medalElement.getAttribute('data-medal-name');
    const desc = medalElement.getAttribute('data-medal-desc');
    const awarded = medalElement.getAttribute('data-medal-awarded');
    const awardedBy = medalElement.getAttribute('data-medal-awarded-by');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content" style="max-width:400px;">
            <div class="cyber-modal-header">
                <h3>>> ${name}</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body" style="text-align:center;">
                <div style="width:100px; height:100px; margin:20px auto;">
                    ${medalElement.querySelector('svg')?.outerHTML || ''}
                </div>
                <p style="margin:20px 0; color:var(--text-dim);">${desc}</p>
                <p style="font-size:0.8rem;">Выдана: ${awarded}</p>
                <p style="font-size:0.8rem; color:var(--green);">Кем: ${awardedBy}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// === КНОПКИ ДЛЯ OWNER В ПРОФИЛЕ ===
async function addOwnerButtonsToProfile(profileUser) {
    const container = document.getElementById('profile-owner-actions');
    if (!container) return;
    
    if (!isOwner(currentUser)) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = '';
    
    const { data: availableMedals } = await _supabase
        .from('medals')
        .select('*')
        .order('name');
    
    const medalBtn = document.createElement('button');
    medalBtn.className = 'cyber-btn-outline';
    medalBtn.style.margin = '5px';
    medalBtn.style.background = 'var(--green-dim)';
    medalBtn.innerHTML = '🏅 Дать медальку';
    medalBtn.onclick = () => showAwardMedalModal(profileUser.id, availableMedals);
    container.appendChild(medalBtn);
    
    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'cyber-btn-outline';
    verifyBtn.style.margin = '5px';
    verifyBtn.style.background = '#4169E1';
    verifyBtn.style.color = 'white';
    verifyBtn.innerHTML = '✓ Дать галочку';
    verifyBtn.onclick = () => toggleUserVerification(profileUser.id, !profileUser.is_verified);
    container.appendChild(verifyBtn);
    
    const banStatus = await checkUserBan(profileUser.id);
    
    const banBtn = document.createElement('button');
    banBtn.className = 'cyber-btn-outline';
    banBtn.style.margin = '5px';
    
    if (banStatus.isBanned) {
        banBtn.style.background = 'var(--red)';
        banBtn.style.color = 'white';
        banBtn.innerHTML = '🔴 Снять бан';
        banBtn.onclick = () => removeUserBan(profileUser.id);
    } else {
        banBtn.style.background = '#ff9800';
        banBtn.style.color = 'white';
        banBtn.innerHTML = '⛔ Забанить';
        banBtn.onclick = () => showBanModal(profileUser.id);
    }
    container.appendChild(banBtn);
}

// === МОДАЛКА ВЫДАЧИ МЕДАЛЬКИ ===
function showAwardMedalModal(userId, availableMedals) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="cyber-modal-header">
                <h3>>> ВЫДАТЬ МЕДАЛЬКУ</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; max-height:400px; overflow-y:auto;">
                    ${availableMedals.map(medal => `
                        <div onclick="awardMedalToUser('${userId}', '${medal.id}')" 
                             style="padding:15px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-md); cursor:pointer; text-align:center; transition:0.2s;"
                             onmouseover="this.style.borderColor='var(--green)'"
                             onmouseout="this.style.borderColor='var(--border)'">
                            <div style="width:60px; height:60px; margin:0 auto 10px;">
                                ${medal.icon_svg}
                            </div>
                            <div style="font-weight:600;">${medal.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${medal.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// === ВЫДАТЬ МЕДАЛЬКУ ===
window.awardMedalToUser = async function(userId, medalId) {
    const { error } = await _supabase
        .from('user_medals')
        .insert([{
            user_id: userId,
            medal_id: medalId,
            awarded_by: currentUser.id
        }]);
    
    if (error) {
        if (error.code === '23505') {
            alert('❌ У пользователя уже есть эта медалька');
        } else {
            alert('❌ Ошибка: ' + error.message);
        }
        return;
    }
    
    alert('✅ Медалька выдана!');
    document.querySelector('.modal.active')?.remove();
    
    const medalsContainer = document.getElementById('profile-medals');
    if (medalsContainer) {
        await displayUserMedals(userId, medalsContainer);
    }
};

// === ПЕРЕКЛЮЧЕНИЕ ГАЛОЧКИ ===
window.toggleUserVerification = async function(userId, verified) {
    const { error } = await _supabase
        .from('users')
        .update({ is_verified: verified })
        .eq('id', userId);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert(verified ? '✅ Галочка выдана!' : '✅ Галочка убрана!');
    
    const user = currentProfileUser;
    if (user && user.id === userId) {
        user.is_verified = verified;
        const usernameEl = document.getElementById('profile-username');
        if (usernameEl) {
            if (isOwner(user)) {
                usernameEl.innerHTML = '<span class="owner-username-large">✓ [owner] ' + user.username + '</span>';
            } else if (verified) {
                usernameEl.innerHTML = '<span style="color:var(--cyan);">✓ ' + user.username + '</span>';
            } else {
                usernameEl.textContent = '@' + user.username;
            }
        }
    }
};

// === МОДАЛКА БАНА ===
function showBanModal(userId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="cyber-modal-content">
            <div class="cyber-modal-header">
                <h3>>> ЗАБАНИТЬ ПОЛЬЗОВАТЕЛЯ</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="cyber-modal-body">
                <label class="cyber-label">Причина бана:</label>
                <input type="text" id="ban-reason" placeholder="Нарушение правил..." style="width:100%; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text); border-radius:var(--radius-md); margin-bottom:15px;">
                
                <label class="cyber-label">Длительность:</label>
                <select id="ban-duration" style="width:100%; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text); border-radius:var(--radius-md); margin-bottom:20px;">
                    <option value="1">1 час</option>
                    <option value="3">3 часа</option>
                    <option value="6">6 часов</option>
                    <option value="12">12 часов</option>
                    <option value="24">24 часа</option>
                    <option value="72">3 дня</option>
                    <option value="168">7 дней</option>
                    <option value="720">30 дней</option>
                </select>
                
                <button onclick="banUser('${userId}')" class="cyber-btn-primary" style="background:var(--red);">>> ЗАБАНИТЬ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// === ЗАБАНИТЬ ПОЛЬЗОВАТЕЛЯ ===
window.banUser = async function(userId) {
    const reason = document.getElementById('ban-reason')?.value.trim() || 'Нарушение правил';
    const duration = parseInt(document.getElementById('ban-duration')?.value || '24');
    
    const banUntil = new Date();
    banUntil.setHours(banUntil.getHours() + duration);
    
    await _supabase
        .from('user_bans')
        .delete()
        .eq('user_id', userId);
    
    const { error } = await _supabase
        .from('user_bans')
        .insert([{
            user_id: userId,
            banned_by: currentUser.id,
            ban_until: banUntil,
            reason: reason
        }]);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert(`✅ Пользователь забанен до ${banUntil.toLocaleString('ru-RU')}`);
    document.querySelector('.modal.active')?.remove();
    
    if (currentProfileUser && currentProfileUser.id === userId) {
        showProfile(userId);
    }
};

// === СНЯТЬ БАН ===
window.removeUserBan = async function(userId) {
    const { error } = await _supabase
        .from('user_bans')
        .delete()
        .eq('user_id', userId);
    
    if (error) {
        alert('❌ Ошибка: ' + error.message);
        return;
    }
    
    alert('✅ Бан снят');
    
    if (currentProfileUser && currentProfileUser.id === userId) {
        showProfile(userId);
    }
};
startClanChatAutoRefresh();