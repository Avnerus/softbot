#include "chamber.h"

Chamber::Chamber(int entryValve, int releaseValve, int pressureSensor, int maxPressure) {
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _maxPressure = maxPressure;
}

Chamber::~Chamber() {

}

void Chamber::init() {
    pinMode(_entryValve, OUTPUT);
    pinMode(_releaseValve, OUTPUT);

    Serial.println("Init chamber, closing both valves");
    digitalWrite(_entryValve, HIGH);
    digitalWrite(_releaseValve, LOW);
}

void Chamber::update() {
    // Blast Protection
    int pressure = analogRead(_pressureSensor);
    if (pressure > 300) {
       digitalWrite(_releaseValve, HIGH);
    } 
    //Serial.println(pressure); 
}
