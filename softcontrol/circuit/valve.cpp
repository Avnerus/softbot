#include "valve.h"

const float OPEN_SPEED = 0.3;
const int MAX_SPEED = 255;

Valve::Valve(int inPin1, int inPin2, int speedPin, int standByPin) {

    _inPin1 = inPin1;
    _inPin2 = inPin2;
    _speedPin = speedPin;
    _standByPin = standByPin;
}

Valve::~Valve() {

}
void Valve::init() {
    pinMode(_inPin1, OUTPUT);
    pinMode(_inPin2, OUTPUT);
    pinMode(_speedPin, OUTPUT);
    pinMode(_standByPin, OUTPUT);

    _motorSpeed = 0;
    _speed = 0.0;
}
void Valve::setSpeed(float speed) {
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(255 * speed);
        /*
        Serial.print("Pump ");
        Serial.println(_motorSpeed); */

        analogWrite(_speedPin,_motorSpeed);
    }
}

void Valve::open() {
    //Serial.println("Inflating");
    digitalWrite(_standByPin,HIGH);
    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,LOW);
    setSpeed(OPEN_SPEED);
}

void Valve::close() {
    _motorSpeed = 0;
    _speed = 0.0;

    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,HIGH);
    setSpeed(_motorSpeed);
}

int Valve::getMotorSpeed() {
    return _motorSpeed;
}

float Valve::getSpeed() {
    return _speed;
}

