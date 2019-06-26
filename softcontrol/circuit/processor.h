#include <Arduino.h>
#include "pumpng.h"
#include "chamber.h"

#ifndef PROCESSOR_H
#define PROCESSOR_H

#define MAX_VALUES 4

enum INPUT_STATE {
  START_INPUT = 0,
  COMMAND_INPUT = 1,
  VALUE_INPUT = 2,
  LENGTH_INPUT = 3,
  POSITION_INPUT = 4,
};

class Processor {

    public:
        Processor(Chamber** chambers, PumpNg* pump);
        void processByte(byte input);

    private:
        void processCommand();
        Chamber* getChamber(int id);

        Chamber** _chambers;
        PumpNg* _pump;
        char  _currentCommand;
        byte  _currentValue[MAX_VALUES];
        byte  _counter;
        byte  _currentLength;
        INPUT_STATE _currentState;

        const String VALID_COMMANDS;
};

#endif
