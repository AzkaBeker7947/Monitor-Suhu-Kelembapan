// ----------------------------
// KONFIGURASI FIREBASE
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVB7gvybyF5zT0Q5FYrZkrKxOhVb1kh20",
  authDomain: "pengukur-suhu-ruangan-884a6.firebaseapp.com",
  databaseURL: "https://pengukur-suhu-ruangan-884a6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "pengukur-suhu-ruangan-884a6",
  storageBucket: "pengukur-suhu-ruangan-884a6.firebasestorage.app",
  messagingSenderId: "396222673264",
  appId: "1:396222673264:web:217c8973ad8ca101da9fb5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ----------------------------
// ELEMEN HTML
// ----------------------------
const alertBox = document.getElementById('alert');
const ctx = document.getElementById('chart').getContext('2d');

// ----------------------------
// CHART
// ----------------------------
const chartData = {
  labels: [],
  datasets: [
    { label: 'Suhu (°C)', data: [], fill: true, tension: 0.2 },
    { label: 'Kelembapan (%)', data: [], fill: true, tension: 0.2 }
  ]
};

const chart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true, max: 100 } }
  }
});

// ----------------------------
// ALERT
// ----------------------------
function showAlert(msg, type = 'error') {
  alertBox.textContent = msg;
  alertBox.className = 'alert ' + (type === 'error' ? 'error' : 'info');
  alertBox.style.display = 'block';
}
function hideAlert() { alertBox.style.display = 'none'; }

// ----------------------------
// LISTENER DATA TERBARU
// ----------------------------
onValue(ref(db, "dhtLatest"), snapshot => {
  const data = snapshot.val();
  if (!data) {
    showAlert("Belum ada data dari ESP8266 ke Firebase.", "error");
    return;
  }

  hideAlert();

  // Tampilkan ke UI
  document.getElementById('temp').textContent = data.suhu.toFixed(1) + " °C";
  document.getElementById('hum').textContent = data.kelembapan.toFixed(1) + " %";
  document.getElementById('desc').textContent = data.status;

  // Update grafik
  const now = new Date().toLocaleTimeString();
  if (chartData.labels.length > 20) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
    chartData.datasets[1].data.shift();
  }

  chartData.labels.push(now);
  chartData.datasets[0].data.push(data.suhu);
  chartData.datasets[1].data.push(data.kelembapan);

  chart.update();
});
