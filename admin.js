const ADMIN_PASSWORD = 'coolbox2025';
let serverStartTime = Date.now();

function checkAuth() {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === ADMIN_PASSWORD) {
        initAdmin();
    } else {
        const password = prompt('Введите пароль администратора:');
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', password);
            initAdmin();
        } else {
            alert('Неверный пароль!');
            window.location.href = 'index.html';
        }
    }
}

function initAdmin() {
    loadStats();
    loadPlayers();
    loadBrawlersSelect();
    
    setInterval(loadStats, 5000);
    setInterval(loadPlayers, 10000);
    
    document.getElementById('searchBtn').onclick = searchPlayer;
    document.getElementById('giveResourcesBtn').onclick = giveResources;
    document.getElementById('giveBrawlerBtn').onclick = giveBrawler;
    document.getElementById('giveCreatorBtn').onclick = giveCreatorContent;
    document.getElementById('sendMessageBtn').onclick = sendGlobalMessage;
    document.getElementById('restartBtn').onclick = restartServer;
    document.getElementById('clearCacheBtn').onclick = clearCache;
    document.getElementById('logoutBtn').onclick = logout;
    document.getElementById('filterPlayers').oninput = filterPlayers;
}

function loadStats() {
    let players = [];
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) players.push(JSON.parse(localStorage.getItem(key)));
    }
    document.getElementById('onlineCount').innerText = Math.min(players.length, 42);
    document.getElementById('totalPlayers').innerText = players.length;
    let uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    let hours = Math.floor(uptime / 3600);
    let minutes = Math.floor((uptime % 3600) / 60);
    document.getElementById('uptime').innerText = `${hours}ч ${minutes}м`;
}

function loadPlayers() {
    let players = [];
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            try {
                let p = JSON.parse(localStorage.getItem(key));
                players.push(p);
            } catch(e){}
        }
    }
    players.sort((a,b)=>b.trophies - a.trophies);
    window.allPlayers = players;
    filterPlayers();
}

function filterPlayers() {
    let filter = document.getElementById('filterPlayers').value.toLowerCase();
    let filtered = (window.allPlayers || []).filter(p => 
        p.name.toLowerCase().includes(filter) || p.tag.toLowerCase().includes(filter)
    ).slice(0, 30);
    let container = document.getElementById('playersList');
    container.innerHTML = filtered.map(p => `
        <div class="player-item" onclick="selectPlayer('${p.tag}')">
            <div><strong>${escapeHtml(p.name)}</strong><div class="player-tag">${p.tag}</div></div>
            <div>🏆 ${p.trophies} | 💰 ${p.coins}</div>
        </div>
    `).join('');
}

function selectPlayer(tag) {
    document.getElementById('searchTag').value = tag;
    document.getElementById('giveTag').value = tag;
    document.getElementById('brawlerTag').value = tag;
    document.getElementById('creatorTag').value = tag;
    searchPlayer();
}

