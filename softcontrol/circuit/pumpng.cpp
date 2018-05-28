#include "pumpng.h"

const float INFLATION_SPEED = 1.0;
const int MAX_SPEED = 255;

PumpNg::PumpNg(int inPin1, int inPin2, int speedPin, int standByPin) {

    _inPin1 = inPin1;
    _inPin2 = inPin2;
    _speedPin = speedPin;
    _standByPin = standByPin;
}

PumpNg::~PumpNg() {

}
void PumpNg::init() {
    pinMode(_inPin1, OUTPUT);
    pinMode(_inPin2, OUTPUT);
    pinMode(_speedPin, OUTPUT);
    pinMode(_standByPin, OUTPUT);

    _motorSpeed = 0;
    _speed = 0.0;
    _useCount = 0;

}
void PumpNg::setSpeed(float speed) {
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(255 * speed);
        /*
        Serial.print("Pump ");
        Serial.println(_motorSpeed); */

        analogWrite(_speedPin,_motorSpeed);
    }
}

void PumpNg::inflate() {
    //Serial.println("Inflating");
    digitalWrite(_standByPin,HIGH);
    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,LOW);
    setSpeed(INFLATION_SPEED);
}

void PumpNg::grab() {
    _useCount++;
    Serial.print("Pump grab, use count: ");
    Serial.println(_useCount);
}

void PumpNg::release() {
    if (_useCount > 0) {
        _useCount--;
        Serial.print("Pump release, use count: ");
        Serial.println(_useCount);

        if (_useCount == 0) {
            stop();
        }
    }
}

void PumpNg::stop() {
    _motorSpeed = 0;
    _speed = 0.0;

    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,HIGH);
    setSpeed(_motorSpeed);
}

int PumpNg::getMotorSpeed() {
    return _motorSpeed;
}

float PumpNg::getSpeed() {
    return _speed;
}

