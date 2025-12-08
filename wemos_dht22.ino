#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include "DHT.h"

// ---------------------------
// Konfigurasi Firebase
// ---------------------------
#define FIREBASE_HOST "https://NAMA-PROJECTMU-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "TIDAK-DIPERLUKAN-KOSONGKAN"

// ---------------------------
// Konfigurasi WiFi
// ---------------------------
const char* ssid = "NAMA WIFI YANG INGIN DI PAKAI";
const char* password = "PASSWORD WIFI YANG INGIN DI PAKAI";

// ---------------------------
// Konfigurasi DHT & LED
// ---------------------------
#define ledRed D8
#define ledGreen D7
#define ledBlue D6
#define DHTPIN D2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// Firebase object
FirebaseData fbData;

unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);

  // -----------------------------
  // CONNECTING TO WIFI
  // -----------------------------
  Serial.println();
  Serial.println("Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("✔ Terhubung! IP: ");
  Serial.println(WiFi.localIP());

  // -----------------------------
  // CONNECTING TO FIREBASE
  // -----------------------------
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  Serial.println("✔ Firebase terhubung!");
}

void loop() {
  // kirim data setiap 5 detik
  if (millis() - lastSend >= 5000) {
    lastSend = millis();

    float kelembapan = dht.readHumidity();
    float suhu = dht.readTemperature();

    if (isnan(suhu) || isnan(kelembapan)) {
      Serial.println("✖ Sensor ERROR");
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledGreen, LOW);
      digitalWrite(ledBlue, LOW);
      return;
    }

    String status;
    if (suhu < 25) {
      status = "Terlalu Dingin";
      digitalWrite(ledRed, LOW);
      digitalWrite(ledGreen, LOW);
      digitalWrite(ledBlue, HIGH);
    }
    else if (suhu > 35) {
      status = "Terlalu Panas";
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledGreen, LOW);
      digitalWrite(ledBlue, LOW);
    }
    else {
      status = "Suhu Ideal";
      digitalWrite(ledRed, LOW);
      digitalWrite(ledGreen, HIGH);
      digitalWrite(ledBlue, LOW);
    }

    // ------------------------------
    // Objek JSON untuk Firebase
    // ------------------------------
    FirebaseJson json;
    json.set("suhu", suhu);
    json.set("kelembapan", kelembapan);
    json.set("status", status);
    json.set("timestamp", millis());

    // ------------------------------
    // PUSH KE FIREBASE (auto index)
    // ------------------------------
    if (Firebase.pushJSON(fbData, "/dhtLogs", json)) {
      Serial.println("✔ Data terkirim ke Firebase");
    } else {
      Serial.print("✖ Gagal kirim: ");
      Serial.println(fbData.errorReason());
    }

    // ------------------------------
    // UPDATE DATA TERBARU (untuk web)
    // ------------------------------
    Firebase.setJSON(fbData, "/dhtLatest", json);
  }
}
