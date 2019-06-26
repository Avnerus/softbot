#include "processor.h"
#include "common.h"
#include "logger.h"

Processor::Processor(Chamber** chambers, PumpNg* pump) {
    _pump = pump;
    _chambers = chambers;
    _counter = 0;
    _currentLength = 0;

    for (int i = 0; i < MAX_VALUES;i++) {
      _currentValue[i] = 0;
    }

    _currentCommand = ' ';
    _currentState = START_INPUT;

    VALID_COMMANDS = "XPSEMCWRLH";
}

void Processor::processByte(byte input) {
    /*
    Serial.print(">DByte at state ");
    Serial.print(_currentState);
    Serial.print(": ");
    Serial.print(input); 
    Serial.print("<");*/

    switch (_currentState) {
        case START_INPUT: {
            if ((char)input == '>') {
              _currentState = COMMAND_INPUT;
              Logger::Write("Start command");
            }
            break;
        }
        case COMMAND_INPUT: {
            if(VALID_COMMANDS.indexOf((char)input)!= -1) {
                  _currentCommand = input;
              //    Logger::Printf("Command is %c", input);
                  _currentState = LENGTH_INPUT;
            } else {
               // Logger::Write("WARNING INVALID COMMAND");
                _currentState = START_INPUT;
            }
            break;
        }
        case VALUE_INPUT: {
            if (_counter < MAX_VALUES) {
                _currentValue[_counter] = input;
            }
            _counter++;
            if (_counter == _currentLength || _counter >= MAX_VALUES) {
                 this->processCommand();
                 _currentState = START_INPUT;
            }
            break;
      }
        case LENGTH_INPUT: {
            _currentLength = input;
            if (_currentLength > MAX_VALUES) {
              //  Logger::Write("WARNING RECEIVED LENGTH LONGER THAN MAX");
                _currentState = START_INPUT;
            }
            else if (_currentLength > 0) {
               _currentState = VALUE_INPUT;
             //   Logger::Printf("Length of command: %d", currentLength);

            } else {
                this->processCommand();
                _currentState = START_INPUT;
            }
            _counter = 0;
            break;
        }
        default:
            break;
    }
}

void Processor::processCommand() {
    Logger::Printf("Processing command %c", _currentCommand);
    switch(_currentCommand)  {
        case 'X': {
            //updateChambers(currentValue[0] - 50, currentValue[1] - 50);
            break;
        }
        case 'P': {
            _pump->setSpeed((float)_currentValue[0] / 255.0);
            break;
        }
        case 'S': {
            int chamberIndex = (int)_currentValue[0];
            Chamber* chamber = this->getChamber(chamberIndex);
            if (chamber) {
                Logger::Printf("Stop chamber ",chamber->getName(), chamberIndex);
                chamber->stop();
            } else {
                Logger::Printf("No such chamber ", chamberIndex);
            }
            break;
        }
        case 'E': {
            Chamber* eyes = this->getChamber(EYE_CHAMBERS);
            if (eyes) {
                if (_currentLength == 2) {
                    float inflationMin = (float)_currentValue[0] / 255.0;
                    float inflationMax = (float)_currentValue[1] / 255.0;
                    eyes->oscillate(inflationMin,inflationMax);
                } else {
                    float inflation = (float)_currentValue[0] / 255.0;

                    eyes->inflateTo(inflation, 0.95);
                }
            }
            break;
        }
        case 'M': {
            Chamber* mouth = this->getChamber(MOUTH_CHAMBER);
            if (mouth) {
                if (_currentLength == 2) {
                    float inflationMin = (float)_currentValue[0] / 255.0;
                    float inflationMax = (float)_currentValue[1] / 255.0;
                    mouth->oscillate(inflationMin,inflationMax);
                    
                } 
                else {
                    float inflation = (float)_currentValue[0] / 255.0;
                    mouth->inflateTo(inflation, 0.95);
                }
           }
           break;
        }
        case 'K': {
            Chamber* cheeks = this->getChamber(CHEEK_CHAMBERS);
            if (cheeks) {
                if (_currentLength == 2) {
                    float inflationMin = (float)_currentValue[0] / 255.0;
                    float inflationMax = (float)_currentValue[1] / 255.0;
                    cheeks->oscillate(inflationMin,inflationMax);
                } else {
                    float inflation = (float)_currentValue[0] / 255.0;
                    cheeks->inflateTo(inflation, 0.95);
                }
            }
            break;
        }
        case 'R': {
            Chamber* rightArm = this->getChamber(ARMS_CHAMBRS);
            if (rightArm){ 
                int value = (int)_currentValue[0];
                rightArm->inflateTo((float)value / 255.0f, 1.0);
            }
            break;
        }
        case 'L': {
            Chamber* leftArm = this->getChamber(ARMS_CHAMBRS);
            if (leftArm){ 
                int value = (int)_currentValue[0];
                leftArm->inflateTo((float)value / 255.0f, 1.0);
            }
            break;
        }
        case 'W': {
            int pin = (int)_currentValue[0];
            int value = (int)_currentValue[1] == 0 ? LOW : HIGH;
            digitalWrite(pin, value);
            Logger::Printf("Write ", value, " to pin ", pin);
            break;
        }
        case 'H': {
            int chamberIndex = (int)_currentValue[0];
            int chamberState = (int)_currentValue[1];
            Chamber* chamber = this->getChamber(chamberIndex);
            if (chamber) {
                Logger::Printf("Chamber ", chamber->getName(), chamberState);
                switch (chamberState) {
                    case STOP_STATE: {
                        chamber->stop();
                        break;
                    }
                    case INFLATE_STATE: {
                        chamber->inflateMax(1.0);
                        break;
                    }
                    case DEFLATE_STATE: {
                        chamber->deflateMax();
                        break;
                    }
                    default: {
                        Logger::Printf("No such state %d", chamberState);
                    }
                }

            } else {
                Logger::Printf("No such chamber %d", chamberIndex);
            }
            break;
        }
        case 'C': {
            int chamberIndex = (int)_currentValue[0];
            int value = (int)_currentValue[1];
            float inflate = (float)value / 255.0f;
            Chamber* chamber = this->getChamber(chamberIndex);
            if (chamber) {
                Logger::Printf("Inflate ",chamber->getName()," to reach ", value);
                chamber->inflateTo(inflate, 1.0);
            } else {
                Logger::Printf("No such chamber %d", chamberIndex);
            }
            break;
        }
        default: {
            break;
        }
     }
}


Chamber* Processor::getChamber(int id) {
    if (id <= NUM_OF_CHAMBERS -1) {
        return _chambers[id];
    } else {
        return NULL;
    }
}

/*
void dispatchStop() {
    for (int i = 0; i < NUM_OF_CHAMBERS; i++) { // Just neck
        chambers[i]->stop();
    }
}*/

