#include <SoftwareSerial.h>

// SoftwareSerial for ESP-01: RX (10), TX (11)
// Remember: Pin 11 (TX) goes to ESP-01 RX through the 1k/2k voltage divider.
SoftwareSerial espSerial(10, 11); 

const int sensorPin = A0;
const float sensitivity = 141.0; 
const float vcc = 5.0;           
const float calibrationFactor = 0.3; 

void setup() {
  Serial.begin(115200);      // For PC Debugging
  espSerial.begin(9600);     // Must match the baud rate in your ESP-01 code
  Serial.println("Calibrated Energy Node Starting...");
}

void loop() {
  float voltage = getVPP();
  
  // Convert Peak-to-Peak Voltage to RMS Voltage
  float vRMS = (voltage / 2.0) * 0.707; 
  
  // Calculate Current in Amps
  float iRMS = (vRMS * 1000.0) / sensitivity;

  // --- YOUR CALIBRATION LOGIC ---
  iRMS = iRMS * calibrationFactor; 
  
  // Noise floor to keep it at 0 when bulb is off
  if (iRMS < 0.04) iRMS = 0; 

  float power = iRMS * 230.0; // Standard voltage

  // Format the string exactly for the backend/MQTT
  String payload = "Irms:" + String(iRMS, 3) + "|Power:" + String(power, 2);

  // 1. Send to the ESP-01 via the Software Bridge
  espSerial.println(payload);

  // 2. Print to Serial Monitor for your own verification
  Serial.println("Published to ESP-01: " + payload);

  delay(3000); // Frequency of data updates
}

float getVPP() {
  int readValue; 
  int maxValue = 0; 
  int minValue = 1024;
  
  uint32_t start_time = millis();
  // Sample for 100ms (exactly 5 full cycles at 50Hz)
  while((millis() - start_time) < 100) { 
     readValue = analogRead(sensorPin);
     if (readValue > maxValue) maxValue = readValue;
     if (readValue < minValue) minValue = readValue;
  }
  
  float result = ((maxValue - minValue) * vcc) / 1024.0;
  return result;
}