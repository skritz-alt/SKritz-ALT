// Game State
const gameState = {
    points: 0,
    clickPower: 1,
    autoClickPower: 1,
    upgrades: {
        clicker: [
            { name: 'Cliqueur +1', baseCost: 10, gain: 1, level: 0 },
            { name: 'Cliqueur +5', baseCost: 100, gain: 5, level: 0 },
            { name: 'Cliqueur +10', baseCost: 500, gain: 10, level: 0 }
        ],
        auto: [
            { name: 'Auto Lvl 1', baseCost: 50, gain: 1, level: 0 },
            { name: 'Auto Lvl 2', baseCost: 250, gain: 5, level: 0 },
            { name: 'Auto Lvl 3', baseCost: 1000, gain: 10, level: 0 },
            { name: 'Auto Lvl 4', baseCost: 5000, gain: 50, level: 0 }
        ]
    }
};

// Cost multiplier per level
const COST_MULTIPLIER = 1.15;

// DOM Elements
const pointsDisplay = document.getElementById('points');
const clickPowerDisplay = document.getElementById('clickPower');
const autoClickPowerDisplay = document.getElementById('autoClickPower');
const character = document.getElementById('character');
const clickerUpgradesContainer = document.getElementById('clickerUpgrades');
const autoUpgradesContainer = document.getElementById('autoUpgrades');

// Load Game State
function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameState, data);
        updateDisplay();
    }
}

// Save Game State
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

// Format Numbers
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

// Calculate Upgrade Cost
function getUpgradeCost(baseCost, level) {
    return Math.floor(baseCost * Math.pow(COST_MULTIPLIER, level));
}

// Update Display
function updateDisplay() {
    pointsDisplay.textContent = formatNumber(gameState.points);
    clickPowerDisplay.textContent = gameState.clickPower;
    autoClickPowerDisplay.textContent = gameState.autoClickPower;

    // Update upgrade buttons
    updateUpgradeButtons('clicker', clickerUpgradesContainer);
    updateUpgradeButtons('auto', autoUpgradesContainer);
}

// Update Upgrade Buttons
function updateUpgradeButtons(type, container) {
    const upgrades = gameState.upgrades[type];
    
    container.innerHTML = '';
    
    upgrades.forEach((upgrade, index) => {
        const cost = getUpgradeCost(upgrade.baseCost, upgrade.level);
        const canAfford = gameState.points >= cost;
        
        const button = document.createElement('button');
        button.className = 'upgrade-btn';
        if (canAfford) button.classList.add('affordable');
        if (!canAfford) button.disabled = true;
        
        button.innerHTML = `
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-cost">💰 ${formatNumber(cost)}</span>
            <span class="upgrade-gain">+${upgrade.gain}${type === 'auto' ? '/sec' : ''}</span>
            <span class="upgrade-owned">Lvl: ${upgrade.level}</span>
        `;
        
        button.addEventListener('click', () => buyUpgrade(type, index));
        container.appendChild(button);
    });
}

// Buy Upgrade
function buyUpgrade(type, index) {
    const upgrade = gameState.upgrades[type][index];
    const cost = getUpgradeCost(upgrade.baseCost, upgrade.level);
    
    if (gameState.points >= cost) {
        gameState.points -= cost;
        upgrade.level++;
        
        if (type === 'clicker') {
            gameState.clickPower += upgrade.gain;
        } else {
            gameState.autoClickPower += upgrade.gain;
        }
        
        saveGame();
        updateDisplay();
    }
}

// Character Click
character.addEventListener('click', (e) => {
    // Add points
    gameState.points += gameState.clickPower;
    
    // Get SVG position
    const rect = character.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = 'click-number';
    effect.textContent = '+' + gameState.clickPower;
    effect.style.left = (e.clientX - rect.left) + 'px';
    effect.style.top = (e.clientY - rect.top) + 'px';
    
    document.getElementById('clickEffect').appendChild(effect);
    
    setTimeout(() => effect.remove(), 1200);
    
    // Character animation
    character.style.animation = 'none';
    setTimeout(() => {
        character.style.animation = 'characterIdle 3s ease-in-out infinite';
    }, 50);
    
    // Scale animation
    character.style.transform = 'scale(0.85)';
    setTimeout(() => {
        character.style.transform = 'scale(1)';
    }, 100);
    
    saveGame();
    updateDisplay();
});

// Auto Clicker
setInterval(() => {
    if (gameState.autoClickPower > 0) {
        gameState.points += gameState.autoClickPower;
        saveGame();
        updateDisplay();
    }
}, 1000);

// Initialize
loadGame();
renderUpgrades();

function renderUpgrades() {
    updateDisplay();
}

// Eye tracking effect
document.addEventListener('mousemove', (e) => {
    const character_el = document.getElementById('character');
    const rect = character_el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const pupils = document.querySelectorAll('.pupil');
    
    pupils.forEach(pupil => {
        const pupilOffset = 2;
        const pupilX = pupilOffset * Math.cos(angle);
        const pupilY = pupilOffset * Math.sin(angle);
        pupil.setAttribute('cx', parseFloat(pupil.getAttribute('cx')) + pupilX * 0.3);
        pupil.setAttribute('cy', parseFloat(pupil.getAttribute('cy')) + pupilY * 0.3);
    });
});
