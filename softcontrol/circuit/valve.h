#ifndef VALVE_H
#define VALVE_H

#include <Arduino.h>

class Valve {

    public:
        Valve(int inPin1, int inPin2, int speedPin, int standByPin, int resolution = 1023);
        ~Valve();

        void init();
        void setSpeed(float speed);
        int getMotorSpeed();
        float getSpeed();
        void open(float speed);
        void open();
        void close();

    private:
        float _speed;
        int _motorSpeed;
        int _inPin1;
        int _inPin2;
        int _speedPin;
        int _standByPin;
        int _resolution;
};
#endif
