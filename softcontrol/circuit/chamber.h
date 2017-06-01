#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>
#include "pump.h"

class Chamber {

    Pump* _pump;
    int _entryValve;
    int _releaseValve;
    int _pressureSensor;
    int _maxPressure;

    public:
    Chamber(Pump* pump, int entryValve, int releaseValve, int pressureSensor, int maxPressure);
    ~Chamber();

    void init();
    void update();

    void inflate();
    void stop();
};

#endif
