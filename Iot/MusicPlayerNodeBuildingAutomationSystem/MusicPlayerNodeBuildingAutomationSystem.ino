#include <WiFi.h>
#include "BluetoothA2DPSource.h"
#include "esp_gap_bt_api.h" 

BluetoothA2DPSource a2dp_source;

// Callback logic: This handles the raw Bluetooth scan results
void scan_callback(esp_bt_gap_cb_event_t event, esp_bt_gap_cb_param_t *param) {
    // 1. Discovery Result (Finding the MAC)
    if (event == ESP_BT_GAP_DISC_RES_EVT) {
        bool nameFound = false;
        for (int i = 0; i < param->disc_res.num_prop; i++) {
            if (param->disc_res.prop[i].type == ESP_BT_GAP_DEV_PROP_BDNAME) {
                const char* name = (const char*)(param->disc_res.prop[i].val);
                if (strlen(name) > 0) {
                    Serial.print("BT_NAME_FOUND:");
                    Serial.println(name);
                    nameFound = true;
                }
            }
        }
        if (!nameFound) {
            Serial.println("Name hidden. Requesting Remote Name...");
            esp_bt_gap_read_remote_name(param->disc_res.bda);
        }
    } 
    // 2. Remote Name Request Complete
    // Using the member 'read_rmt_name' as suggested by your compiler
    else if (event == 11) { 
        if (param->read_rmt_name.stat == ESP_BT_STATUS_SUCCESS) {
            Serial.print("BT_NAME_RESOLVED:");
            Serial.println((char*)param->read_rmt_name.rmt_name);
        }
    }
}




void setup() {
    Serial.begin(115200);
    Serial.println("NODE_B_BOOTED");
    
    // Initialize Bluetooth
    a2dp_source.start(""); 
    
    // Register the callback
    esp_bt_gap_register_callback(scan_callback);
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        if (Serial.available()) {
            String msg = Serial.readStringUntil('\n');
            if (msg.startsWith("WIFI:")) {
                parseAndConnect(msg);
            }
        }
    }
}

void parseAndConnect(String data) {
    int firstPipe = data.indexOf('|');
    int secondPipe = data.lastIndexOf('|');
    String ssid = data.substring(5, firstPipe);
    String pass = data.substring(firstPipe + 1, secondPipe);
    
    WiFi.begin(ssid.c_str(), pass.c_str());
    while (WiFi.status() != WL_CONNECTED) { 
        delay(500); 
        Serial.print("."); 
    }
    
    Serial.println("\nNode B WiFi Connected!");
    Serial.println("SCAN_START_REQUESTED");
    
    // Start Discovery: Mode, Duration (1.28s units, so 10 = ~12.8s)
    esp_bt_gap_start_discovery(ESP_BT_INQ_MODE_GENERAL_INQUIRY, 10, 0);
}