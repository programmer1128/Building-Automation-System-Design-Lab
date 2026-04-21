#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- Configuration ---
#define DHTPIN 2          // GPIO 2
#define DHTTYPE DHT11
char mqtt_server_user[40] = "192.168.0.219"; // Default

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
  dht.begin();
  
  WiFiManager wifiManager;
  // Add the custom MQTT IP field for your "Privacy vs Cloud" option
  WiFiManagerParameter custom_mqtt_server("server", "MQTT Server IP", mqtt_server_user, 40);
  wifiManager.addParameter(&custom_mqtt_server);

  // Your "Fresh Start" requirement: wipes memory on every boot
  wifiManager.resetSettings();

  if (!wifiManager.autoConnect("Temp-Node-Setup")) {
    ESP.restart();
  }

  // Get the IP the user typed into the phone
  strcpy(mqtt_server_user, custom_mqtt_server.getValue());
  client.setServer(mqtt_server_user, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  static unsigned long lastMsg = 0;
  if (millis() - lastMsg > 10000) { 
    lastMsg = millis();

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) return;

    // 1. Build the Dynamic Topic String
    // Result: sensors/data/temp/3C:E9:0E:D6:0F:B6
    String topic = "sensors/data/temp/" + WiFi.macAddress();

    // 2. Build the Payload (Simplified since info is now in the topic)
    String payload = "{\"temp\":" + String(t) + ",\"hum\":" + String(h) + "}";

    // 3. Publish
    client.publish(topic.c_str(), payload.c_str());
    Serial.println("Published to: " + topic);
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "TempNode-" + WiFi.macAddress();
    if (client.connect(clientId.c_str(), "esp_admin", "Chiko2005#")) {
      Serial.println("Connected to MQTT");
    } else {
      delay(5000);
    }
  }
}