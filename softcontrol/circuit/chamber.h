#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>
#include "common.h"
#include "pump.h"



enum CHAMBER_STATE {
  IDLE,
  INFLATING,
  DEFLATING
};

class Chamber {

    public:
        Chamber(Pump* pump, int entryValve, int releaseValve, int pressureSensor, int maxPressure);
        ~Chamber();

        void init();
        void update();

        void inflate(float speed);
        void deflate();
        void stop();

        int getPressure();
        bool isInflated();

        void setInflation(float desiredInflation);

        CHAMBER_STATE getState();

    private:
        int _entryValve;
        int _releaseValve;
        int _pressureSensor;
        int _maxPressure;
        int _pressure;
        int _minPressure;

        Pump* _pump;

        unsigned long _lastDeflateToggle;
        bool _deflateToggle;

        CHAMBER_STATE _state;

};

#endif
