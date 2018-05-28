#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>
#include "common.h"
#include "pumpng.h"



enum CHAMBER_STATE {
  IDLE,
  INFLATING,
  DEFLATING
};

class Chamber {

    public:
        Chamber(
            char* name,
            PumpNg** pumps,
            int numOfPumps,
            int entryValve,
            int releaseValve,
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
        void grabPump();
        void releasePump();

        int _entryValve;
        int _releaseValve;
        int _pressureSensor;
        int _maxPressure;
        int _minPressure;
        int _pressure;
        int _destinationPressure;
        char* _name;

        PumpNg** _pumps;

        unsigned long _lastDeflateToggle;
        bool _deflateToggle;
        bool _oscillating;
        bool _usingPump;
        int _oscillateMin;
        int _oscillateMax;
        int _numOfPumps;

        CHAMBER_STATE _state;

};

#endif
