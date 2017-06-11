#include "pump.h"

const int INFLATION_SPEED = 200;

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

    digitalWrite(_motorPin,HIGH);
    analogWrite(_enablePin, 0);
}
void Pump::setSpeed(int speed) {
    if (speed >= 0 && speed <= 255) {
         //Serial.println("Set speed");
         Serial.println(speed);
        _motorSpeed = speed;
        analogWrite(_enablePin,_motorSpeed);
    }
}

void Pump::inflate() {
    setSpeed(INFLATION_SPEED);
}

void Pump::stop() {
    setSpeed(0);
}

