#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include "DHT.h"

#define API_KEY "API KEY FIREBASE"
#define DATABASE_URL "DATABASE URL FIREBASE"
#define ledRed D8
#define ledGreen D7
#define ledBlue D6
#define DHTPIN D2
#define DHTTYPE DHT22

const char* ssid = "NAMA WIFI YANG INGIN DI SAMBUNGKAN KE WEMOS/ESP8266";
const char* password = "PASSWORD WIFINYA";

DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastSend = 0;
int i = 1;
int j = 1;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledBlue, OUTPUT);
  Serial.println();
  Serial.println("Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    if (i == 1) { 
      digitalWrite(ledRed, HIGH); digitalWrite(ledGreen, LOW); digitalWrite(ledBlue, LOW); 
    } else if (i == 2 || i == 4) {
      digitalWrite(ledRed, LOW); digitalWrite(ledGreen, HIGH); digitalWrite(ledBlue, LOW);
      if (i == 4) { i = 0; }
    } else if (i == 3) { 
      digitalWrite(ledRed, LOW); digitalWrite(ledGreen, LOW); digitalWrite(ledBlue, HIGH);
    }
    i++;
    delay(300);
  }
  Serial.println("\n✔ Terhubung ke WiFi");
  Serial.print("Api key: ");
  Serial.println(API_KEY);
  Serial.print("Database url: ");
  Serial.println(DATABASE_URL);
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✔ Login Firebase Berhasil");
  } else {
    Serial.printf("✖ Signup Error: %s\n", config.signer.signupError.message.c_str());
  }
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (millis() - lastSend >= 2000) {
    lastSend = millis();
    float kelembapan = dht.readHumidity();
    float suhu = dht.readTemperature();
    if (isnan(suhu) || isnan(kelembapan)) { 
      if (j == 1) { 
        digitalWrite(ledRed, HIGH); digitalWrite(ledGreen, LOW); digitalWrite(ledBlue, LOW); 
      } else if (j == 2 || j == 4) {
        digitalWrite(ledRed, LOW); digitalWrite(ledGreen, HIGH); digitalWrite(ledBlue, LOW);
        if (j == 4) { j = 0; }
      } else if (j == 3) { 
        digitalWrite(ledRed, LOW); digitalWrite(ledGreen, LOW); digitalWrite(ledBlue, HIGH);
      }
      j++;
      delay(300);
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
    FirebaseJson json;
    json.set("suhu", suhu);
    json.set("kelembapan", kelembapan);
    json.set("status", status);
    json.set("timestamp", millis());
    if (Firebase.pushJSON(fbData, "/dhtLogs", json)) {
      Serial.println("✔ Data terkirim ke Firebase");
    } else {
      Serial.printf("✖ Firebase Error: %s\n", fbData.errorReason().c_str());
    }
    Firebase.setJSON(fbData, "/dhtLatest", json);
  }
}
