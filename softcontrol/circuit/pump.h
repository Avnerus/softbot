#ifndef PUMP_H
#define PUMP_H

#include <Arduino.h>

class Pump {

    public:
        Pump(int enablePin, int motorPin);
        ~Pump();

        void init();
        void setSpeed(float speed);
        int getMotorSpeed();
        float getSpeed();
        void inflate();
        void stop();
        void grab();
        void release();

    private:
        float _speed;
        int _enablePin;
        int _motorPin;
        int _motorSpeed;
        int _useCount;

};
#endif
