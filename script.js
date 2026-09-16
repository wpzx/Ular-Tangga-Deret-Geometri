const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'dice') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'step') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'teleport') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }
}

const LADDERS = { 3: 8, 6: 15, 11: 21 };
const SNAKES  = { 13: 9, 17: 7, 22: 12 };

const CELL_TYPES = {
  1: 'start', 2: 'soal', 3: 'ice', 4: 'soal', 5: 'bonus',
  6: 'soal', 7: 'soal', 8: 'ice', 9: 'soal', 10: 'soal',
  11: 'ice', 12: 'soal', 13: 'soal', 14: 'soal', 15: 'ice',
  16: 'soal', 17: 'soal', 18: 'ice', 19: 'bonus', 20: 'soal',
  21: 'ice', 22: 'soal', 23: 'soal', 24: 'ice', 25: 'finish'
};

// Data Soal & Kunci Jawaban Berbasis Teks (14 soal, 1 soal per kotak SOAL)
const DATA_SOAL = [
  {
    soal: "<p style='font-weight:600;'>Hitung jumlah 4 suku pertama dari deret berikut!</p><p style='font-size:1.2rem; font-weight:700; margin-top:8px;'>3 + 6 + 12 + 24</p>",
    kunci: "<p style='font-size:1.1rem; font-weight:700; color:#16a34a;'>Jawaban: 45</p>"
  },
  {
    soal: "<p style='font-weight:600;'>Hitung jumlah 5 suku pertama dari deret berikut!</p><p style='font-size:1.2rem; font-weight:700; margin-top:8px;'>1 + 2 + 4 + 8 + 16</p>",
    kunci: "<p style='font-size:1.1rem; font-weight:700; color:#16a34a;'>Jawaban: 31</p>"
  },
  {
    soal: "<p style='font-weight:600;'>Jumlah bakteri pada hari pertama adalah 100. Setiap hari jumlahnya menjadi dua kali lipat. Berapa jumlah bakteri pada hari ke-5?</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 100<br>
        r = 2<br>
        n = 5<br><br>
        U<sub>5</sub> = a × r<sup>(n-1)</sup><br>
        U<sub>5</sub> = 100 × 2<sup>4</sup><br>
        U<sub>5</sub> = 100 × 16<br>
        <strong>U<sub>5</sub> = 1.600</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Sebuah bola dijatuhkan dari ketinggian 16 meter. Setiap pantulan mencapai setengah dari tinggi sebelumnya. Berapa tinggi pantulan ketiga?</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 16<br>
        r = 1/2<br>
        n = 3<br><br>
        U<sub>3</sub> = 16 × (1/2)<sup>2</sup><br>
        U<sub>3</sub> = 16 × 1/4<br>
        <strong>U<sub>3</sub> = 4 meter</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui deret geometri:</p><p style='font-size:1.2rem; font-weight:700; margin-top:8px;'>2 + 6 + 18 + 54 + ...</p><p style='font-weight:600; margin-top:8px;'>Hitunglah jumlah 6 suku pertama (S6) dari deret tersebut!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 2, r = 3, n = 6<br><br>
        S<sub>6</sub> = a(r<sup>n</sup> − 1) / (r − 1)<br>
        S<sub>6</sub> = 2(3<sup>6</sup> − 1) / (3 − 1)<br>
        S<sub>6</sub> = 2(729 − 1) / 2<br>
        <strong>S<sub>6</sub> = 728</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui deret geometri:</p><p style='font-size:1.2rem; font-weight:700; margin-top:8px;'>64 + 32 + 16 + 8 + ...</p><p style='font-weight:600; margin-top:8px;'>Hitunglah jumlah 5 suku pertama (S5) dari deret tersebut!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 64, r = 1/2, n = 5<br><br>
        S<sub>5</sub> = a(1 − r<sup>n</sup>) / (1 − r)<br>
        S<sub>5</sub> = 64(1 − (1/2)<sup>5</sup>) / (1 − 1/2)<br>
        S<sub>5</sub> = 64(31/32) / (1/2)<br>
        <strong>S<sub>5</sub> = 124</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Suatu deret geometri memiliki rasio r = 2 dan jumlah 4 suku pertamanya (S4) adalah 75. Tentukan nilai suku pertamanya (a)!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        r = 2, S<sub>4</sub> = 75<br><br>
        S<sub>4</sub> = a(r<sup>4</sup> − 1) / (r − 1)<br>
        75 = a(16 − 1) / 1<br>
        75 = 15a<br>
        <strong>a = 5</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Jumlah 3 suku pertama dari suatu deret geometri adalah 26. Jika suku pertamanya a = 2, tentukan nilai rasionya (r)!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 2, S<sub>3</sub> = 26<br><br>
        S<sub>3</sub> = a(r<sup>3</sup> − 1) / (r − 1) = 26<br>
        1 + r + r² = 13<br>
        r² + r − 12 = 0 → (r − 3)(r + 4) = 0<br>
        <strong>r = 3</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui suku pertama suatu deret geometri adalah a = 3 dan rasionya r = 2. Jika jumlah seluruh suku-sukunya (Sn) adalah 93, berapa banyaknya suku (n) pada deret tersebut?</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 3, r = 2, S<sub>n</sub> = 93<br><br>
        S<sub>n</sub> = a(2<sup>n</sup> − 1) / (2 − 1) = 93<br>
        2<sup>n</sup> − 1 = 31 → 2<sup>n</sup> = 32<br>
        <strong>n = 5</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui jumlah 5 suku pertama suatu deret geometri adalah 242, dengan suku pertama 2. Tentukan rasionya!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 2, S<sub>5</sub> = 242<br><br>
        (r<sup>5</sup> − 1) / (r − 1) = 121<br>
        Dicoba r = 3 → (243 − 1)/2 = 121 ✓<br>
        <strong>r = 3</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Suatu deret geometri memiliki suku pertama 3 dan jumlah 6 suku pertama adalah 189. Tentukan rasionya!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 3, S<sub>6</sub> = 189<br><br>
        (r<sup>6</sup> − 1) / (r − 1) = 63<br>
        Dicoba r = 2 → (64 − 1)/1 = 63 ✓<br>
        <strong>r = 2</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui suku pertama 4 dan rasio 3. Jika jumlah beberapa suku pertamanya adalah 484, tentukan banyak suku (n)!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 4, r = 3, S<sub>n</sub> = 484<br><br>
        S<sub>n</sub> = 4(3<sup>n</sup> − 1) / (3 − 1) = 484<br>
        3<sup>n</sup> − 1 = 242 → 3<sup>n</sup> = 243<br>
        <strong>n = 5 suku</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Jumlah 3 suku pertama suatu deret geometri adalah 21, sedangkan jumlah 6 suku pertamanya adalah 189. Tentukan suku pertama (a) dan rasionya (r)!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        S<sub>3</sub> = 21, S<sub>6</sub> = 189<br><br>
        S<sub>6</sub> = S<sub>3</sub>(1 + r<sup>3</sup>)<br>
        189 = 21(1 + r<sup>3</sup>) → 1 + r<sup>3</sup> = 9 → r<sup>3</sup> = 8 → r = 2<br>
        S<sub>3</sub> = a(2<sup>3</sup> − 1)/(2 − 1) = 7a = 21<br>
        <strong>a = 3, r = 2</strong>
      </div>
    `
  },
  {
    soal: "<p style='font-weight:600;'>Diketahui suku pertama 5 dan rasio −2. Tentukan jumlah 7 suku pertama (S7)!</p>",
    kunci: `
      <div style='text-align:left; line-height:1.6;'>
        <strong>Diketahui:</strong><br>
        a = 5, r = −2, n = 7<br><br>
        S<sub>7</sub> = a(r<sup>7</sup> − 1) / (r − 1)<br>
        S<sub>7</sub> = 5((−2)<sup>7</sup> − 1) / (−2 − 1)<br>
        S<sub>7</sub> = 5(−129) / (−3)<br>
        <strong>S<sub>7</sub> = 215</strong>
      </div>
    `
  }
];

// Urutan kotak bertipe SOAL di papan (ascending), dipetakan 1:1 ke DATA_SOAL
// sehingga setiap kotak SOAL punya soalnya sendiri (tidak diacak/diputar).
const SOAL_CELL_ORDER = Object.keys(CELL_TYPES)
  .map(Number)
  .filter(num => CELL_TYPES[num] === 'soal')
  .sort((a, b) => a - b);

const QUESTION_BY_CELL = {};
SOAL_CELL_ORDER.forEach((cellNum, idx) => {
  QUESTION_BY_CELL[cellNum] = DATA_SOAL[idx % DATA_SOAL.length];
});

const DATA_ICE_BREAKING = [
  "Sebutkan 5 bangun ruang!",
  "Sebutkan 3 nama pahlawan di Indonesia!",
  "Nyanyikan lagu daerah bersama-sama!",
  "Sebutkan 5 benda berbentuk tabung!",
  "Peragakan yel-yel Sikap Warok kalian!"
];

let currentPosition = 1;
let isRolling = false;

let gameDifficulty = 'hard';

const boardElem = document.getElementById('board');
const sharedToken = document.getElementById('shared-token');
const btnRoll = document.getElementById('btn-roll');
const cubeElem = document.getElementById('cube');
const playerPosText = document.getElementById('player-position-text');
const secretToggle = document.getElementById('group-secret-toggle');

const eventModal = document.getElementById('event-modal');
const winnerModal = document.getElementById('winner-modal');
const modalBadge = document.getElementById('modal-header-badge');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalAnswerBox = document.getElementById('modal-answer-box');
const modalAnswerContent = document.getElementById('modal-answer-content');
const btnShowAnswer = document.getElementById('btn-show-answer');
const btnCorrect = document.getElementById('btn-answer-correct');
const btnWrong = document.getElementById('btn-answer-wrong');
const btnCloseX = document.getElementById('btn-close-x');

if (secretToggle) {
  secretToggle.addEventListener('dblclick', () => {
    if (gameDifficulty === 'hard') {
      gameDifficulty = 'easy';
      secretToggle.classList.remove('hard-mode');
      secretToggle.classList.add('easy-mode');
    } else {
      gameDifficulty = 'hard';
      secretToggle.classList.remove('easy-mode');
      secretToggle.classList.add('hard-mode');
    }
  });
}

function initBoard() {
  boardElem.querySelectorAll('.cell').forEach(c => c.remove());

  for (let row = 4; row >= 0; row--) {
    let isEvenRow = (4 - row) % 2 === 1;
    for (let col = 0; col < 5; col++) {
      let colIdx = isEvenRow ? (4 - col) : col;
      let cellNumber = (row * 5) + colIdx + 1;
      
      const cell = document.createElement('div');
      cell.className = `cell cell-${CELL_TYPES[cellNumber]}`;
      cell.id = `cell-${cellNumber}`;
      
      let typeLabel = CELL_TYPES[cellNumber].toUpperCase();
      cell.innerHTML = `
        <span class="cell-number">${cellNumber}</span>
        <span class="cell-type">${typeLabel}</span>
      `;
      
      boardElem.appendChild(cell);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initBoard();
  updatePawnPosition(1, false);
});

function updatePawnPosition(cellNum, playStepSound = true) {
  const cellElem = document.getElementById(`cell-${cellNum}`);
  if (!cellElem) return;

  const boardRect = boardElem.getBoundingClientRect();
  const cellRect = cellElem.getBoundingClientRect();

  const x = cellRect.left - boardRect.left + (cellRect.width / 2) - 16;
  const y = cellRect.top - boardRect.top + (cellRect.height / 2) - 16;

  sharedToken.style.left = `${x}px`;
  sharedToken.style.top = `${y}px`;

  if (playStepSound) {
    playSound('step');
  }

  currentPosition = cellNum;
  if (playerPosText) {
    playerPosText.innerText = currentPosition;
  }
}

function getRandomDiceRoll() {
  if (gameDifficulty === 'hard' && currentPosition >= 16) {
    for (let roll = 1; roll <= 6; roll++) {
      let targetPos = currentPosition + roll;
      if (SNAKES[targetPos]) return roll;
    }
  }

  if (gameDifficulty === 'easy') {
    for (let roll = 1; roll <= 6; roll++) {
      let targetPos = currentPosition + roll;
      if (LADDERS[targetPos]) return roll;
    }
  }

  const rand = Math.random();
  let targetType = 'soal';
  if (rand < 0.50) targetType = 'soal';
  else if (rand < 0.85) targetType = 'ice';
  else targetType = 'bonus';

  let validRolls = [];
  for (let roll = 1; roll <= 6; roll++) {
    let targetPos = currentPosition + roll;
    if (gameDifficulty === 'easy' && SNAKES[targetPos]) continue;
    if (targetPos <= 25 && CELL_TYPES[targetPos] === targetType) {
      validRolls.push(roll);
    }
  }

  if (validRolls.length > 0) {
    return validRolls[Math.floor(Math.random() * validRolls.length)];
  }

  let fallbackRolls = [];
  for (let roll = 1; roll <= 6; roll++) {
    let targetPos = currentPosition + roll;
    if (targetPos <= 25) {
      if (gameDifficulty === 'easy' && SNAKES[targetPos]) continue;
      fallbackRolls.push(roll);
    }
  }

  if (fallbackRolls.length > 0) {
    return fallbackRolls[Math.floor(Math.random() * fallbackRolls.length)];
  }

  return Math.floor(Math.random() * 6) + 1;
}

btnRoll.addEventListener('click', () => {
  if (isRolling) return;
  isRolling = true;
  btnRoll.disabled = true;

  cubeElem.className = 'cube rolling';
  playSound('dice');

  setTimeout(() => {
    const rolledNumber = getRandomDiceRoll();
    cubeElem.className = `cube show-${rolledNumber}`;
    
    setTimeout(() => {
      movePawnSteps(rolledNumber);
    }, 700);
  }, 800);
});

function movePawnSteps(steps, isPenalty = false) {
  let stepsLeft = steps;

  let interval = setInterval(() => {
    if (stepsLeft > 0 && currentPosition < 25) {
      currentPosition++;
      updatePawnPosition(currentPosition, true);
      stepsLeft--;
    } else if (stepsLeft < 0 && currentPosition > 1) {
      currentPosition--;
      updatePawnPosition(currentPosition, true);
      stepsLeft++;
    } else {
      clearInterval(interval);
      highlightCell(currentPosition);

      if (!isPenalty) {
        setTimeout(() => checkTeleportOrEvent(currentPosition), 600);
      } else {
        resetRollButton();
      }
    }
  }, 650);
}

function highlightCell(cellNum) {
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('active-glow'));
  const activeCell = document.getElementById(`cell-${cellNum}`);
  if (activeCell) activeCell.classList.add('active-glow');
}

function checkTeleportOrEvent(pos) {
  if (LADDERS[pos]) {
    playSound('teleport');
    updatePawnPosition(LADDERS[pos], true);
    setTimeout(() => triggerEvent(LADDERS[pos]), 700);
    return;
  }

  if (SNAKES[pos]) {
    playSound('teleport');
    updatePawnPosition(SNAKES[pos], true);
    setTimeout(() => triggerEvent(SNAKES[pos]), 700);
    return;
  }

  triggerEvent(pos);
}

function triggerEvent(pos) {
  if (pos === 25) {
    showWinnerModal();
    return;
  }

  const type = CELL_TYPES[pos];

  if (type === 'soal') {
    const item = QUESTION_BY_CELL[pos];

    openModal(
      "SOAL",
      "Jawab Soal Berikut!",
      item.soal,
      item.kunci,
      "var(--soal-blue)",
      true
    );
  } else if (type === 'ice') {
    const text = DATA_ICE_BREAKING[Math.floor(Math.random() * DATA_ICE_BREAKING.length)];
    openModal("ICE BREAKING", "Aktivitas Seru", `<p style="font-weight:600; padding:10px;">${text}</p>`, null, "var(--ice-green)", false);
  } else if (type === 'bonus') {
    setupBonusGachaModal();
  } else {
    resetRollButton();
  }
}

function setupBonusGachaModal() {
  const options = [
    "Pilih Kelompok Lain Untuk Maju",
    "Kocok Dadu Sekali Lagi"
  ];
  
  if (Math.random() > 0.5) {
    options.reverse();
  }

  const gachaHTML = `
    <div style="width:100%;">
      <p style="font-weight:600; margin-bottom:12px;">Pilih salah satu kartu untuk mendapatkan bonus!</p>
      <div class="gacha-container">
        <div class="gacha-card" onclick="flipGachaCard(this)">
          <div class="gacha-card-inner">
            <div class="gacha-front">
              <span class="gacha-front-icon">🎁</span>
              <span style="font-weight:700; margin-top:5px;">KARTU 1</span>
            </div>
            <div class="gacha-back">${options[0]}</div>
          </div>
        </div>
        <div class="gacha-card" onclick="flipGachaCard(this)">
          <div class="gacha-card-inner">
            <div class="gacha-front">
              <span class="gacha-front-icon">🎁</span>
              <span style="font-weight:700; margin-top:5px;">KARTU 2</span>
            </div>
            <div class="gacha-back">${options[1]}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  openModal("BONUS", "Gacha Kartu Keberuntungan", gachaHTML, null, "var(--bonus-yellow)", false);
}

function flipGachaCard(cardElem) {
  const allCards = document.querySelectorAll('.gacha-card');
  allCards.forEach(card => card.style.pointerEvents = 'none');

  cardElem.classList.add('flipped');
  playSound('teleport');
}

function openModal(badge, title, bodyHTML, answerHTML, color, isQuestion = false) {
  modalBadge.innerText = badge;
  modalBadge.style.backgroundColor = color;
  modalTitle.innerText = title;
  modalBody.innerHTML = bodyHTML;

  if (answerHTML) {
    modalAnswerContent.innerHTML = answerHTML;
    btnShowAnswer.style.display = "inline-block";
  } else {
    btnShowAnswer.style.display = "none";
  }

  if (isQuestion) {
    btnCorrect.style.display = "inline-block";
    btnWrong.style.display = "inline-block";
  } else {
    btnCorrect.style.display = "none";
    btnWrong.style.display = "none";
  }

  modalAnswerBox.classList.add('hidden');
  eventModal.classList.add('active');
}

btnShowAnswer.addEventListener('click', () => {
  modalAnswerBox.classList.toggle('hidden');
});

btnCloseX.addEventListener('click', () => {
  eventModal.classList.remove('active');
  resetRollButton();
});

btnCorrect.addEventListener('click', () => {
  eventModal.classList.remove('active');
  resetRollButton();
});

btnWrong.addEventListener('click', () => {
  playSound('wrong');
  eventModal.classList.remove('active');
  movePawnSteps(-1, true);
});

function resetRollButton() {
  isRolling = false;
  btnRoll.disabled = false;
}

function showWinnerModal() {
  winnerModal.classList.add('active');
}

window.addEventListener('resize', () => updatePawnPosition(currentPosition, false));