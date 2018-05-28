#ifndef PUMPNG_H
#define PUMPNG_H

#include <Arduino.h>

class PumpNg {

    public:
        PumpNg(int inPin1, int inPin2, int speedPin, int standByPin);
        ~PumpNg();

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
        int _motorSpeed;
        int _inPin1;
        int _inPin2;
        int _speedPin;
        int _standByPin;
        int _useCount;
};
#endif
