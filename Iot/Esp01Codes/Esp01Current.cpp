#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== ADC =====
#define ADC_PIN A0

// ===== ACS712 CONFIG =====
float sensitivity = 0.185; // 5A version (V/A after scaling adjust later)
float vRef = 1.0;         // ESP ADC max voltage

// ===== MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// Custom params
WiFiManagerParameter mqtt_server_param("server", "MQTT Server", "", 40);
WiFiManagerParameter mqtt_port_param("port", "MQTT Port", "1883", 6);
WiFiManagerParameter mqtt_topic_param("topic", "MQTT Topic", "esp/current", 40);

String mqtt_server;
int mqtt_port;
String mqtt_topic;

// ===== MQTT reconnect =====
void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect("ESP01_ACS712")) {
      Serial.println("MQTT connected");
    } else {
      delay(2000);
    }
  }
}

// ===== RMS Calculation =====
float readCurrentRMS() {
  const int samples = 1000;
  float sum = 0;

  // Estimate offset
  float offset = 0;
  for (int i = 0; i < 200; i++) {
    offset += analogRead(ADC_PIN);
    delayMicroseconds(200);
  }
  offset /= 200.0;

  // RMS
  for (int i = 0; i < samples; i++) {
    float val = analogRead(ADC_PIN);
    float centered = val - offset;
    sum += centered * centered;
    delayMicroseconds(200);
  }

  float mean = sum / samples;
  float rms_adc = sqrt(mean);

  // Convert ADC → voltage
  float voltage = (rms_adc / 1023.0) * vRef;

  // Convert voltage → current
  float current = voltage / sensitivity;

  return current;
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);

  WiFiManager wm;

  wm.addParameter(&mqtt_server_param);
  wm.addParameter(&mqtt_port_param);
  wm.addParameter(&mqtt_topic_param);

  if (!wm.autoConnect("ESP_ACS_Config")) {
    ESP.restart();
  }

  mqtt_server = mqtt_server_param.getValue();
  mqtt_port = atoi(mqtt_port_param.getValue());
  mqtt_topic = mqtt_topic_param.getValue();

  client.setServer(mqtt_server.c_str(), mqtt_port);
}

// ===== LOOP =====
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();

  float current = readCurrentRMS();

  // Convert to milliamps for precision
  int current_mA = (int)(current * 1000);

  // JSON payload
  StaticJsonDocument<128> doc;
  doc["current_mA"] = current_mA;

  char buffer[128];
  serializeJson(doc, buffer);

  Serial.println(buffer);

  client.publish(mqtt_topic.c_str(), buffer);

  delay(3000);
}
