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
            const char* name,
            Valve* entryValve,
            Valve* releaseValve,
            int pressureSensor,
            int minPressure,
            int maxPressure
        );
        ~Chamber();

        void init();
        void update();

        void inflateMax(float speed);
        void inflateTo(float max, float speed);
        void deflate();
        void deflateMax();
        void stop();

        int getPressure();
        bool isInflated();

        void setInflation(float desiredInflation);
        void oscillate(float min, float max);
        void endOscillation();

        CHAMBER_STATE getState();

    private:
        void inflate(float speed);

        Valve* _entryValve;
        Valve* _releaseValve;
        int _pressureSensor;
        int _maxPressure;
        int _minPressure;
        int _pressure;
        int _destinationPressure;
        const char* _name;

        unsigned long _lastDeflateToggle;
        bool _deflateToggle;
        bool _oscillating;
        int _oscillateMin;
        int _oscillateMax;

        CHAMBER_STATE _state;

};

#endif
