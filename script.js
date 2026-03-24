// Генерация иконок
function generateIcon(name, size = 45) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const hue = (name.charCodeAt(0) * 37 + name.length * 13) % 360;
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, `hsl(${hue}, 70%, 55%)`);
    grad.addColorStop(1, `hsl(${hue}, 80%, 35%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size * 0.4}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), size/2, size/2);
    return canvas.toDataURL();
}

// Бойцы
const brawlersList = [
    "Shelly","Nita","Colt","Bull","Jessie","Brock","Dynamike","Bo","Tick","8-Bit",
    "Emz","El Primo","Barley","Poco","Rosa","Rico","Darryl","Penny","Carl","Jacky",
    "Gus","Bonnie","Janet","Fang","Eve","Otis","Sam","Mandy","Maisie","Cordelius",
    "Willow","Doug","Hank","Pearl","Chuck","Mico","Larry","Angelo","Berry","Draco",
    "Lily","Kenji","Moe","Juju","Shade","Meeple","Finx","Lola","Griff","Grom",
    "Buzz","Ash","Meg","Surge","Colette","Amber","Lou","Byron","Squeak","Spike",
    "Crow","Leon","Sandy","Gale","Nani","Belle","Stu","Ruffs","Edgar","Bea",
    "Mr.P","Sprout","Max","Gene","Tara","Mortis","Piper","Pam","Frank","Bibi","Gray","Chester"
];
const brawlers = [...new Set(brawlersList)].slice(0, 101);

let player = null;
let selectedBrawler = "Shelly";
let playerId = localStorage.getItem("player_id");
if (!playerId) { playerId = "p_" + Date.now() + "_" + Math.random().toString(36).substr(2,6); localStorage.setItem("player_id", playerId); }

function loadPlayer() {
    let saved = localStorage.getItem("player_" + playerId);
    if(saved) {
        player = JSON.parse(saved);
    } else {
        player = {
            id: playerId,
            name: "BrawlerFan",
            tag: "#" + Math.random().toString(36).substring(2,9).toUpperCase(),
            trophies: 1200,
            wins: 42,
            coins: 1000,
            gems: 50,
            starDrops: 10,
            favBrawler: "Shelly",
            friends: [],
            clan: "",
            coolpassExp: 0,
            coolpassLevel: 1
        };
    }
    selectedBrawler = player.favBrawler || "Shelly";
    savePlayer();
}

function savePlayer() {
    localStorage.setItem("player_" + player.id, JSON.stringify(player));
    updateLeaderboard();
    updateUI();
}

function updateUI() {
    document.getElementById("trophiesCount").innerText = player.trophies;
    document.getElementById("winsCount").innerText = player.wins;
    document.getElementById("coinsCount").innerText = player.coins;
    document.getElementById("gemsCount").innerText = player.gems || 0;
    document.getElementById("starDrops").innerText = player.starDrops;
    document.getElementById("favBrawler").innerText = player.favBrawler;
    document.getElementById("playerNameInput").value = player.name;
    document.getElementById("playerTagDisplay").innerHTML = player.tag;
    document.getElementById("myBrawler").innerHTML = selectedBrawler;
    document.getElementById("friendsList").innerHTML = player.friends.length ? player.friends.map(f => `👤 ${f}`).join('') : "Нет друзей";
    document.getElementById("clanDisplay").innerHTML = player.clan ? `🏰 ${player.clan}` : "Нет клана";
    updateCoolpass();
}

function updateCoolpass() {
    let level = player.coolpassLevel || 1;
    let exp = player.coolpassExp || 0;
    let need = level * 100;
    let percent = (exp / need) * 100;
    document.getElementById("coolpassLevel").innerHTML = `Ур.${level}`;
    document.getElementById("coolpassFill").style.width = percent + "%";
    document.getElementById("coolpassRewards").innerHTML = `🎁 До награды: ${need-exp} XP → +${100 + level*20} монет`;
}

function addExp(amount) {
    player.coolpassExp = (player.coolpassExp || 0) + amount;
    let need = player.coolpassLevel * 100;
    while(player.coolpassExp >= need) {
        player.coolpassExp -= need;
        player.coolpassLevel++;
        let reward = 100 + player.coolpassLevel * 20;
        player.coins += reward;
        showNotif(`🎉 COOLPASS УРОВЕНЬ ${player.coolpassLevel}! +${reward} монет!`);
        need = player.coolpassLevel * 100;
    }
    savePlayer();
}

function updateLeaderboard() {
    let players = [];
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key && key.startsWith("player_")) {
            try {
                let p = JSON.parse(localStorage.getItem(key));
                players.push({name: p.name, tag: p.tag, trophies: p.trophies});
            } catch(e){}
        }
    }
    players.sort((a,b)=>b.trophies - a.trophies);
    players = players.slice(0,10);
    let list = document.getElementById("leaderboardList");
    if(players.length) {
        list.innerHTML = players.map((p,i)=>`<li><span>${i+1}. ${p.name} ${p.tag}</span><span>🏆 ${p.trophies}</span></li>`).join('');
    } else {
        list.innerHTML = "<li>Нет данных</li>";
    }
    document.getElementById("onlineCount").innerText = Math.min(players.length + 1, 42);
}

function renderBrawlers() {
    let container = document.getElementById("brawlersList");
    container.innerHTML = "";
    brawlers.forEach(b => {
        let div = document.createElement("div");
        div.className = "brawler-card" + (selectedBrawler === b ? " selected" : "");
        let iconUrl = generateIcon(b, 45);
        div.innerHTML = `<div class="brawler-icon"><img src="${iconUrl}" style="width:100%;height:100%;border-radius:50%;"></div><div class="brawler-name">${b.slice(0,10)}</div>`;
        div.onclick = () => { selectedBrawler = b; renderBrawlers(); updateUI(); };
        div.ondblclick = () => { player.favBrawler = b; savePlayer(); showNotif(`${b} любимый!`); updateUI(); };
        container.appendChild(div);
    });
}

function fight() {
    let enemy = brawlers[Math.floor(Math.random() * brawlers.length)];
    document.getElementById("enemyBrawler").innerHTML = enemy;
    let win = Math.random() > 0.45;
    let resultDiv = document.getElementById("fightResult");
    if(win) {
        let trophiesGain = 12 + Math.floor(Math.random() * 20);
        let coinsGain = 40 + Math.floor(Math.random() * 60);
        player.trophies += trophiesGain;
        player.wins += 1;
        player.coins += coinsGain;
        addExp(25);
        resultDiv.innerHTML = `🎉 ПОБЕДА! +${trophiesGain}🏆 +${coinsGain}💰 +25 XP!`;
        playSound("win");
    } else {
        let lose = 7;
        player.trophies = Math.max(0, player.trophies - lose);
        addExp(10);
        resultDiv.innerHTML = `💔 ПОРАЖЕНИЕ... -${lose}🏆 +10 XP`;
        playSound("beep");
    }
    savePlayer();
    updateUI();
}

function playSound(t) {
    try {
        let audio = new Audio();
        audio.volume = 0.2;
        if(t === "win") audio.src = "data:audio/wav;base64,U3RlYW0gV2luIFNvdW5k";
        else audio.src = "data:audio/wav;base64,U3RlYW0gQmVlcA==";
        audio.play().catch(e=>{});
    } catch(e){}
}

function redeemCode() {
    let code = document.getElementById("codeInput").value.trim().toUpperCase();
    if(code === "COOLBOX") {
        player.coins += 1000;
        player.starDrops += 5;
        showNotif("✅ COOLBOX: +1000 монет, +5 стардропов!");
    } else if(code === "ORBSI2025") {
        player.coins += 2000;
        player.starDrops += 3;
        player.gems = (player.gems || 0) + 50;
        showNotif("✨ ORBSI2025: +2000 монет, +50 гемов!");
    } else {
        showNotif("❌ Неверный код! COOLBOX / ORBSI2025");
        return;
    }
    savePlayer();
    document.getElementById("codeInput").value = "";
    updateUI();
    playSound("win");
}

function saveProfile() {
    let newName = document.getElementById("playerNameInput").value;
    if(newName) player.name = newName;
    savePlayer();
    showNotif("Профиль сохранен!");
}

function addFriend() {
    let fr = document.getElementById("friendInput").value.trim();
    if(fr && !player.friends.includes(fr)) {
        player.friends.push(fr);
        savePlayer();
        updateUI();
        showNotif(`Друг ${fr} добавлен`);
    }
    document.getElementById("friendInput").value = "";
}

function setClan() {
    let clan = document.getElementById("clanInput").value.trim();
    if(clan) {
        player.clan = clan;
        savePlayer();
        updateUI();
        showNotif(`Клан ${clan} создан!`);
    }
    document.getElementById("clanInput").value = "";
}

function showNotif(msg) {
    let n = document.createElement("div");
    n.className = "notification";
    n.innerText = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

let promoEnd = Date.now() + 48*3600*1000;
function updateTimer() {
    let diff = promoEnd - Date.now();
    if(diff <= 0) { document.getElementById("promoTimer").innerText = "Акция завершена!"; return; }
    let h = Math.floor(diff/3600000);
    let m = Math.floor((diff%3600000)/60000);
    let s = Math.floor((diff%60000)/1000);
    document.getElementById("promoTimer").innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    setTimeout(updateTimer, 1000);
}

let musicEnabled = true;
function toggleMusic() {
    musicEnabled = !musicEnabled;
    document.getElementById("musicBtn").innerHTML = musicEnabled ? "🔊" : "🔇";
}

loadPlayer();
renderBrawlers();
updateUI();
updateTimer();

document.getElementById("fightBtn").onclick = fight;
document.getElementById("saveProfileBtn").onclick = saveProfile;
document.getElementById("redeemBtn").onclick = redeemCode;
document.getElementById("addFriendBtn").onclick = addFriend;
document.getElementById("createClanBtn").onclick = setClan;
document.getElementById("telegramBtn").onclick = () => window.open("https://t.me/coolboxcode", "_blank");
document.getElementById("musicBtn").onclick = toggleMusic;
setInterval(() => savePlayer(), 30000);
