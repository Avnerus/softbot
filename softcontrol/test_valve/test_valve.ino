#include "valve.h"
#include "pumpng.h"
/*
   Left neck 
*/
Valve* release = new Valve(2,3,5,25,1023);
Valve* entry   = new Valve(2,26,5,25,1023);

/* Right neck  
Valve* release = new Valve(6,7,9,25, 1023);
Valve* entry  = new Valve(6,8,9,25, 1023);
*/


 /* Right Arm   
Valve* entry  = new Valve(17,15,37,25);
Valve* release = new Valve(17,16,37,25);
*/


/* Left Arm  
Valve* entry  = new Valve(20,18,38,25);
Valve* release = new Valve(20,19,38,25);
*/

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
  pump->setSpeed(0.0);
  Serial.println("Deflate completely");

  //entry->close();
  //release->open();
  delay(2000);

  clock = millis();
  stage = 0;
}

void loop() {
    int timer = millis() - clock;
    //inflateDeflate(timer);
    openClose(timer);
}

void openClose(int timer) {
    if (timer >= 0 && stage == 0) {
        Serial.println("Open");
        release->open();
        entry->open();
        stage = 1;
    }
    else if (timer >= 2000 && stage == 1) {
        Serial.println("close");
        entry->close();
        release->close();
        stage = 2;
    }
    else if (timer >= 4000 && stage == 2) {
        clock = millis();
        stage = 0;
    }
}

void inflateDeflate(int timer) {
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
        release->open();
        //release->open(0.3);
       // release->open(0.227);
        stage = 3;
    }
    else if (timer >= 8000 && stage == 3) {
        clock = millis();
        stage = 0;
    }
}
