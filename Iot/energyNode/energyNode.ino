#include <ESP8266WiFi.h>
#include <WiFiManager.h>         
#include <PubSubClient.h>

// Variable to store MQTT Server IP from the phone setup
char mqtt_server_user[40] = "192.168.0.219"; 

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  // MUST match the Arduino's espSerial.begin(9600)
  //MATCH BAUDRATE
  Serial.begin(9600); 
  
  WiFiManager wifiManager;

  // 1. Add Custom MQTT Parameter
  WiFiManagerParameter custom_mqtt_server("server", "MQTT Server IP", mqtt_server_user, 40);
  wifiManager.addParameter(&custom_mqtt_server);

  // 2. Fresh Start Logic (Memory wipe on boot)
  wifiManager.resetSettings(); 

  // 3. Start Portal
  if (!wifiManager.autoConnect("Energy-Node-Setup")) {
    ESP.restart();
  }

  // 4. Save User Input
  strcpy(mqtt_server_user, custom_mqtt_server.getValue());
  client.setServer(mqtt_server_user, 1883);
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "EnergyNode-" + WiFi.macAddress();
    if (client.connect(clientId.c_str(), "esp_admin", "Chiko2005#")) {
      // Topic for Energy Node
      client.subscribe(("cmd/energy/" + WiFi.macAddress()).c_str());
    } else {
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Listen for the "Irms:...|Power:..." string from the Arduino Uno
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    
    if (data.length() > 0) {
      // Construct the specific topic for energy data
      String topic = "sensors/data/energy/" + WiFi.macAddress();
      
      // We wrap the raw Arduino string in a small JSON-like format
      String payload = "{\"mac\":\"" + WiFi.macAddress() + "\", \"data\":\"" + data + "\"}";
      
      client.publish(topic.c_str(), payload.c_str());
    }
  }
}