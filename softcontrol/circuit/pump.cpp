#include "pump.h"

Pump::Pump(int enablePin, int motorPin) {
    _enablePin = enablePin;
    _motorPin = motorPin;
}

Pump::~Pump() {

}

void Pump::init() {
    pinMode(_enablePin, OUTPUT);
    pinMode(_motorPin, OUTPUT);

    _motorSpeed = 0;

    //Serial.println("Init pump, speed" , _motorSpeed);

    digitalWrite(_motorPin,HIGH);
    analogWrite(_enablePin, _motorSpeed);
}

void Pump::setSpeed(int speed) {
    _motorSpeed = speed;
    Serial.println("Pump setting speed!");
    analogWrite(_enablePin,_motorSpeed);
}

