#ifndef PUMP_H
#define PUMP_H

#include <Arduino.h>

class Pump {

    public:
        Pump(int enablePin, int motorPin);
        ~Pump();

        void init();
        void setSpeed(int speed);
        void inflate();
        void stop();

    private:
        int _enablePin;
        int _motorPin;
        int _motorSpeed;

};
#endif
