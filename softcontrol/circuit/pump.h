#ifndef PUMP_H
#define PUMP_H

#include <Arduino.h>

class Pump {
    int _enablePin;
    int _motorPin;
    int _motorSpeed;

    public:
    Pump(int enablePin, int motorPin);
    ~Pump();

    void init();
    void setSpeed(int speed);
};
#endif
