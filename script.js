let participants = [];
let prizes = [];
let currentPrizeIndex = 0;

function prepareRoll() {
  const rawText = document.getElementById('rawData').value;
  const prizesText = document.getElementById('prizesList').value;
  const requireTag = document.getElementById('requireTag').checked;
  const uniqueOnly = document.getElementById('uniqueOnly').checked;

  prizes = prizesText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  if (prizes.length === 0) {
    alert("Vlož prosím alespoň jednu výhru!");
    return;
  }

  if (!rawText.trim()) {
    alert("Vlož prosím text zkopírovaných komentářů!");
    return;
  }

  // Rozdělení na řádky a pročištění
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let parsedUsers = [];

  lines.forEach(line => {
    // Odfiltrování podkomentářů a balastu z IG
    if (line.match(/^(Odpovědět|Zobrazit odpovědi|Reply|View replies|\d+[dhm])/i)) return;
    if (requireTag && !line.includes('@')) return;

    // Extrakce uživatelského jména
    let username = line.split(' ')[0].replace(/[^a-zA-Z0-9._]/g, '');
    if (username.length > 2) {
      parsedUsers.push(username);
    }
  });

  if (uniqueOnly) {
    parsedUsers = [...new Set(parsedUsers)];
  }

  if (parsedUsers.length < prizes.length) {
    alert(`Máš méně platných účastníků (${parsedUsers.length}) než zadaných výher (${prizes.length})!`);
    return;
  }

  participants = parsedUsers;
  currentPrizeIndex = 0;

  document.getElementById('setup-form').style.display = 'none';
  document.getElementById('roll-section').style.display = 'block';
  document.getElementById('winnersContainer').innerHTML = "";
  document.getElementById('winnersList').style.display = "none";

  updatePrizeDisplay();
}

function updatePrizeDisplay() {
  document.getElementById('prizeBadge').innerText = `${currentPrizeIndex + 1}. MÍSTO`;
  document.getElementById('displayPrize').innerText = prizes[currentPrizeIndex];
  
  const btn = document.getElementById('rollBtn');
  btn.disabled = false;
  btn.innerText = `Losovat ${currentPrizeIndex + 1}. cenu`;
}

function spin() {
  if (currentPrizeIndex >= prizes.length) return;

  const btn = document.getElementById('rollBtn');
  btn.disabled = true;

  const slot = document.getElementById('slotContainer');
  const currentPrize = prizes[currentPrizeIndex];
  
  let rollItems = [];
  for (let i = 0; i < 25; i++) {
    const randUser = participants[Math.floor(Math.random() * participants.length)];
    rollItems.push(randUser);
  }

  const winnerIndexInArray = Math.floor(Math.random() * participants.length);
  const winner = participants[winnerIndexInArray];
  rollItems.push(winner);

  participants.splice(winnerIndexInArray, 1);

  slot.innerHTML = rollItems.map(item => `<div class="slot-item">@${item}</div>`).join('');
  slot.style.transition = 'none';
  slot.style.top = '0px';

  setTimeout(() => {
    const itemHeight = 60;
    const targetTop = -((rollItems.length - 1) * itemHeight);
    slot.style.transition = 'top 3.2s cubic-bezier(0.15, 0.85, 0.35, 1.2)';
    slot.style.top = `${targetTop}px`;
  }, 50);

  setTimeout(() => {
    const list = document.getElementById('winnersContainer');
    list.innerHTML += `
      <div class="winner-item">
        <div class="winner-head">
          <span class="num">#${currentPrizeIndex + 1}</span>
          <span>@${winner}</span>
        </div>
        <div class="winner-prize">🎁 ${currentPrize}</div>
      </div>
    `;
    document.getElementById('winnersList').style.display = "block";

    currentPrizeIndex++;

    if (currentPrizeIndex < prizes.length) {
      updatePrizeDisplay();
    } else {
      document.getElementById('prizeBadge').innerText = "HOTOVO";
      document.getElementById('displayPrize').innerText = "Všechny ceny byly rozdány!";
      btn.innerText = "Konec losování";
      btn.disabled = true;
    }
  }, 3400);
}
