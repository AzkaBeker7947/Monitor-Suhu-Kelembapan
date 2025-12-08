#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include "DHT.h"

// ---------------------------
// Konfigurasi Firebase baru
// ---------------------------
#define API_KEY "API KEY FIREBASE"
#define DATABASE_URL "URL DATABASE FIREBASE"

// ---------------------------
// Konfigurasi WiFi
// ---------------------------
const char* ssid = "NAMA WIFI YANG INGIN DI SAMBUNGKAN KE ESP8266 ATAU ESP32";
const char* password = "PASSWORD WIFI";

// ---------------------------
// DHT22 & LED
// ---------------------------
#define ledRed D8
#define ledGreen D7
#define ledBlue D6
#define DHTPIN D2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// Firebase object
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);

  // -----------------------------
  // CONNECT WIFI
  // -----------------------------
  Serial.println();
  Serial.println("Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println("\n✔ Terhubung ke WiFi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // -----------------------------
  // FIREBASE SETUP
  // -----------------------------
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Login Anonymous (aman, cepat)
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✔ Login Firebase Berhasil");
  } else {
    Serial.printf("✖ Signup Error: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (millis() - lastSend >= 1000) {
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
    } else if (suhu > 35) {
      status = "Terlalu Panas";
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledGreen, LOW);
      digitalWrite(ledBlue, LOW);
    } else {
      status = "Suhu Ideal";
      digitalWrite(ledRed, LOW);
      digitalWrite(ledGreen, HIGH);
      digitalWrite(ledBlue, LOW);
    }

    // ------------------------------
    // Buat JSON
    // ------------------------------
    FirebaseJson json;
    json.set("suhu", suhu);
    json.set("kelembapan", kelembapan);
    json.set("status", status);
    json.set("timestamp", millis());

    // ------------------------------
    // PUSH LOG (auto index)
    // ------------------------------
    if (Firebase.pushJSON(fbData, "/dhtLogs", json)) {
      Serial.println("✔ Data terkirim ke Firebase");
    } else {
      Serial.printf("✖ Firebase Error: %s\n", fbData.errorReason().c_str());
    }

    // ------------------------------
    // UPDATE DATA TERBARU
    // ------------------------------
    Firebase.setJSON(fbData, "/dhtLatest", json);
  }
}
