#include "common.h"
#include "chamber.h"
#include "pump.h"


enum INPUT_STATE {
  START_INPUT = 0,
  COMMAND_INPUT = 1,
  VALUE_INPUT = 2,
  POSITION_INPUT = 3
};

const int MAX_POSITION = 50;

char currentCommand;
byte  currentValue;
INPUT_STATE currentState;
const char* VALID_COMMANDS = "PDUSRL";

Pump pump(3,4);

int positionCounter = 0;
int currentPosition[2] = {0,0};

Chamber chambers[3] = {
    Chamber(&pump, 9,8,A0,700),
    Chamber(&pump, 12,11,A1,700),
    Chamber(&pump, 6,7,A2,700)
};

const int RIGHT_CHAMBER = 1;
const int LEFT_CHAMBER = 2;
const int DOWN_CHAMBER = 0;

void setup() {
  Serial.begin(9600); 
  Serial.println("Softbot starting");
  pump.init();

  currentCommand = ' ';
  currentValue = 0;
  currentState = START_INPUT;


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

    if (currentPosition[0] > 0 && currentPosition[0] > abs(currentPosition[1])) {
        left();
    } else if (currentPosition[0] < 0 && abs(currentPosition[0]) > abs(currentPosition[1])) {
        right();
    }
    else if (currentPosition[1] > 0  && currentPosition[1] > abs(currentPosition[0])) {
        down();
    }
    else if (currentPosition[1] < 0) {
        up();
    }
}

void left() {
    Serial.println("Left");
    if (chambers[RIGHT_CHAMBER].isInflated()) {
        chambers[RIGHT_CHAMBER].deflate();
    } else {
        chambers[RIGHT_CHAMBER].stop();
        chambers[LEFT_CHAMBER].inflate();
    }
}
void right() {
    Serial.println("Right");
    if (chambers[LEFT_CHAMBER].isInflated()) {
        chambers[LEFT_CHAMBER].deflate();
    } else {
        chambers[LEFT_CHAMBER].stop();
        chambers[RIGHT_CHAMBER].inflate();
    }

}
void up() {
    if (chambers[DOWN_CHAMBER].isInflated()) {
        chambers[DOWN_CHAMBER].deflate();
    } else {
        chambers[DOWN_CHAMBER].stop();
        chambers[LEFT_CHAMBER].inflate();
        chambers[RIGHT_CHAMBER].inflate();
    }
}
void down() {
    Serial.println("Down");
    /*
    if (chambers[RIGHT_CHAMBER].isInflated()) {
        chambers[RIGHT_CHAMBER].deflate();
    } else {
        chambers[RIGHT_CHAMBER].stop();
    }
    if (chambers[LEFT_CHAMBER].isInflated()) {
        chambers[LEFT_CHAMBER].deflate();
    } else {
        chambers[LEFT_CHAMBER].stop();
    }*/

    if (chambers[LEFT_CHAMBER].getState() == IDLE && chambers[RIGHT_CHAMBER].getState() == IDLE) {
        chambers[DOWN_CHAMBER].inflate();
    }
}
void updatePump() {
    // Don't pump while one is deflating
    if (chambers[0].getState() == DEFLATING || 
        chambers[1].getState() == DEFLATING || 
        chambers[2].getState() == DEFLATING 
       ) {
       pump.setSpeed(0);
    }
    else {
        int maxPower = max(abs(currentPosition[0]), abs(currentPosition[1]));
        pump.setSpeed((float)maxPower / MAX_POSITION);
    }

}
