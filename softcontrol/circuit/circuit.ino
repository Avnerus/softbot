#include "chamber.h"
#include "pump.h"

Pump pump(6,7);

Chamber chambers[1] = {
    Chamber(&pump,10,9,A0,300)
};

void setup() {
  Serial.begin(9600); 
  pump.init();
  for (int i = 0; i < sizeof(chambers); i++) {
      chambers[i].init();
  }
}

void loop() {
  /*
    int sensorValue = analogRead(A0);
    int motorSpeed = round((float)sensorValue / 1023 * 255);
    //Serial.println(motorSpeed);
 */
     
    if (Serial.available()) {
      char start = Serial.read();
      if (start == '>') {
            char command = Serial.read();
            int value = Serial.read();

            //motorSpeed = Serial.read();
            //Serial.println(command);
            //Serial.println(value);

            switch(command)  {
                case 'P': {
                    pump.setSpeed(value);
                    break;
                }
                case 'D': {
                    chambers[0].inflate();
                    break;
                }
                case 'S': {
                    dispatchStop();
                    pump.setSpeed(0);
                    break;
                }
            }
      }
    } 

    for (int i = 0; i < sizeof(chambers); i++) {
        chambers[i].update();
    }

    delay(30);
}

void dispatchStop() {
    for (int i = 0; i < sizeof(chambers); i++) {
        chambers[i].stop();
    }
}
