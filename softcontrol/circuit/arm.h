#ifndef ARM_H
#define ARM_H

#include <Arduino.h>
#include <SPI.h>
#include "SparkFunBME280.h"
#include "Statistic.h"

class Arm {
    public:
        Arm(int id ,int pin, int threshold);
        ~Arm();

        void init();
        void update(unsigned long now);

    private:
        bool _pushed;
        bool _active;
        float _idlePressure;
        int _pin;
        int _id;
        int _threshold;
        unsigned long _lastCheck;
        BME280 _sensor;
        Statistic _calibrationStats; 
};
#endif
