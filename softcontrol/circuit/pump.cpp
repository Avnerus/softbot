#include "pump.h"

const int INFLATION_SPEED = 140;

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
    if (speed >= 0 && speed <= 255) {
        _motorSpeed = speed;
       // Serial.println(_motorSpeed);
        analogWrite(_enablePin,_motorSpeed);
    }
}

void Pump::inflate() {
    setSpeed(INFLATION_SPEED);
}

void Pump::stop() {
    setSpeed(0);
}

