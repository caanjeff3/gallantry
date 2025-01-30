// Constants
const COMBAT_INTERVAL_MS = 1000;
const HEALTH_REGEN_INTERVAL_MS = 1000; // 1 second


// Player state variables
let combatInterval = null;
let potions = 1;

const tips = [
  "Tip: Use potions to restore health during battles!",
  "Tip: Level up your character to increase max health and damage!",
  "Tip: Keep an eye on your gold to buy potions!",
  "Tip: Pay attention to enemy health and damage during combat!",
  "Tip: Track your experience points to level up!",
  "Tip: Check the console for bonus info!",
  "Tip: Hover over enemy names for more info!",
];

const shopItems = [
  {
    name: "Potion",
    cost: 15,
    effect: function (player) {
      player.health += player.maxHealth * 0.25;
      if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
      }
    },
  },
  {
    name: "Sword",
    cost: 65,
    effect: function (player) {
      if (player.damage <= 30) {
        player.damage++;
      } else {
        player.damage += 2;
      }
    },
  },
  //TODO: mroe things :3
];

// Player attributes
const player = {
  maxHealth: 100,
  health: 100,
  damage: 10,
  gold: 0,
  level: 1,
  xp: 0,
  xpReq: 100,
};

// Enemy data

const enemies = {
  //Start of Forest (0-10)
  rat: { name: "Rat", maxHealth: 25, health: 25, damage: 10, baseGold: 5, xpVal: 5 },
  wildBoar: { name: "Wild Boar", maxHealth: 30, health: 30, damage: 12, baseGold: 7, xpVal: 7 },
  ent: { name: "Ent", maxHealth: 60, health: 60, damage: 18, baseGold: 15, xpVal: 15 },
  direWolf: { name: "Dire Wolf", maxHealth: 75, health: 75, damage: 20, baseGold: 20, xpVal: 20 },
  ancientGuardian: { name: "Ancient Guardian", maxHealth: 500, health: 500, damage: 30, baseGold: 100, xpVal: 100 },
  
  mountainBandit: { name: "Mountain Bandit", maxHealth: 100, health: 100, damage: 25, baseGold: 30, xpVal: 30 },
  frostSpider: { name: "Frost Spider", maxHealth: 200, health: 200, damage: 35, baseGold: 45, xpVal: 45 },
  iceTroll: { name: "Ice Troll", maxHealth: 444, health: 444, damage: 55, baseGold: 95, xpVal: 95 },
  snowYeti: { name: "Snow Yeti", maxHealth: 200, health: 200, damage: 35, baseGold: 50, xpVal: 50 },
  frozenDragon: { name: "Frozen Dragon", maxHealth: 1000, health: 1000, damage: 50, baseGold: 500, xpVal: 500 },
  
  lavaElemental: { name: "Lava Elemental", maxHealth: 300, health: 300, damage: 40, baseGold: 60, xpVal: 60 },
  fireSalamander: { name: "Fire Salamander", maxHealth: 350, health: 350, damage: 45, baseGold: 70, xpVal: 70 },
  magmaGolem: { name: "Magma Golem", maxHealth: 400, health: 400, damage: 50, baseGold: 80, xpVal: 80 },
  volcanicDragon: { name: "Volcanic Dragon", maxHealth: 2000, health: 2000, damage: 70, baseGold: 1000, xpVal: 1000 },

  crystalWolf: { name: "Crystal Wolf", maxHealth: 150, health: 150, damage: 40, baseGold: 50, xpVal: 50 },
  glimmeringDryad: { name: "Glimmering Dryad", maxHealth: 180, health: 180, damage: 45, baseGold: 55, xpVal: 55 },
  crystalGolem: { name: "Crystal Golem", maxHealth: 300, health: 300, damage: 60, baseGold: 70, xpVal: 70 },
  shimmeringUnicorn: { name: "Shimmering Unicorn", maxHealth: 450, health: 450, damage: 80, baseGold: 100, xpVal: 100 },
  luminousElemental: { name: "Luminous Elemental", maxHealth: 600, health: 600, damage: 90, baseGold: 120, xpVal: 120 },
  celestialPhoenix: { name: "Celestial Phoenix", maxHealth: 3000, health: 3000, damage: 150, baseGold: 500, xpVal: 1500 }
};

// me when i listen for events
window.addEventListener("load", initializeGame);
window.addEventListener("beforeunload", () => savePlayerStatsToCookies(player));

