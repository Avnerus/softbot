#include "valve.h"

//Valve* valve1 = new Valve(4,9,5,25,255); // CHAMBER A-1
//Valve* valve2 = new Valve(4,26,5,25,255); // CHAMBER A-2

//Valve* valve1 = new Valve(27,28,6,25,255); // CHAMBER B-1
//Valve* valve2 = new Valve(27,31,6,25,255); // CHAMBER B-2

//Valve* valve = new Valve(14,5,7,2,255); // CHAMBER D
//Valve* valve = new Valve(14,5,30,2,255); // CHAMBER G

Valve* valve1 = new Valve(21,20,8,25); // CHAMBER E-1
Valve* valve2 = new Valve(21,19,8,25); // CHAMBER E-2

void setup() {
  Serial.begin(9600); 
  delay(2000);
  Serial.println("Valve test");

  valve1->init();
  valve2->init();
}

void loop() {
    Serial.println("Open 1 close 2");
    valve2->close();
    valve1->open();
    delay(2000);
    Serial.println("Close 1 open 2");
    valve1->close();
    valve2->open();
    delay(2000);
}