function searchPlayer() {
    let tag = document.getElementById('searchTag').value.trim().toUpperCase();
    if(!tag) return;
    
    let player = null;
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            let p = JSON.parse(localStorage.getItem(key));
            if(p.tag === tag) { player = p; break; }
        }
    }
    
    let resultDiv = document.getElementById('searchResult');
    if(player) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
                <div><strong>Имя:</strong> ${escapeHtml(player.name)}</div>
                <div><strong>Тег:</strong> ${player.tag}</div>
                <div>🏆 Трофеи: ${player.trophies}</div>
                <div>💰 Монеты: ${player.coins}</div>
                <div>💎 Гемы: ${player.gems || 0}</div>
                <div>✨ Дропы: ${player.starDrops}</div>
                <div>⭐ Победы: ${player.wins}</div>
                <div>🎖️ Боец: ${player.favBrawler}</div>
            </div>
        `;
    } else {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div style="color:#f87171;">❌ Игрок не найден</div>';
    }
}

function giveResources() {
    let tag = document.getElementById('giveTag').value.trim().toUpperCase();
    let coins = parseInt(document.getElementById('giveCoins').value) || 0;
    let gems = parseInt(document.getElementById('giveGems').value) || 0;
    let starDrops = parseInt(document.getElementById('giveStarDrops').value) || 0;
    let trophies = parseInt(document.getElementById('giveTrophies').value) || 0;
    
    if(!tag) { alert('Введите тег игрока!'); return; }
    
    let player = null;
    let playerKey = null;
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            let p = JSON.parse(localStorage.getItem(key));
            if(p.tag === tag) { player = p; playerKey = key; break; }
        }
    }
    
    if(player) {
        player.coins += coins;
        player.gems = (player.gems || 0) + gems;
        player.starDrops += starDrops;
        player.trophies += trophies;
        localStorage.setItem(playerKey, JSON.stringify(player));
        alert(`✅ Ресурсы выданы игроку ${player.name}!`);
        searchPlayer();
        loadPlayers();
        loadStats();
    } else {
        alert('❌ Игрок не найден!');
    }
}

function loadBrawlersSelect() {
    let brawlers = ["Shelly","Nita","Colt","Bull","Jessie","Brock","Dynamike","Bo","Tick","8-Bit",
        "Emz","El Primo","Barley","Poco","Rosa","Rico","Darryl","Penny","Carl","Jacky",
        "Spike","Crow","Leon","Sandy","Amber","Meg","Surge","Colette","Edgar","Byron"];
    let select = document.getElementById('selectBrawler');
    select.innerHTML = brawlers.map(b => `<option value="${b}">${b}</option>`).join('');
}

function giveBrawler() {
    let tag = document.getElementById('brawlerTag').value.trim().toUpperCase();
    let brawler = document.getElementById('selectBrawler').value;
    
    if(!tag) { alert('Введите тег игрока!'); return; }
    
    let player = null;
    let playerKey = null;
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            let p = JSON.parse(localStorage.getItem(key));
            if(p.tag === tag) { player = p; playerKey = key; break; }
        }
    }
    
    if(player) {
        if(!player.brawlers) player.brawlers = [];
        if(!player.brawlers.includes(brawler)) {
            player.brawlers.push(brawler);
            player.favBrawler = brawler;
            localStorage.setItem(playerKey, JSON.stringify(player));
            alert(`✅ Боец ${brawler} выдан игроку ${player.name}!`);
        } else {
            alert('У игрока уже есть этот боец!');
        }
    } else {
        alert('❌ Игрок не найден!');
    }
}

function giveCreatorContent() {
    let tag = document.getElementById('creatorTag').value.trim().toUpperCase();
    let creatorBadge = document.getElementById('creatorBadge').checked;
    let vipBadge = document.getElementById('vipBadge').checked;
    let legendaryBrawler = document.getElementById('legendaryBrawler').checked;
    let bonus = parseInt(document.getElementById('creatorBonus').value);
    
    if(!tag) { alert('Введите тег игрока!'); return; }
    
    let player = null;
    let playerKey = null;
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            let p = JSON.parse(localStorage.getItem(key));
            if(p.tag === tag) { player = p; playerKey = key; break; }
        }
    }
    
    if(player) {
        player.coins += bonus;
        if(bonus >= 20000) player.gems = (player.gems || 0) + 50;
        if(bonus >= 50000) player.gems = (player.gems || 0) + 100;
        if(creatorBadge) player.creatorBadge = true;
        if(vipBadge) player.vipBadge = true;
        if(legendaryBrawler) {
            let legendary = ['Spike', 'Crow', 'Leon', 'Sandy'];
            if(!player.brawlers) player.brawlers = [];
            legendary.forEach(b => { if(!player.brawlers.includes(b)) player.brawlers.push(b); });
            player.favBrawler = legendary[0];
        }
        localStorage.setItem(playerKey, JSON.stringify(player));
        alert(`👑 Контент креатора выдан ${player.name}!`);
        searchPlayer();
        loadPlayers();
    } else {
        alert('❌ Игрок не найден!');
    }
}

function sendGlobalMessage() {
    let message = document.getElementById('globalMessage').value.trim();
    if(message) {
        alert(`📢 Сообщение отправлено: "${message}"`);
        document.getElementById('globalMessage').value = '';
    }
}

function restartServer() {
    if(confirm('Перезапустить сервер?')) {
        alert('Сервер перезапущен!');
        serverStartTime = Date.now();
    }
}

function clearCache() {
    if(confirm('Очистить кэш? Все данные будут удалены!')) {
        localStorage.clear();
        alert('Кэш очищен! Страница будет перезагружена.');
        location.reload();
    }
}

function logout() {
    sessionStorage.removeItem('admin_auth');
    window.location.href = 'index.html';
}

function escapeHtml(text) {
    let div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.selectPlayer = selectPlayer;
checkAuth();
