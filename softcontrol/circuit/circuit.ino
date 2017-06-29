#include "common.h"
#include "chamber.h"
#include "pump.h"


enum INPUT_STATE {
  START_INPUT = 0,
  COMMAND_INPUT = 1,
  VALUE_INPUT = 2,
  POSITION_INPUT = 3
};

const int MAX_ORIENTATION = 1000;
const int MIN_ORIENTATION = -1000;

const int MAX_POSITION = 50;

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

const int RIGHT_CHAMBER = 0;
const int LEFT_CHAMBER = 1;
const int DOWN_CHAMBER = 2;

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
    currentPosition[positionCounter] = currentValue - 50;
    if (positionCounter == 1) {
        currentState = START_INPUT;
        positionCounter = 0;
        updateChambers();
        updatePump();
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
        case 'S': {
           // dispatchStop();
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
    // Add the current change to the orientation
    currentOrientation.x = constrain(currentOrientation.x + currentPosition[0], MIN_ORIENTATION, MAX_ORIENTATION);
    currentOrientation.y = constrain(currentOrientation.y + currentPosition[1], MIN_ORIENTATION, MAX_ORIENTATION);

    // Left
    chambers[RIGHT_CHAMBER].setInflation(currentOrientation.x > 0 ? currentOrientation.x / MAX_ORIENTATION : 0);

    /*

    Serial.print("X");
    Serial.print(currentOrientation.x);
    Serial.print("Y");
    Serial.println(currentOrientation.y);
    */
}

void updatePump() {
    int maxPower = max(abs(currentPosition[0]), abs(currentPosition[1]));
    pump.setSpeed((float)maxPower / MAX_POSITION);
}