function initializeGame() {
  // Set up button event listeners
  document.getElementById("FightEnemy").addEventListener("click", startCombat);
  document
    .getElementById("reset-player-stats")
    .addEventListener("click", resetPlayerStats);
  document
    .getElementById("reset-health")
    .addEventListener("click", resetPlayerHealth);
  document.getElementById("add-gold").addEventListener("click", addGold);
  document.getElementById("level-up").addEventListener("click", levelUpPlayer);

  // Set up intervals
  setInterval(updateTipLine, 20000); // Update tip line every 20 seconds
  setInterval(regeneratePlayerHealth, HEALTH_REGEN_INTERVAL_MS); // Regenerate health every 1 second
  filterEnemiesByLevel(player.level);

  // Load player stats from cookies
  loadPlayerStatsFromCookies();
  const devPanel = document.getElementById("dev-panel");
  devPanel.style.display = "none"; // Hide the thingy by default
}

// Player stats load/save
function loadPlayerStatsFromCookies() {
  const cookies = document.cookie.split("; ");
  const playerStatsCookie = cookies.find((cookie) =>
    cookie.startsWith("playerStats=")
  );

  if (playerStatsCookie) {
    const playerStats = playerStatsCookie.split("=")[1];
    const [maxHealth, health, gold, level, xp, xpReq] = playerStats
      .split("|")
      .map(Number);

    // Update player object
    player.maxHealth = maxHealth;
    player.health = health;
    player.gold = gold;
    player.level = level;
    player.xp = xp;
    player.xpReq = xpReq;

    updatePlayerStatus();
    filterEnemiesByLevel(player.level);
  }
}

document
  .getElementById("shop-items")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("buy-button")) {
      const listItem = event.target.parentElement;
      const itemName = listItem.getAttribute("data-item");
      const itemCost = parseInt(listItem.getAttribute("data-cost"), 10);

      purchaseItem(itemName, itemCost);
    }
  });

