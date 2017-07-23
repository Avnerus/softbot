#include "pump.h"

const int INFLATION_SPEED = 200;
const int MAX_SPEED = 255;

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
    _speed = 0.0;
    _useCount = 0;

    digitalWrite(_motorPin,HIGH);
    analogWrite(_enablePin, 0);
}
void Pump::setSpeed(float speed) {
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(255 * speed);
        Serial.print("Pump ");
        Serial.println(_motorSpeed);
        analogWrite(_enablePin,_motorSpeed);
    }
}

void Pump::inflate() {
    setSpeed(INFLATION_SPEED);
}

void Pump::grab() {
    _useCount++;
    Serial.print("Pump grab, use count: ");
    Serial.println(_useCount);
}

void Pump::release() {
    if (_useCount > 0) {
        _useCount--;
        Serial.print("Pump release, use count: ");
        Serial.println(_useCount);

        if (_useCount == 0) {
            stop();
        }
    }
}

void Pump::stop() {
    _motorSpeed = 0;
    _speed = 0.0;

    setSpeed(_motorSpeed);
}

int Pump::getMotorSpeed() {
    return _motorSpeed;
}

float Pump::getSpeed() {
    return _speed;
}

