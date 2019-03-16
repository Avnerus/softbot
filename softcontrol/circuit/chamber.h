#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>
#include "common.h"
#include "valve.h"

enum CHAMBER_STATE {
  IDLE,
  INFLATING,
  DEFLATING
};

class Chamber {

    public:
        Chamber(
            const char name[10],
            Valve* entryValve,
            Valve* releaseValve,
            int pressureSensor,
            uint16_t minPressure,
            uint16_t maxPressure,
            float deflationSpeed = 1.0
        );
        ~Chamber();

        void init();
        void update(unsigned long now);

        void inflateMax(float speed);
        void inflateTo(float max, float speed);

        void deflate(float speed);
        void deflate();

        void deflateMax(float speed);
        void deflateMax();

        void stop();

        int16_t  getPressure();
        uint16_t  readPressure();
        bool isInflated();

        void setInflation(float desiredInflation);
        void oscillate(float min, float max);
        void endOscillation();

        bool pressureIsNear(uint16_t target);

        CHAMBER_STATE getState();

    private:
        void inflate(float speed);

        Valve* _entryValve;
        Valve* _releaseValve;
        int _pressureSensor;
        uint16_t _maxPressure;
        uint16_t _minPressure;
        uint16_t _basePressure;
        uint16_t _pressure;
        uint8_t _pressureReadCount;
        uint16_t _pressureReadSum;
        uint16_t _destinationPressure;
        char _name[10];

        unsigned long _lastDeflateToggle;
        unsigned long _lastPressureSense;

        float _deflationSpeed;

        bool _deflateToggle;
        bool _oscillating;
        int _oscillateMin;
        int _oscillateMax;

        CHAMBER_STATE _state;

};

#endif
