#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>

class Chamber {
    int _entryValve;
    int _releaseValve;
    int _pressureSensor;
    int _maxPressure;

    public:
    Chamber(int entryValve, int releaseValve, int pressureSensor, int maxPressure);
    ~Chamber();

    void init();

    void update();
};

#endif
