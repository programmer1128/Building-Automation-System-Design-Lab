#include <WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== MQTT =====
WiFiClient espClient;
PubSubClient client(espClient);

// WiFiManager params
WiFiManagerParameter mqtt_server_param("server", "MQTT Server", "", 40);
WiFiManagerParameter mqtt_port_param("port", "MQTT Port", "1883", 6);
WiFiManagerParameter device_id_param("id", "Device ID", "esp32_1", 20);

String mqtt_server;
int mqtt_port;
String device_id;

String sub_topic;
String pub_topic;

// ===== Relay Pins =====
#define NUM_RELAYS 4
int relayPins[NUM_RELAYS] = {5, 18, 19, 21};

// ===== Relay State =====
bool relayState[NUM_RELAYS] = {false, false, false, false};

// ===== Set Relay =====
void setRelay(int index, bool state) {
  if (index < 0 || index >= NUM_RELAYS) return;

  relayState[index] = state;

  // Active LOW relay
  digitalWrite(relayPins[index], state ? LOW : HIGH);
}

// ===== Publish Status =====
void publishStatus(int relayIndex) {
  StaticJsonDocument<128> doc;

  doc["device"] = device_id;
  doc["relay"] = relayIndex + 1;
  doc["state"] = relayState[relayIndex] ? "ON" : "OFF";
  doc["status"] = "OK";

  char buffer[128];
  serializeJson(doc, buffer);

  client.publish(pub_topic.c_str(), buffer, true);
}

// ===== MQTT Callback =====
void callback(char* topic, byte* payload, unsigned int length) {
  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';

  Serial.println(msg);

  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, msg)) {
    Serial.println("JSON error");
    return;
  }

  int relay = doc["relay"];
  const char* state = doc["state"];

  if (relay < 1 || relay > NUM_RELAYS) {
    Serial.println("Invalid relay number");
    return;
  }

  int index = relay - 1;

  if (strcmp(state, "ON") == 0) {
    setRelay(index, true);
  } else if (strcmp(state, "OFF") == 0) {
    setRelay(index, false);
  } else {
    Serial.println("Invalid state");
    return;
  }

  publishStatus(index);
}

// ===== MQTT reconnect =====
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");

    if (client.connect(device_id.c_str())) {
      Serial.println("connected");
      client.subscribe(sub_topic.c_str());
    } else {
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
  wm.addParameter(&device_id_param);

  if (!wm.autoConnect("ESP32_Relay_Config")) {
    ESP.restart();
  }

  mqtt_server = mqtt_server_param.getValue();
  mqtt_port = atoi(mqtt_port_param.getValue());
  device_id = device_id_param.getValue();

  sub_topic = "home/" + device_id + "/control";
  pub_topic = "home/" + device_id + "/status";

  client.setServer(mqtt_server.c_str(), mqtt_port);
  client.setCallback(callback);

  // Initialize relays
  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH); // OFF (active LOW)
  }
}

// ===== LOOP =====
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }

  client.loop();
}
