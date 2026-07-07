const todayKey = new Date().toISOString().slice(0, 10);
const stateKey = `pahlawan-fokus:${todayKey}`;
const noteKey = `pahlawan-fokus-note:${todayKey}`;

const missions = [
  { id: 'pagi', icon: '🌅', title: 'Misi Pagi', desc: 'Mandi, pakaian, sarapan, tas siap' },
  { id: 'fokus1', icon: '🎯', title: 'Fokus 10 menit', desc: 'Satu tugas kecil sampai timer selesai' },
  { id: 'gerak', icon: '⚡', title: 'Gerak badan', desc: 'Break aktif 2 menit tanpa layar lain' },
  { id: 'baik', icon: '🤝', title: 'Aksi baik', desc: 'Bantu satu hal kecil di rumah' },
  { id: 'malam', icon: '🌙', title: 'Misi Malam', desc: 'Rapikan mainan, sikat gigi, siap tidur' },
];

const moveIdeas = [
  '10 jumping jack + minum air',
  'Jalan seperti robot 1 menit',
  'Wall push-up 12 kali',
  'Ambil 5 benda dan kembalikan ke tempatnya',
  'Squat 10 kali sambil hitung keras',
  'Lempar-tangkap bola kecil 20 kali',
  'Peregangan kucing-sapi 6 kali',
  'Naik-turun tangga pelan 2 menit'
];

const calmCopy = {
  1: 'Tarik napas lewat hidung 4 hitungan. Buang pelan. Ulang 3 kali.',
  2: 'Tekan dua kaki ke lantai. Rasakan lantainya. Bahu turun. Tangan rileks.',
  3: 'Pilih satu: minta bantuan, istirahat 2 menit, atau mulai dari bagian paling mudah.'
};

let done = JSON.parse(localStorage.getItem(stateKey) || '{}');
let seconds = 10 * 60;
let timerId = null;
let timerRunning = false;

const missionList = document.getElementById('missionList');
const progressFill = document.getElementById('progressFill');
const doneCount = document.getElementById('doneCount');
const totalCount = document.getElementById('totalCount');
const dailyMessage = document.getElementById('dailyMessage');
const timerDisplay = document.getElementById('timerDisplay');
const focusCoach = document.getElementById('focusCoach');
const focusTask = document.getElementById('focusTask');
const parentToggle = document.getElementById('parentToggle');
const parentPanel = document.getElementById('parentPanel');
const parentNote = document.getElementById('parentNote');
const moveCard = document.getElementById('moveCard');

function save() { localStorage.setItem(stateKey, JSON.stringify(done)); }

function renderMissions() {
  missionList.innerHTML = '';
  missions.forEach(mission => {
    const label = document.createElement('label');
    label.className = `mission ${done[mission.id] ? 'done' : ''}`;
    label.innerHTML = `
      <input type="checkbox" ${done[mission.id] ? 'checked' : ''} aria-label="${mission.title}" />
      <div><span>${mission.icon} ${mission.title}</span><small>${mission.desc}</small></div>`;
    label.querySelector('input').addEventListener('change', (event) => {
      done[mission.id] = event.target.checked;
      save();
      renderMissions();
      if (event.target.checked) celebrate(`${mission.title} selesai. Keren, usaha kamu terlihat!`);
    });
    missionList.appendChild(label);
  });
  updateProgress();
}

function updateProgress() {
  const count = missions.filter(m => done[m.id]).length;
  totalCount.textContent = missions.length;
  doneCount.textContent = count;
  progressFill.style.width = `${(count / missions.length) * 100}%`;
  if (count === 0) dailyMessage.textContent = 'Pilih satu misi paling mudah. Menang kecil dulu.';
  else if (count < missions.length) dailyMessage.textContent = 'Bagus. Berhenti sebentar, terima pujian, lalu lanjut satu misi lagi.';
  else dailyMessage.textContent = 'Semua misi selesai. Hari ini kamu sudah latihan hebat!';
}

function formatTime(value) {
  const m = String(Math.floor(value / 60)).padStart(2, '0');
  const s = String(value % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() { timerDisplay.textContent = formatTime(seconds); }

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  const task = focusTask.value.trim();
  focusCoach.textContent = task ? `Sekarang hanya: ${task}. Setelah 10 menit, stop dan cek.` : 'Sekarang pilih satu tugas kecil saja. Tidak perlu banyak.';
  timerId = setInterval(() => {
    seconds -= 1;
    renderTimer();
    if (seconds <= 0) {
      clearInterval(timerId);
      timerRunning = false;
      seconds = 10 * 60;
      done.fokus1 = true;
      save();
      renderTimer();
      renderMissions();
      celebrate('Fokus selesai. Minta high-five dari Ayah/Ibu!');
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerRunning = false;
  focusCoach.textContent = 'Jeda boleh. Mulai lagi dari langkah kecil.';
}

function resetTimer() {
  pauseTimer();
  seconds = 10 * 60;
  renderTimer();
}

function celebrate(message) {
  focusCoach.textContent = message;
  if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
}

function randomMove() {
  moveCard.textContent = moveIdeas[Math.floor(Math.random() * moveIdeas.length)];
}

function resetDay() {
  done = {};
  save();
  renderMissions();
}

document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
document.getElementById('resetTimer').addEventListener('click', resetTimer);
document.getElementById('resetDay').addEventListener('click', resetDay);
document.getElementById('newMove').addEventListener('click', randomMove);
document.getElementById('doneMove').addEventListener('click', () => {
  done.gerak = true;
  save();
  renderMissions();
  celebrate('Gerak selesai. Otak sudah dapat bahan bakar!');
});

document.querySelectorAll('.calm-step').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.calm-step').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('calmText').textContent = calmCopy[btn.dataset.step];
  });
});

parentToggle.addEventListener('click', () => {
  const isHidden = parentPanel.classList.toggle('hidden');
  parentToggle.setAttribute('aria-pressed', String(!isHidden));
});

parentNote.value = localStorage.getItem(noteKey) || '';
parentNote.addEventListener('input', () => localStorage.setItem(noteKey, parentNote.value));

renderMissions();
renderTimer();
randomMove();
