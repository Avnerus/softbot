#ifndef PUMPNG_H
#define PUMPNG_H

#include <Arduino.h>

class PumpNg {

    public:
        PumpNg(int inPin1, int inPin2, int speedPin, int standByPin, int resolution = 1023);
        ~PumpNg();

        void init();
        void setSpeed(float speed);
        int getMotorSpeed();
        float getSpeed();
        void inflate();
        void stop();
        void start();
        void grab();
        void release();

    private:
        float _speed;
        bool _on;
        int _motorSpeed;
        int _inPin1;
        int _inPin2;
        int _speedPin;
        int _standByPin;
        int _useCount;
        int _resolution;
};
#endif
