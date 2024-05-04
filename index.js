// Constants
const COMBAT_INTERVAL_MS = 1000;
const HEALTH_REGEN_INTERVAL_MS = 1000; // 0.5 seconds

// Initialize variables
let winner = "NULL";
let combatInterval = "NotApplied";
let fightLogNumber = 0;
let actionLogNumber = 0;
let potions = 1;

// Array of tips
const tips = [
    "Tip: Try using potions to restore your health during battles!",
    "Tip: Level up your character to increase your max health and damage!",
    "Tip: Check your gold regularly to make sure you have enough for potions!",
    "Tip: Pay attention to the enemy's health and damage during combat!",
    "Tip: Keep an eye on your experience points to level up!",
    "Tip: The console can have some bonus info for you!",
];

// Player object
const player = {
    maxHealth: 100,
    health: 100,
    damage: 10,
    gold: 0,
    level: 1,
    xp: 0,
    xpReq: 100,
};

// Enemy objects
const enemies = {
    test: {
        name: "Geremy",
        maxHealth: 25,
        health: 25,
        damage: 10,
        baseGold: 5,
        xpVal: 100,
    },
};

// Event listener for loading the game
window.addEventListener("load", function () {
    document.getElementById("FightEnemy").onclick = startCombat;
    document.getElementById("DrinkPotion").onclick = healPlayerWithPotion;
    document.getElementById("BuyPotion").onclick = buyPotion;

    // Set interval for changing the tip line every 5 seconds
    setInterval(updateTipLine, 20000);

    // Set interval for regenerating player health every 1 second
    setInterval(regeneratePlayerHealth, HEALTH_REGEN_INTERVAL_MS);
});

// Function to start combat with the selected enemy
function startCombat() {
    const selectedEnemy = document.getElementById("enemies").value;
    if (combatInterval === "NotApplied") {
        combatInterval = setInterval(() => calculateDamage(selectedEnemy), COMBAT_INTERVAL_MS);
    } else {
        console.log("Currently in a fight!");
    }
}

// Function to calculate damage dealt and received during combat
function calculateDamage(enemyKey) {
    const enemy = enemies[enemyKey];
    player.health -= enemy.damage;
    enemy.health -= player.damage;

    updateFightStatus(player.damage, enemy.name, enemy.damage);
    updatePlayerStatus();
    fightLogNumber += 1;

    if (isCombatOver(player, enemy)) {
        endCombat(enemyKey);
    }
}

// Function to determine if the combat is over
function isCombatOver(player, enemy) {
    return player.health <= 0 || enemy.health <= 0;
}

// Function to end combat and handle outcomes
function endCombat(enemyKey) {
    clearInterval(combatInterval);
    combatInterval = "NotApplied";

    const enemy = enemies[enemyKey];
    winner = player.health > 0 ? "player" : enemyKey;

    if (winner === "player") {
        handlePlayerVictory(enemy);
    } else {
        console.log(`The winner is ${enemy.name}`);
    }

    updatePlayerStatus();
}

// Function to handle player victory during combat
function handlePlayerVictory(enemy) {
    document.getElementById("FightStatus").innerText = `You beat ${enemy.name}! | Log ${fightLogNumber}`;
    player.gold += calculateRandomGold(enemy.baseGold);
    givePlayerXp(enemy.xpVal);
    resetEnemyHealth(enemy);
}

// Function to calculate random gold earned after a fight
function calculateRandomGold(baseGold, minMultiplier = 0.5, maxMultiplier = 2) {
    const randomMultiplier = Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;
    return Math.round(baseGold * randomMultiplier);
}

// Function to reset enemy health to max
function resetEnemyHealth(enemy) {
    enemy.health = enemy.maxHealth;
}

// Function to heal player with a potion
function healPlayerWithPotion() {
    if (potions > 0) {
        const healingAmount = player.maxHealth / 4;
        potions -= 1;
        player.health += healingAmount;

        displayHealingStatus(healingAmount);
        actionLogNumber += 1;

        if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
        }
        updatePlayerStatus();
    }
}

// Function to display healing status
function displayHealingStatus(healingAmount) {
    document.getElementById("ActivityStatus").innerText = `You healed for ${healingAmount} health | Log ${actionLogNumber}`;
}

// Function to buy a potion for the player
function buyPotion() {
    const potionCost = 15;

    if (player.gold >= potionCost) {
        player.gold -= potionCost;
        potions += 1;

        updatePlayerStatus();
        document.getElementById("ActivityStatus").innerText = `You bought a potion for ${potionCost} gold. Total potions: ${potions} | Log ${actionLogNumber}`;
        actionLogNumber += 1;
    } else {
        document.getElementById("ActivityStatus").innerText = `Not enough gold to buy a potion! You need ${potionCost} gold. | Log ${actionLogNumber}`;
        actionLogNumber += 1;
    }
}

// Function to update the fight status in the DOM
function updateFightStatus(playerDamage, enemyName, enemyDamage) {
    document.getElementById("FightStatus").innerText = `You dealt ${playerDamage} damage to ${enemyName} but received ${enemyDamage} damage | Log ${fightLogNumber}`;
}

// Function to update player's health, gold, and experience in the DOM
function updatePlayerStatus() {
    document.getElementById("PlayerStat").innerText = `${player.health}/${player.maxHealth} HP || Gold: ${player.gold} || Level: ${player.level} || XP: ${player.xp}/${player.xpReq}`;
}

// Function to give player experience and level up if necessary
function givePlayerXp(xpVal) {
    player.xp += xpVal;

    if (player.xp >= player.xpReq) {
        player.xp = 0;
        player.xpReq = Math.round(player.xpReq * 1.05);
        player.level++;

        levelUpPlayer();
    }
}

// Function to handle player leveling up
function levelUpPlayer() {
    const healthIncrease = Math.round(player.maxHealth * 0.1); // Increase max health by 10%
    const damageIncrease = Math.round(player.damage * 0.2); // Increase damage by 20%

    player.maxHealth += healthIncrease;
    player.damage += damageIncrease;

    // Adjust player's current health to the new max health if necessary
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }

    updatePlayerStatus();
    displayLevelUpMessage();
}

// Function to display the level-up message
function displayLevelUpMessage() {
    document.getElementById("ActivityStatus").innerText = `You leveled up to level ${player.level} and gained 10% more stats!`;
}

// Function to regenerate player's health
function regeneratePlayerHealth() {
    const healthRegenAmount = player.maxHealth * 0.01;

    player.health += Math.round(healthRegenAmount);

    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }

    updatePlayerStatus();
}

// Function to update the tip line with a random tip
function updateTipLine() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById("TipLine").innerText = randomTip;
}