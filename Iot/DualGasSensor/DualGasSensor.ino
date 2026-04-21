#define MQ2_PIN 34  // Smoke and Flammable gas
#define MQ5_PIN 35  // Natural gas and LPG

void setup() {
  Serial.begin(115200);
  
  pinMode(MQ2_PIN, INPUT);
  pinMode(MQ5_PIN, INPUT);
  
  Serial.println("SYSTEM_START: Dual Gas Sensor Node (MQ2 & MQ5)");
  Serial.println("Note: Sensors need 2-3 minutes to warm up.");
}

void loop() {
  // Read analog values (0 to 4095 on ESP32)
  int mq2Value = analogRead(MQ2_PIN);
  int mq5Value = analogRead(MQ5_PIN);

  // We send 0,0 for Temp/Humid to keep your Java parsing index consistent
  // Format: DATA:MQ2,MQ5,TempPlaceholder,HumidPlaceholder
  Serial.print("DATA:");
  Serial.print(mq2Value);
  Serial.print(",");
  Serial.print(mq5Value);
  Serial.print(",");
  Serial.print("0.0"); // Placeholder for Temp
  Serial.print(",");
  Serial.println("0.0"); // Placeholder for Humidity

  delay(1000); // Send every 1 second
}