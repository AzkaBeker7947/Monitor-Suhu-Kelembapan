import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const params = new URLSearchParams(location.search);
const apiKeyParam = params.get("api") || "";
const dbUrlParam = params.get("db") || "";
const apiInput = document.getElementById("apiInput");
const dbInput = document.getElementById("dbInput");
const btnConnect = document.getElementById("btnConnect");
const controls = document.querySelector(".controls");

apiInput.value = apiKeyParam;
dbInput.value = dbUrlParam;

if (apiKeyParam && dbUrlParam) {
  controls.style.display = "none";
}
let db = null;

function initFirebase(apiKey, dbURL) {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: "custom.firebaseapp.com",
    databaseURL: dbURL
  };

  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);

  console.log("Firebase Connected!");

  startRealtimeListener();
}

if (apiKeyParam && dbUrlParam) {
  initFirebase(apiKeyParam, dbUrlParam);
}

btnConnect.addEventListener("click", () => {
  const api = apiInput.value.trim();
  const dbURL = dbInput.value.trim();

  if (!api || !dbURL) {
    showAlert("API Key dan Database URL harus diisi!");
    return;
  }

  const url = new URL(location.href);
  url.searchParams.set("api", api);
  url.searchParams.set("db", dbURL);

  location.href = url.toString();
});

const alertBox = document.getElementById("alert");
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

function showAlert(msg, type = "error") {
  alertBox.textContent = msg;
  alertBox.className = "alert " + (type === "error" ? "error" : "info");
  alertBox.style.display = "block";
}

function hideAlert() {
  alertBox.style.display = "none";
}

function startRealtimeListener() {
  if (!db) return;

  onValue(ref(db, "dhtLatest"), snapshot => {
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
