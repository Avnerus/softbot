#include "chamber.h"
#include "pump.h"


enum INPUT_STATE {
  START_INPUT,
  COMMAND_INPUT,
  VALUE_INPUT
};

char currentCommand;
int  currentValue;
INPUT_STATE currentState;
String validCommands;

Chamber chambers[3] = {
    Chamber(9,8,A0,700),
    Chamber(12,13,A1,700),
    Chamber(10,11,A2,700)
};
Pump pump(3,4);

void setup() {
  Serial.begin(9600); 
  pump.init();

  currentCommand = ' ';
  currentValue = 0;
  currentState = START_INPUT;
  validCommands = "PDULRS";

  for (int i = 0; i < sizeof(chambers); i++) {
      chambers[i].init();
  }
}

void loop() {
    int bytesAvailable = Serial.available();
    for (int i = 0; i < bytesAvailable; i++) {
        processByte();
    }

    for (int i = 0; i < sizeof(chambers); i++) {
        chambers[i].update();
    }

    delay(30);
}

void processByte() {
    if (currentState == VALUE_INPUT) {
       currentValue = Serial.read();
       processCommand();
       currentState = START_INPUT;
    } else {
      char input = Serial.read();
      Serial.println(input);
      if (currentState == START_INPUT && input == '>') {
        currentState = COMMAND_INPUT;
      }
      else if (currentState == COMMAND_INPUT && validCommands.indexOf(input) != -1) {
          currentCommand = input;
          currentState = VALUE_INPUT;
      }  
   }
}

void processCommand() {
    Serial.println("Process!");
    Serial.println(currentCommand);
    Serial.println(currentValue);

    switch(currentCommand)  {
        case 'P': {
            pump.setSpeed(currentValue);
            break;
        }
        case 'D': {
            chambers[1].stop();
            chambers[0].stop();
            chambers[2].inflate();
            pump.inflate();
            break;
        }
        case 'U': {
            chambers[2].deflate();
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
