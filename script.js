// script.js — menangani koneksi ke Wemos dan menampilkan grafik
const params = new URLSearchParams(location.search);
let espIP = params.get('ip') || '';
const ipInput = document.getElementById('ipInput');
const btnConnect = document.getElementById('btnConnect');
const alertBox = document.getElementById('alert');

if(espIP) ipInput.value = espIP;

const ctx = document.getElementById('chart').getContext('2d');
const chartData = {labels:[],datasets:[
  {label:'Suhu (°C)',data:[],fill:true,tension:0.2},
  {label:'Kelembapan (%)',data:[],fill:true,tension:0.2}
]};
const chart = new Chart(ctx,{type:'line',data:chartData,options:{responsive:true,scales:{y:{beginAtZero:true,max:100}}}});

function showAlert(msg,type='error'){
  alertBox.textContent = msg;
  alertBox.className = 'alert ' + (type==='error' ? 'error' : 'info');
  alertBox.style.display = 'block';
}

function hideAlert(){
  alertBox.style.display = 'none';
}

async function fetchSensor(){
  if(!espIP){
    showAlert('Masukkan IP Wemos di kotak input atau lewat parameter URL ?ip=IP_ADDRESS','error');
    return;
  }
  try{
    const res = await fetch((espIP.startsWith('http')?espIP:('http://'+espIP)) + '/sensor', {cache:'no-store'});
    if(!res.ok) throw new Error('Network response not ok');
    const json = await res.json();
    if(json.error){
      showAlert(json.pesan,'error');
      document.getElementById('temp').textContent='-- °C';
      document.getElementById('hum').textContent='-- %';
      document.getElementById('desc').textContent='Sensor tidak aktif';
      return;
    }
    hideAlert();
    document.getElementById('temp').textContent = json.suhu.toFixed(1) + ' °C';
    document.getElementById('hum').textContent = json.kelembapan.toFixed(1) + ' %';
    document.getElementById('desc').textContent = json.keterangan || '';
    const now = new Date().toLocaleTimeString();
    if(chartData.labels.length>20){
      chartData.labels.shift(); chartData.datasets[0].data.shift(); chartData.datasets[1].data.shift();
    }
    chartData.labels.push(now);
    chartData.datasets[0].data.push(json.suhu);
    chartData.datasets[1].data.push(json.kelembapan);
    chart.update();
  }catch(err){
    showAlert('Gagal terhubung ke Wemos. Pastikan IP benar dan perangkat terhubung ke jaringan yang sama.','error');
  }
}

btnConnect.addEventListener('click', ()=>{
  espIP = ipInput.value.trim();
  if(espIP) {
    // simpan parameter URL agar pengguna bisa reload dan tetap connect
    const u = new URL(location.href);
    u.searchParams.set('ip', espIP);
    history.replaceState(null,'',u.toString());
    fetchSensor();
  }
});

// auto-fetch setiap 5 detik
setInterval(fetchSensor, 5000);
window.addEventListener('load', ()=>{
  if(espIP) fetchSensor();
});