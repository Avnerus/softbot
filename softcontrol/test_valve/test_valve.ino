#include "valve.h"
#include "pumpng.h"

//Valve* release = new Valve(2,3,5,25);
//Valve* entry   = new Valve(2,26,5,25);
Valve* release = new Valve(6,7,9,25, 1023);
Valve* entry  = new Valve(6,8,9,25, 1023);

PumpNg* pump = new PumpNg(22,21,23,25, 1023);

int stage;
int clock;


void setup() {
  Serial.begin(9600); 
  delay(3000);
  Serial.println("Valve test");

  analogWriteResolution(10);

  entry->init();
  release->init();
  pump->init();
  pump->setSpeed(0.5);
  Serial.println("Deflate completely");
  entry->close();
  release->open();
  delay(2000);
  clock = millis();
  stage = 0;
}

void loop() {
    int timer = millis() - clock;
    if (timer >= 0 && stage == 0) {
        Serial.println("Inflate");
        release->close();
        entry->open();
        stage = 1;
    }
    else if (timer >= 2000 && stage == 1) {
        entry->close();
        stage = 2;
    }
    else if (timer >= 4000 && stage == 2) {
        Serial.println("Deflate");
        entry->close();
        release->open(0.3);
        stage = 3;
    }
    else if (timer >= 14000 && stage == 3) {
        clock = millis();
        stage = 0;
    }
}
