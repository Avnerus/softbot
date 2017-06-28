#include "common.h"
#include "chamber.h"
#include "pump.h"


enum INPUT_STATE {
  START_INPUT = 0,
  COMMAND_INPUT = 1,
  VALUE_INPUT = 2,
  POSITION_INPUT = 3
};

char currentCommand;
byte  currentValue;
INPUT_STATE currentState;
const char* VALID_COMMANDS = "PDUSRL";

Orientation currentOrientation;

Pump pump(3,4);

int positionCounter = 0;
int currentPosition[2] = {0,0};

Chamber chambers[3] = {
    Chamber(&pump, 9,8,A0,700),
    Chamber(&pump, 12,11,A1,700),
    Chamber(&pump, 6,7,A2,700)
};


void setup() {
  Serial.begin(9600); 
  Serial.println("Softbot starting");
  pump.init();

  currentCommand = ' ';
  currentValue = 0;
  currentState = START_INPUT;

  currentOrientation.x = 0;
  currentOrientation.y = 0;

  int numOfChambers = sizeof(chambers) / sizeof(chambers[0]);
  for (int i = 0; i < numOfChambers; i++) {
     chambers[i].init();
     delay(100);
  }
}

void loop() {
    for (int i = 0; i < sizeof(chambers) / sizeof(chambers[0]); i++) {
        chambers[i].update();
    }
}

void processByte() {
    if (currentState == POSITION_INPUT) {
        currentValue = Serial.read();
        processPosition();
    }
    else if (currentState == VALUE_INPUT) {
       currentState = START_INPUT;
       currentValue = Serial.read();
       processCommand();
    } else {
      char input = Serial.read();
      if (input == '>') {
        currentState = COMMAND_INPUT;
      }
      else if (currentState == COMMAND_INPUT && input == 'X') {
            currentState = POSITION_INPUT;
      }
      else if (currentState == COMMAND_INPUT && strchr(VALID_COMMANDS,input) != -1) {
          currentCommand = input;
          currentState = VALUE_INPUT;
      } 

    }
}
void serialEvent() {
  int bytesAvailable = Serial.available();
  for (int i = 0; i < bytesAvailable; i++) {
        processByte();
  }
}

void processPosition() {
    //Serial.println(currentValue);
    currentPosition[positionCounter] = currentValue;
    if (positionCounter == 1) {
        currentState = START_INPUT;
        positionCounter = 0;
    } else {
        positionCounter++;
    }
}

void processCommand() {
    switch(currentCommand)  {
        case 'P': {
            pump.setSpeed(currentValue);
            break;
        }
        case 'D': {
        /*
            chambers[1].stop();
            chambers[0].stop();
            chambers[2].inflate();
            pump.inflate(); 
            */

            currentOrientation.y = max(-100, currentOrientation.y -1);
            updateChambers();

            break;
        }
        case 'U': {
        /*
            chambers[2].stop();
            if (chambers[2].isInflated()) {
                chambers[2].deflate();
            } else {
                chambers[1].inflate();
                chambers[0].inflate();
                pump.inflate();
            } */
            break;
        }
        case 'L': {
            chambers[0].stop();
            if (chambers[0].isInflated()) {
                chambers[0].deflate();
            } else {
                chambers[1].inflate();
                pump.inflate();
            }
            break;
        }
        case 'R': {
            chambers[1].stop();
            if (chambers[1].isInflated()) {
              chambers[1].deflate();
           } else {
                chambers[0].inflate();
                pump.inflate();
            }
            break;
        }
        case 'S': {
            dispatchStop();
            pump.setSpeed(0);
            break;
        }
        default: {
            break;
        }
     }
}


void dispatchStop() {
    for (int i = 0; i < sizeof(chambers); i++) {
        chambers[i].stop();
    }
}

void updateChambers() {

}
