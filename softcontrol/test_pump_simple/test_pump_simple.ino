#include "pumpng.h"

PumpNg* pump = new PumpNg(42,55,17,25,255); // Pump

void setup() {
  Serial.begin(9600); 
  delay(2000);
  Serial.println("Pump test");

  pump->init();
}

void loop() {
    Serial.println("Inflate");
    pump->inflate();
    delay(2000);
    Serial.println("Deflate");
    pump->stop();
    delay(2000);
}

