#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== ADC =====
#define ADC_PIN A0

// ===== MQ CONFIG =====
float RL = 10.0;     // Load resistance (k ohm)
float R0 = 10.0;     // To be calibrated

// Curve constants (example for smoke, adjust from datasheet)
float A = 1000.0;
float B = 2.5;

// ===== MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// WiFiManager params
WiFiManagerParameter mqtt_server_param("server", "MQTT Server", "", 40);
WiFiManagerParameter mqtt_port_param("port", "MQTT Port", "1883", 6);
WiFiManagerParameter mqtt_topic_param("topic", "MQTT Topic", "esp/smoke", 40);

String mqtt_server;
int mqtt_port;
String mqtt_topic;

// ===== MQTT reconnect =====
void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect("ESP01_MQ")) {
      Serial.println("MQTT connected");
    } else {
      delay(2000);
    }
  }
}

// ===== Read ADC averaged =====
float readADC() {
  int samples = 200;
  float sum = 0;

  for (int i = 0; i < samples; i++) {
    sum += analogRead(ADC_PIN);
    delayMicroseconds(200);
  }

  return sum / samples;
}

// ===== Calculate Rs =====
float getResistance(float adc) {
  float voltage = (adc / 1023.0) * 1.0; // ESP max 1V

  if (voltage == 0) return 0;

  float Rs = (1.0 - voltage) * RL / voltage;
  return Rs;
}

// ===== Calculate PPM =====
float getPPM(float Rs) {
  float ratio = Rs / R0;
  float ppm = A * pow(ratio, -B);
  return ppm;
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);

  WiFiManager wm;

  wm.addParameter(&mqtt_server_param);
  wm.addParameter(&mqtt_port_param);
  wm.addParameter(&mqtt_topic_param);

  if (!wm.autoConnect("ESP_SMOKE_Config")) {
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

  float adc = readADC();
  float Rs = getResistance(adc);
  float ppm = getPPM(Rs);

  // Convert to integer ppm (precision-safe)
  int ppm_int = (int)ppm;

  StaticJsonDocument<128> doc;
  doc["smoke_ppm"] = ppm_int;
  doc["adc"] = (int)adc;      // optional debug
  doc["ratio"] = Rs / R0;     // optional

  char buffer[128];
  serializeJson(doc, buffer);

  Serial.println(buffer);

  client.publish(mqtt_topic.c_str(), buffer);

  delay(3000);
}
