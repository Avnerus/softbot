#include "chamber.h"
#include "pump.h"

Chamber chamber1(10,9,A0,300);
Pump pump(6,7);

void setup() {
  Serial.begin(9600); 
  chamber1.init();
  pump.init();
}

void loop() {
  /*
    int sensorValue = analogRead(A0);
    int motorSpeed = round((float)sensorValue / 1023 * 255);
    //Serial.println(motorSpeed);
 */
     
    if (Serial.available()) {
      char command = Serial.read();
      int value = Serial.read();

      //motorSpeed = Serial.read();
      Serial.println(command);
      Serial.println(value);

      switch(command)  {
        case 'P':
            pump.setSpeed(value);
            break;
      }
    } 


    delay(30);
}
