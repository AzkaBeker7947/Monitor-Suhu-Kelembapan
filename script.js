// ----------------------------
// AMBIL PARAMETER DARI URL
// ----------------------------
const params = new URLSearchParams(location.search);
const apiKeyParam = params.get("api") || "";
const dbUrlParam = params.get("db") || "";

// ----------------------------
// FORM INPUT (HTML ELEMENTS)
// ----------------------------
const apiInput = document.getElementById("apiInput");
const dbInput = document.getElementById("dbInput");
const btnConnect = document.getElementById("btnConnect");

apiInput.value = apiKeyParam;
dbInput.value = dbUrlParam;

// ----------------------------
// KONDISI: Jika parameter lengkap → Initialize Firebase
// ----------------------------
let firebaseReady = false;
let db = null;

if (apiKeyParam && dbUrlParam) {
  initFirebase(apiKeyParam, dbUrlParam);
}

// ----------------------------
// INIT FIREBASE (DYNAMIC)
// ----------------------------
function initFirebase(api, dbURL) {
  const firebaseConfig = {
    apiKey: api,
    authDomain: "custom.firebaseapp.com",
    databaseURL: dbURL,
  };

  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  firebaseReady = true;

  console.log("Firebase Connected!");
  startRealtimeListener();
}

// ----------------------------
// KETIKA TEKAN CONNECT
// ----------------------------
btnConnect.addEventListener("click", () => {
  const api = apiInput.value.trim();
  const dbURL = dbInput.value.trim();

  if (!api || !dbURL) {
    showAlert("API Key dan Database URL harus diisi!");
    return;
  }

  // Simpan ke URL agar tersimpan permanen
  const url = new URL(location.href);
  url.searchParams.set("api", api);
  url.searchParams.set("db", dbURL);

  location.href = url.toString(); // reload halaman
});

// ----------------------------
// CHART SETUP
// ----------------------------
const ctx = document.getElementById("chart").getContext("2d");
const chartData = {
  labels: [],
  datasets: [
    { label: "Suhu (°C)", data: [], fill: true, tension: 0.2 },
    { label: "Kelembapan (%)", data: [], fill: true, tension: 0.2 }
  ]
};

const chart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true, max: 100 } }
  }
});

// ----------------------------
// ALERT
// ----------------------------
const alertBox = document.getElementById("alert");

function showAlert(msg, type = "error") {
  alertBox.textContent = msg;
  alertBox.className = "alert " + (type === "error" ? "error" : "info");
  alertBox.style.display = "block";
}

function hideAlert() { alertBox.style.display = "none"; }

// ----------------------------
// LISTENER REAL-TIME (DHTLATEST)
// ----------------------------
function startRealtimeListener() {
  if (!firebaseReady) return;

  firebase.database().ref("dhtLatest").on("value", snapshot => {
    const data = snapshot.val();
    if (!data) {
      showAlert("Belum ada data dari Firebase.");
      return;
    }

    hideAlert();

    document.getElementById("temp").textContent = data.suhu.toFixed(1) + " °C";
    document.getElementById("hum").textContent = data.kelembapan.toFixed(1) + " %";
    document.getElementById("desc").textContent = data.status;

    const time = new Date().toLocaleTimeString();

    if (chartData.labels.length > 20) {
      chartData.labels.shift();
      chartData.datasets[0].data.shift();
      chartData.datasets[1].data.shift();
    }

    chartData.labels.push(time);
    chartData.datasets[0].data.push(data.suhu);
    chartData.datasets[1].data.push(data.kelembapan);

    chart.update();
  });
}
