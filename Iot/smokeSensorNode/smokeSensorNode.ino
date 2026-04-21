#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>

#define SENSOR_PIN 2
char mqtt_server_user[40] = "192.168.0.219"; 

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(9600);
  pinMode(SENSOR_PIN, INPUT);
  
  WiFiManager wifiManager;
  WiFiManagerParameter custom_mqtt_server("server", "MQTT Server IP", mqtt_server_user, 40);
  wifiManager.addParameter(&custom_mqtt_server);

  wifiManager.resetSettings(); // Fresh Start

  if (!wifiManager.autoConnect("Smoke-Node-Setup")) {
    ESP.restart();
  }

  strcpy(mqtt_server_user, custom_mqtt_server.getValue());
  client.setServer(mqtt_server_user, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  int smokeDetected = (digitalRead(SENSOR_PIN) == LOW) ? 1 : 0;
  static int lastState = -1;
  static unsigned long lastMsg = 0;

  // Immediate Alert logic
  if (smokeDetected != lastState || millis() - lastMsg > 10000) {
    lastState = smokeDetected;
    lastMsg = millis();

    String topic = "sensors/data/smoke/" + WiFi.macAddress();
    String payload = "{\"mac\":\"" + WiFi.macAddress() + "\", \"alert\":" + String(smokeDetected) + "}";

    client.publish(topic.c_str(), payload.c_str());
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("SmokeNode", "esp_admin", "Chiko2005#")) {
      Serial.println("Smoke Node Connected");
    } else {
      delay(5000);
    }
  }
}