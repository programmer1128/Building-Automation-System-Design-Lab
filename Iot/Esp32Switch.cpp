#include <WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// WiFiManager parameters
WiFiManagerParameter mqtt_server_param("server", "MQTT Server", "", 40);
WiFiManagerParameter mqtt_port_param("port", "MQTT Port", "1883", 6);
WiFiManagerParameter sub_topic_param("sub", "Subscribe Topic", "esp32/control", 40);
WiFiManagerParameter pub_topic_param("pub", "Publish Topic", "esp32/status", 40);

String mqtt_server;
int mqtt_port;
String sub_topic;
String pub_topic;

// ===== MQTT Callback =====
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("Message received");

  // Convert payload to string
  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';

  Serial.println(msg);

  // Parse JSON
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, msg);

  if (error) {
    Serial.println("JSON parse failed");
    return;
  }

  int pin = doc["pin"];
  const char* state = doc["state"];

  if (pin < 0 || pin > 39) {
    Serial.println("Invalid pin");
    return;
  }

  pinMode(pin, OUTPUT);

  bool pinState = false;

  if (strcmp(state, "ON") == 0) {
    digitalWrite(pin, HIGH);
    pinState = true;
  } else if (strcmp(state, "OFF") == 0) {
    digitalWrite(pin, LOW);
    pinState = false;
  } else {
    Serial.println("Invalid state");
    return;
  }

  // ===== Publish response =====
  StaticJsonDocument<128> res;
  res["pin"] = pin;
  res["state"] = pinState ? "ON" : "OFF";
  res["status"] = "OK";

  char buffer[128];
  serializeJson(res, buffer);

  client.publish(pub_topic.c_str(), buffer);

  Serial.println("Response sent");
}

// ===== MQTT reconnect =====
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    if (client.connect("ESP32_Controller")) {
      Serial.println("connected");

      client.subscribe(sub_topic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);

  WiFiManager wm;

  wm.addParameter(&mqtt_server_param);
  wm.addParameter(&mqtt_port_param);
  wm.addParameter(&sub_topic_param);
  wm.addParameter(&pub_topic_param);

  if (!wm.autoConnect("ESP32_Config")) {
    ESP.restart();
  }

  mqtt_server = mqtt_server_param.getValue();
  mqtt_port = atoi(mqtt_port_param.getValue());
  sub_topic = sub_topic_param.getValue();
  pub_topic = pub_topic_param.getValue();

  client.setServer(mqtt_server.c_str(), mqtt_port);
  client.setCallback(callback);
}

// ===== LOOP =====
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();
}
