
#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <EEPROM.h>

// ===== DHT Setup =====
#define DHTPIN 2          // GPIO2 (ESP-01)
#define DHTTYPE DHT11     // or DHT22

DHT dht(DHTPIN, DHTTYPE);

// ===== MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// Custom parameters
WiFiManagerParameter custom_mqtt_server("server", "MQTT Server", "", 40);
WiFiManagerParameter custom_mqtt_port("port", "MQTT Port", "1883", 6);
WiFiManagerParameter custom_mqtt_topic("topic", "MQTT Topic", "esp/temp", 40);

// Variables
String mqtt_server;
int mqtt_port;
String mqtt_topic;

// ===== Connect MQTT =====
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    if (client.connect("ESP01Client")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// ===== Setup =====
void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFiManager wm;

  // Add custom fields
  wm.addParameter(&custom_mqtt_server);
  wm.addParameter(&custom_mqtt_port);
  wm.addParameter(&custom_mqtt_topic);

  // Reset settings (optional)
  // wm.resetSettings();

  if (!wm.autoConnect("ESP_Config")) {
    Serial.println("Failed to connect");
    ESP.restart();
  }

  Serial.println("WiFi connected!");

  // Get values
  mqtt_server = custom_mqtt_server.getValue();
  mqtt_port = atoi(custom_mqtt_port.getValue());
  mqtt_topic = custom_mqtt_topic.getValue();

  Serial.println("MQTT Server: " + mqtt_server);
  Serial.println("MQTT Port: " + String(mqtt_port));
  Serial.println("MQTT Topic: " + mqtt_topic);

  client.setServer(mqtt_server.c_str(), mqtt_port);
}

// ===== Loop =====
void loop() {

  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();

  float temp = dht.readTemperature();

  if (isnan(temp)) {
    Serial.println("Failed to read from DHT");
    return;
  }

  String payload = String(temp);

  Serial.print("Publishing: ");
  Serial.println(payload);

  client.publish(mqtt_topic.c_str(), payload.c_str());

  delay(5000); // publish every 5 sec
}