// Function to handle item purchases
function purchaseItem(itemName, itemCost) {
  // Find the item in the shopItems array
  const item = shopItems.find(
    (item) => item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (item && player.gold >= itemCost) {
    // make player broke
    player.gold -= itemCost;
    item.effect(player);

    // Update player stats and other game elements
    updatePlayerStatus();

    // Display a purchase success message
    document.getElementById(
      "ActivityStatus"
    ).innerText = `Purchased ${item.name} for ${itemCost} gold!`;
  } else {
    // Display a failure message if not enough gold
    document.getElementById("ActivityStatus").innerText =
      "Not enough gold to purchase this item.";
  }
}

function savePlayerStatsToCookies(player) {
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const playerStats = `${player.maxHealth}|${player.health}|${player.gold}|${player.level}|${player.xp}|${player.xpReq}`;
  document.cookie = `playerStats=${playerStats}; expires=${expirationDate.toUTCString()}; path=/`;
}

// Combat logic
function startCombat() {
  const selectedEnemy = document.getElementById("enemies").value;
  if (!combatInterval) {
    combatInterval = setInterval(
      () => combatRound(selectedEnemy),
      COMBAT_INTERVAL_MS
    );
  } else {
    console.log("Currently in a fight!");
  }
}

function combatRound(enemyKey) {
  const enemy = enemies[enemyKey];

  player.health -= enemy.damage;
  enemy.health -= player.damage;

  updateFightStatus(player.damage, enemy.name, enemy.damage, enemy);
  updatePlayerStatus();

  if (isCombatOver(player, enemy)) {
    endCombat(enemyKey);
  }
}

function isCombatOver(player, enemy) {
  return player.health <= 0 || enemy.health <= 0;
}

function endCombat(enemyKey) {
  clearInterval(combatInterval);
  combatInterval = null;

  const enemy = enemies[enemyKey];
  const isPlayerWinner = player.health > 0;

  if (isPlayerWinner) {
    handlePlayerVictory(enemy);
  } else {
    handlePlayerDefeat();
  }

  updatePlayerStatus();
}

function handlePlayerVictory(enemy) {
  document.getElementById(
    "FightStatus"
  ).innerText = `You defeated the ${enemy.name}!`;
  player.gold += calculateRandomGold(enemy.baseGold);
  givePlayerXp(enemy.xpVal);
  resetEnemyHealth(enemy);
}

function handlePlayerDefeat() {
  const goldLoss = Math.round(player.gold * 0.1);
  player.gold -= goldLoss;
  player.health = 0;

  document.getElementById(
    "FightStatus"
  ).innerText = `You were defeated! Lost ${goldLoss} gold.`;
}

// Player status updates
function updateFightStatus(playerDamage, enemyName, enemyDamage, enemy) {
  document.getElementById(
    "FightStatus"
  ).innerText = `Dealt ${playerDamage} damage to the ${enemyName} and received ${enemyDamage} damage. ${enemy.health}/${enemy.maxHealth} HP left.`;
}

function updatePlayerStatus() {
  document.getElementById(
    "PlayerStat"
  ).innerText = `${player.health}/${player.maxHealth} HP || Gold: ${player.gold} || Level: ${player.level} || XP: ${player.xp}/${player.xpReq}`;
}

function displayHealingStatus(healingAmount) {
  document.getElementById(
    "ActivityStatus"
  ).innerText = `Healed for ${healingAmount} health.`;
}

function givePlayerXp(xpVal) {
  player.xp += xpVal;

  while (player.xp >= player.xpReq) {
    player.xp -= player.xpReq;
    player.xpReq = Math.round(player.xpReq * 1.05 + player.level * 5);
    levelUpPlayer();
  }
}
function LevelViaXp(targetLevel) {
  // Ensure targetLevel is higher than the current level
  if (targetLevel <= player.level) {
    console.log("Target level must be greater than the current level.");
    return;
  }

  // Calculate the XP needed for each level-up and apply it until the target level is reached
  while (player.level < targetLevel) {
    let xpNeededForNextLevel = player.xpReq - player.xp; // XP required to reach the next level
    if (player.xp + xpNeededForNextLevel >= player.xpReq) {
      player.xp += xpNeededForNextLevel;
      player.xpReq = Math.round(player.xpReq * 1.05 + player.level * 5); // Calculate new XP requirement for the next level
      levelUpPlayer(); // Function to level up the player
    }
  }
}

function levelUpPlayer() {
  let decayFactor = Math.pow(0.95, player.level);
  player.maxHealth += Math.round(player.maxHealth * (0.125 * decayFactor));
  player.damage += Math.round(player.damage * (0.2 * decayFactor));
  filterEnemiesByLevel(player.level);

  if (player.health > player.maxHealth) {
    player.health = player.maxHealth;
  }

  player.level++;
  updatePlayerStatus();
  document.getElementById(
    "ActivityStatus"
  ).innerText = `Leveled up to level ${player.level}!`;
}

// Utility functions
function calculateRandomGold(baseGold, minMultiplier = 0.5, maxMultiplier = 2) {
  const randomMultiplier =
    Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;
  return Math.round(baseGold * randomMultiplier);
}

function resetEnemyHealth(enemy) {
  enemy.health = enemy.maxHealth;
}

function regeneratePlayerHealth() {
  const healthRegenAmount = Math.round(player.maxHealth * 0.01);
  player.health += healthRegenAmount;

  if (player.health > player.maxHealth) {
    player.health = player.maxHealth;
  }

  updatePlayerStatus();
}

function showDevConsole() {
  const devPanel = document.getElementById("dev-panel");

  // Toggle the visibility of the development panel
  if (devPanel.style.display === "none") {
    devPanel.style.display = "block";
    console.log("Development panel is now visible.");
  } else {
    devPanel.style.display = "none";
    console.log("Development panel is now hidden.");
  }
}

document.addEventListener('keydown', function(event) {
  // Check if the pressed key is "H" (key code 72)
  if (event.key === 'h' || event.key === 'H') {
      showDevConsole();
  }
});

function hideDevConsole() {
  const devPanel = document.getElementById("dev-panel");

  // Hide the development panel
  devPanel.style.display = "none";
  console.log("Development panel is now hidden.");
}

function changeStylesheet() {
  // Get the current stylesheet link element
  const stylesheetLink = document.getElementById("stylesheet");

  // Array of stylesheets to cycle through
  const stylesheets = ["Styles/styleCream.css", "Styles/styleXP.css"];

  // Get the current href attribute (current stylesheet)
  const currentStylesheet = stylesheetLink.getAttribute("href");

  // Find the index of the current stylesheet in the array
  const currentIndex = stylesheets.indexOf(currentStylesheet);

  // Determine the next stylesheet index, cycling back to the start if at the end
  const nextIndex = (currentIndex + 1) % stylesheets.length;

  // Set the new stylesheet
  stylesheetLink.setAttribute("href", stylesheets[nextIndex]);
}

// Update tip line every 20 seconds
function updateTipLine() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("TipLine").innerText = randomTip;
}

// Debug functions
function resetPlayerStats() {
  player.maxHealth = 100;
  player.health = 100;
  player.damage = 10;
  player.gold = 0;
  player.level = 1;
  player.xp = 0;
  player.xpReq = 100;

  updatePlayerStatus();
  console.log("Player stats have been reset.");
}

function resetPlayerHealth() {
  player.health = player.maxHealth;
  updatePlayerStatus();
  console.log("Player health reset to max health.");
}

function addGold() {
  player.gold += 100;
  updatePlayerStatus();
}

function filterEnemiesByLevel(level) {
  // Get all optgroup elements
  const optGroups = document.querySelectorAll('optgroup');

  optGroups.forEach(optGroup => {
      // Get the minimum level required for each optgroup
      const minLevel = parseInt(optGroup.getAttribute('data-min-level'));

      // If the player's level is less than the required minimum level, hide the optgroup
      if (level <= minLevel) {
          optGroup.style.display = 'none';
      } else {
          optGroup.style.display = 'block';
      }
  });
}
