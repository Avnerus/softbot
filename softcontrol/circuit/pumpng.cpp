#include "pumpng.h"
#include "logger.h"

const float INFLATION_SPEED = 1;
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
    _on = false;

}
void PumpNg::setSpeed(float speed) {
    Logger::Printf("Pump set speed to %f", speed);
    if (speed >= 0.0 && speed <= 1.0) {
        _speed = speed;
        _motorSpeed = (int)(MAX_SPEED * speed);
        Logger::Printf("Pump setting motor speed to %d", _motorSpeed);

        analogWrite(_speedPin,_motorSpeed);

        if (!_on) {
            start();
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

