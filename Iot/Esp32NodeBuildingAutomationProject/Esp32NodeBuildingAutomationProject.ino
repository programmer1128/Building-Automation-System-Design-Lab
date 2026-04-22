#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// 1. CREDENTIALS
const char* wifiName = "banerjee_home";     // <--- Enter your WiFi Name
const char* wifiPasswd = "35194477"; // <--- Enter your WiFi Password

// 2. SERVER CONFIG
const char* mqttServerName = "192.168.0.219"; // <--- Double check this IP!
const int mqttServerPort = 1883;

// 3. GLOBALS
String macAddress;      // We will read this from the chip
String commandTopic;    // The topic we listen to

WiFiClient espClient;
PubSubClient client(espClient);

// Setup WiFi
void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(wifiName);

    WiFi.begin(wifiName, wifiPasswd);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

// Callback: What to do when a message arrives
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived on topic: ");
    Serial.println(topic);

    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
    }

    // MATCHING JAVA PAYLOAD: {"pin": 21, "status": "ON"}
    int pin = doc["pin"];
    const char* status = doc["status"]; // Java sends "status", not "state"

    // Sanity Check: Don't accidentally toggle Boot/UART pins (0, 1, 3)
    if (pin < 0 || pin > 39) return; 

    pinMode(pin, OUTPUT);

    if (strcmp(status, "ON") == 0) {
        digitalWrite(pin, LOW);
        Serial.printf("Turned ON Pin %d\n", pin);
    } 
    else if (strcmp(status, "OFF") == 0) {
        digitalWrite(pin, HIGH);
        Serial.printf("Turned OFF Pin %d\n", pin);
    }
}

void reconnect() {
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        
        // Use MAC Address as the Client ID so the Broker knows exactly who we are
        if (client.connect(macAddress.c_str(),"esp_admin","Chiko2005#")) 
        {
            Serial.println("connected");
            
            // Subscribe to the topic defined in Java Service
            // Topic: home/devices/{MAC}/command
            client.subscribe(commandTopic.c_str());
            Serial.print("Subscribed to: ");
            Serial.println(commandTopic);
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    setup_wifi();

    // AUTO-DETECT MAC ADDRESS
    macAddress = WiFi.macAddress();
    Serial.print("My Device MAC Address: ");
    Serial.println(macAddress); 
    // ^^^ COPY THIS MAC ADDRESS INTO YOUR POSTGRES DATABASE ^^^

    // Construct Topic to match Java: "home/devices/A1:B2:C3.../command"
    commandTopic = "home/devices/" + macAddress + "/command";

    client.setServer(mqttServerName, mqttServerPort);
    client.setCallback(callback);
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
}