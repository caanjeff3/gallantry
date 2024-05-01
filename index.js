window.addEventListener("load", function () {
  const player = {
    health: 100,
    damage: 10,
  };
  let winner = "NULL";
  let IntervalId = "NotApplied";

  const enemies = {
    test: {
      MaxHealth: 25,
      health: 25,
      damage: 10,
    },
  };

  document.getElementById("FightEnemy").onclick = () => {
    fightEnemy(document.getElementById("cars").value);
  };

  function fightEnemy(enemy) {
    if (IntervalId) {
      IntervalId = setInterval(DamageCalc, 1000, enemy);
    } else {
      console.log("Currently in a fight!");
    }
  }

  function DamageCalc(enemy) {
    player.health -= enemies[enemy].damage;
    enemies[enemy].health -= player.damage;
    console.log(`player health ${player.health}`);
    console.log(`enemy health ${enemies[enemy].health}`);
    if (player.health <= 0 || enemies[enemy].health <= 0) {
      clearInterval(IntervalId);
      IntervalId = "Not Applied";
      if (player.health >= 0) {
        winner = "player";
      } else {
        winner = enemy;
      }
      console.log(winner);
      enemies[enemy].health = enemies[enemy].MaxHealth;
    }
  }
});
