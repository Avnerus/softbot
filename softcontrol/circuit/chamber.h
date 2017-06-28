#ifndef CHAMBER_H
#define CHAMBER_H

#include <Arduino.h>

enum CHAMBER_STATE {
  IDLE,
  INFLATING,
  DEFLATING
};

class Chamber {

    public:
        Chamber(int entryValve, int releaseValve, int pressureSensor, int maxPressure);
        ~Chamber();

        void init();
        void update();

        void inflate();
        void deflate();
        void stop();

        int getPressure();
        bool isInflated();

    private:
        int _entryValve;
        int _releaseValve;
        int _pressureSensor;
        int _maxPressure;
        int _pressure;

        unsigned long _lastDeflateToggle;
        bool _deflateToggle;

        CHAMBER_STATE _state;

};

#endif
