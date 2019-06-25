#include "pumpng.h"
#include "logger.h"

const float INFLATION_SPEED = 0.7;

PumpNg::PumpNg(int inPin1, int inPin2, int speedPin, int standByPin, int resolution) {

    _inPin1 = inPin1;
    _inPin2 = inPin2;
    _speedPin = speedPin;
    _standByPin = standByPin;
    _resolution = resolution;
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
    _on = false;

}
void PumpNg::setSpeed(float speed) {
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(_resolution * speed);
        Logger::Printf("Pump setting motor speed to ", _motorSpeed);

        analogWrite(_speedPin,_motorSpeed);

        if (speed > 0.0 && !_on) {
            start();
        }
        else if (speed == 0.0 && _on) {
            stop();
        }
    }
}

void PumpNg::inflate() {
    Logger::Write("Pump inflating");
    start();
    setSpeed(INFLATION_SPEED);
}

void PumpNg::start() {
    Logger::Write("Pump starting");
    digitalWrite(_standByPin,HIGH);
    digitalWrite(_inPin1,HIGH);
    digitalWrite(_inPin2,LOW);
    _on = true;
}


void PumpNg::stop() {
    _motorSpeed = 0;
    _speed = 0.0;
    _on  = false;

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

bool PumpNg::isOn() {
    return _on;
}

void PumpNg::grab() {
    _useCount++;
    if (_useCount > 0) {
        this->inflate();
    }
}

void PumpNg::release() {
    _useCount--;
    if (_useCount <= 0) {
        _useCount = 0;
        this->stop();
    }
}

