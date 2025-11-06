#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include "DHT.h"

// --------- CONFIGURE THESE (ganti setelah sampai di sekolah) ---------
const char* ssid = "SSID_SEKOLAH";      // <-- ganti dengan SSID sekolah Anda
const char* password = "PASSWORD_WIFI"; // <-- ganti dengan password sekolah
// Jika ingin Wemos jadi Access Point jika gagal konek, isi ap_ssid dan ap_password
const char* ap_ssid = "WEMOS-AP";
const char* ap_password = "12345678"; // minimal 8 karakter
// --------------------------------------------------------------------

#define DHTPIN D2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);

void handleSensor();

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(D5, OUTPUT); // ledBlue
  pinMode(D6, OUTPUT); // ledGreen
  pinMode(D7, OUTPUT); // ledRed

  Serial.println();
  Serial.print("Menghubungkan ke WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  unsigned long start = millis();
  const unsigned long timeout = 20000; // 20 detik timeout untuk percobaan koneksi
  while (WiFi.status() != WL_CONNECTED && millis() - start < timeout) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Terhubung ke WiFi. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Gagal terhubung ke WiFi, memulai Access Point...");
    WiFi.softAP(ap_ssid, ap_password);
    Serial.print("AP aktif. SSID: ");
    Serial.println(ap_ssid);
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());
  }

  server.on("/sensor", handleSensor);
  server.begin();
  Serial.println("Server berjalan pada port 80");
}

void loop() {
  server.handleClient();
}

void handleSensor() {
  float kelembapan = dht.readHumidity();
  float suhu = dht.readTemperature();
  String json;

  if (isnan(suhu) || isnan(kelembapan)) {
    // Sensor tidak terbaca
    json = "{\"error\":true,\"pesan\":\"Sensor DHT22 tidak terdeteksi. Periksa koneksi ke pin D2.\"}";
    digitalWrite(D5, LOW);
    digitalWrite(D6, LOW);
    digitalWrite(D7, LOW);
  } else {
    String keterangan;
    float minimalSuhu = 20.0;
    float maksimalSuhu = 30.0;
    if (suhu < minimalSuhu) {
      keterangan = "Terlalu Dingin";
      digitalWrite(D5, HIGH); digitalWrite(D6, LOW); digitalWrite(D7, LOW);
    } else if (suhu > maksimalSuhu) {
      keterangan = "Terlalu Panas";
      digitalWrite(D5, LOW); digitalWrite(D6, LOW); digitalWrite(D7, HIGH);
    } else {
      keterangan = "Suhu Ideal";
      digitalWrite(D5, LOW); digitalWrite(D6, HIGH); digitalWrite(D7, LOW);
    }

    json = "{\"error\":false,\"suhu\":" + String(suhu,1) +
           ",\"kelembapan\":" + String(kelembapan,1) +
           ",\"keterangan\":\"" + keterangan + "\"}";
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}
