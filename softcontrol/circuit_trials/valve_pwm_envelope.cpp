#include "valve.h"
#include "logger.h"

const float OPEN_SPEED = 1.0;

Valve::Valve(int inPin1, int inPin2, int speedPin, int standByPin, int resolution) {

    _inPin1 = inPin1;
    _inPin2 = inPin2;
    _speedPin = speedPin;
    _standByPin = standByPin;
    _resolution = resolution;

    _counter = 0;
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
    _motorSpeed = (int)(_resolution * speed);
    _speed = speed;

    if (false/*speed > 0.0 && speed < 1.0*/) {
        _counter = 1;
        Serial.println("Writing first 1023");
        analogWrite(_speedPin,1023);
    } else {
        Serial.print("Writing right away ");
        analogWrite(_speedPin,_motorSpeed);
        Serial.println(_motorSpeed);
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

void Valve::update() {
    if (_counter > 0) {
        _counter++;
    }
    if (_counter == 100) {
        Serial.print("Writing now ");
        Serial.println(_motorSpeed);
        analogWrite(_speedPin, _motorSpeed);
        _counter = 0;
    }

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

