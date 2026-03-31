const loginBtn = document.getElementById("loginBtn");
const restartBtn = document.getElementById("restartBtn");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");
const battleArea = document.getElementById("battleArea");
const heroIcon = document.getElementById("heroIcon");
const monstersContainer = document.getElementById("monsters");
const statusText = document.getElementById("statusText");
const victoryPopup = document.getElementById("victoryPopup");
const fireworksContainer = document.getElementById("fireworks");
const victoryRestartBtn = document.getElementById("victoryRestartBtn");
let moveTimer = null;
let fireworkTimer = null;

const correctPassword = "08032025";

const monstersData = [
  {
    id: "monster1",
    name: "nghệ thuật lãnh đạo",
    emoji: "🦄",
    hp: 100,
  },
  {
    id: "monster2",
    name: "leadership",
    emoji: "🐻",
    hp: 100,
  },
  {
    id: "monster3",
    name: "quản trị dự án",
    emoji: "🐲",
    hp: 100,
  },
];

let monsters = [];

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((section) => {
    section.classList.remove("active");
  });
  screen.classList.add("active");
}

function showVictoryPopup() {
  victoryPopup.classList.add("active");
  startFireworks();
}

function hideVictoryPopup() {
  victoryPopup.classList.remove("active");
  stopFireworks();
}

function createFireworkSpark() {
  if (!fireworksContainer) return;
  const spark = document.createElement("span");
  spark.style.left = `${Math.random() * 80 + 10}%`;
  spark.style.top = `${Math.random() * 60 + 10}%`;
  spark.style.background = `hsl(${Math.random() * 360}, 90%, 65%)`;
  spark.style.animationDuration = `${0.9 + Math.random() * 0.7}s`;
  spark.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
  fireworksContainer.appendChild(spark);
  setTimeout(() => spark.remove(), 1400);
}

function startFireworks() {
  if (!fireworksContainer) return;
  stopFireworks();
  for (let i = 0; i < 10; i++) {
    createFireworkSpark();
  }
  fireworkTimer = setInterval(() => {
    for (let i = 0; i < 6; i++) {
      createFireworkSpark();
    }
  }, 300);
}

function stopFireworks() {
  if (fireworkTimer) {
    clearInterval(fireworkTimer);
    fireworkTimer = null;
  }
  if (!fireworksContainer) return;
  fireworksContainer.innerHTML = "";
}

function updateStatus() {
  const alive = monsters.filter((monster) => monster.hp > 0).length;
  if (alive === 0) {
    statusText.textContent = "Tất cả quái vật đã bị tiêu diệt!";
    stopMonsterMotion();
    showVictoryPopup();
    return;
  }
  statusText.textContent = `Còn ${alive} quái vật đang chờ bạn đánh bại.`;
}

function getRandomPosition() {
  const rect = battleArea.getBoundingClientRect();
  const size = 112;
  const x = Math.random() * Math.max(0, rect.width - size - 24) + 12;
  const y = Math.random() * Math.max(0, rect.height - size - 80) + 60;
  return { x, y };
}

function renderMonsters() {
  monstersContainer.innerHTML = "";
  monsters.forEach((monster, index) => {
    const card = document.createElement("div");
    card.className = "monster";
    card.dataset.id = monster.id;
    card.style.left = `${monster.x}px`;
    card.style.top = `${monster.y}px`;
    card.style.animationDelay = `${0.2 + index * 0.3}s`;

    card.innerHTML = `
      <div class="monster-icon">${monster.emoji}</div>
      <div class="hp-track"><div class="hp-fill" style="width: ${monster.hp}%"></div></div>
      <p class="monster-name">${monster.name}</p>
    `;

    card.addEventListener("click", () => {
      if (monster.hp <= 0 || victoryPopup.classList.contains("active")) return;
      shootBullet(card);
      monster.hp = Math.max(0, monster.hp - 20);
      const fill = card.querySelector(".hp-fill");
      fill.style.width = `${monster.hp}%`;
      if (monster.hp === 0) {
        card.classList.add("dead");
        setTimeout(() => card.remove(), 420);
      }
      updateStatus();
    });

    monstersContainer.appendChild(card);
  });
}

function shootBullet(targetElement) {
  const targetRect = targetElement.getBoundingClientRect();
  const heroRect = heroIcon.getBoundingClientRect();
  const areaRect = battleArea.getBoundingClientRect();
  const bullet = document.createElement("span");
  bullet.className = "bullet";

  const startX = heroRect.left + heroRect.width / 2 - areaRect.left;
  const startY = heroRect.top + heroRect.height / 2 - areaRect.top;
  const endX = targetRect.left + targetRect.width / 2 - areaRect.left;
  const endY = targetRect.top + targetRect.height / 2 - areaRect.top;

  bullet.style.left = `${startX}px`;
  bullet.style.top = `${startY}px`;
  battleArea.appendChild(bullet);

  requestAnimationFrame(() => {
    bullet.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
  });

  setTimeout(() => bullet.remove(), 420);
}

function resetGame() {
  hideVictoryPopup();
  monsters = monstersData.map((monster) => ({ ...monster, ...getRandomPosition() }));
  renderMonsters();
  updateStatus();
  startMonsterMotion();
}

function startMonsterMotion() {
  if (moveTimer) {
    clearInterval(moveTimer);
  }
  moveTimer = setInterval(() => {
    monsters.forEach((monster) => {
      if (monster.hp <= 0) return;
      const newPos = getRandomPosition();
      monster.x = newPos.x;
      monster.y = newPos.y;
      const element = document.querySelector(`[data-id="${monster.id}"]`);
      if (element) {
        element.style.left = `${monster.x}px`;
        element.style.top = `${monster.y}px`;
      }
    });
  }, 640);
}

function stopMonsterMotion() {
  if (moveTimer) {
    clearInterval(moveTimer);
    moveTimer = null;
  }
}

loginBtn.addEventListener("click", () => {
  const value = passwordInput.value.trim();
  if (value === correctPassword) {
    loginMessage.textContent = "Đăng nhập thành công!";
    loginMessage.style.color = "#2f855a";
    setTimeout(() => {
      showScreen(gameScreen);
      resetGame();
    }, 300);
  } else {
    loginMessage.textContent = "Sai mật khẩu. Vui lòng thử lại.";
    loginMessage.style.color = "#ff476f";
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loginBtn.click();
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

victoryRestartBtn.addEventListener("click", () => {
  resetGame();
});

battleArea.addEventListener("mousemove", (event) => {
  const rect = battleArea.getBoundingClientRect();
  const x = (event.clientX - rect.left - rect.width / 2) / 25;
  const y = (event.clientY - rect.top - rect.height / 2) / 30;
  heroIcon.style.transform = `translate(${x}px, ${y}px)`;
});

battleArea.addEventListener("mouseleave", () => {
  heroIcon.style.transform = "translate(0, 0)";
});

showScreen(loginScreen);
