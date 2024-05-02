let winner = "NULL";
let IntervalId = "NotApplied";

const player = {
  maxHealth: 100,
  health: 100,
  damage: 10,
  gold: 0,
};

let fightLogNum = 0
let actLogNum = 0
let potions = 1

const enemies = {
  test: {
    name: "Geremy",
    maxHealth: 25,
    health: 25,
    damage: 10,
    baseGold: 5,
  },
};

window.addEventListener("load", function () {
  //Fight Func
  document.getElementById("FightEnemy").onclick = () => {
    fightEnemy(document.getElementById("cars").value);
  };
  //Check Money
  document.getElementById("CheckGold").onclick = () => {
    document.getElementById("ActivityStatus").innerText = (`you have ${player.gold} gold! | ${actLogNum}`)
    actLogNum += 1
  };
  //Heal Player
  document.getElementById("DrinkPotion").onclick = () => {
    if (potions > 0) {
      potions -= 1;
      player.health += player.maxHealth/4;
      document.getElementById("ActivityStatus").innerText = (`You healed for ${player.maxHealth/4} health :p | ${actLogNum}`)
      document.getElementById("PlayerStat").innerText = (`${player.health}/${player.maxHealth}`)
      actLogNum += 1
      if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
      }
    }
  };

  function fightEnemy(enemy) {
    if (IntervalId) {
      IntervalId = setInterval(DamageCalc, 1000, enemy);
    } else {
      console.log("Currently in a fight!");
    }
  }

  function calculateRandomGold(
    baseGold,
    minMultiplier = 0.5,
    maxMultiplier = 2
  ) {
    const randomMultiplier =
      Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;

    const finalGold = baseGold * randomMultiplier;

    return Math.round(finalGold);
  }

  function DamageCalc(enemy) {
    player.health -= enemies[enemy].damage;
    enemies[enemy].health -= player.damage;
    document.getElementById("FightStatus").innerText = (`You dealt ${player.damage} to ${enemies[enemy].name} but recieved ${enemies[enemy].damage} | ${fightLogNum}`)
    document.getElementById("PlayerStat").innerText = (`${player.health}/${player.maxHealth}`)

    fightLogNum += 1
    if (player.health <= 0 || enemies[enemy].health <= 0) {
      clearInterval(IntervalId);
      IntervalId = "Not Applied";
      if (player.health >= 0) {
        winner = "player";
      } else {
        winner = enemy;
      }
      console.log(winner);
      player.gold += calculateRandomGold(enemies[enemy].baseGold);
      enemies[enemy].health = enemies[enemy].maxHealth;
    }
  }
});
