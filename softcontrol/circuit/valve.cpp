#include "valve.h"
#include "logger.h"

const float OPEN_SPEED = 1.0;

Valve::Valve(int inPin1, int inPin2, int speedPin, int standByPin, int resolution) {

    _inPin1 = inPin1;
    _inPin2 = inPin2;
    _speedPin = speedPin;
    _standByPin = standByPin;
    _resolution = resolution;
}

Valve::~Valve() {

}
void Valve::init() {
    pinMode(_inPin1, OUTPUT);
    pinMode(_inPin2, OUTPUT);
    pinMode(_speedPin, OUTPUT);
    pinMode(_standByPin, OUTPUT);

    //analogWriteFrequency(_speedPin, 50);

    _motorSpeed = 0;
    _speed = 0.0;
}
void Valve::setSpeed(float speed) {
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(_resolution * speed);
        analogWrite(_speedPin,_motorSpeed);
    }
}

void Valve::open(float speed) {
    //Serial.println("Inflating");
    //Logger::Printf("Valve opening at %f (IN1 %d, IN2 %d, PWM %d)",speed,  _inPin1, _inPin2, _speedPin);
    digitalWrite(_standByPin,HIGH);
    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,LOW);
    setSpeed(speed);
}

void Valve::open() {
    open(OPEN_SPEED);
}

void Valve::close() {
    //Logger::Printf("Valve closing (IN1 %d, IN2 %d, PWM %d)", _inPin1, _inPin2, _speedPin);
    _motorSpeed = 0;
    _speed = 0.0;

    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,HIGH);
    setSpeed(_motorSpeed);
    //setSpeed(_motorSpeed);
}

int Valve::getMotorSpeed() {
    return _motorSpeed;
}

float Valve::getSpeed() {
    return _speed;
}

