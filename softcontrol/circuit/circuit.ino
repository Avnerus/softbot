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
const char* VALID_COMMANDS = "PDUSRLEM";

Pump neckPump(7,40);
Pump facePump(6,41);

int positionCounter = 0;
int currentPosition[2] = {0,0};

Chamber chambers[5] = {
    Chamber(&neckPump, 26,28,A1,700),
    Chamber(&neckPump, 32,24,A0,700),
    Chamber(&neckPump, 30,22,A2,700),
    Chamber(&facePump, 25,23,A3,180),
    Chamber(&facePump, 29,27,A4,300)
};

enum CHAMBER_INDEX {
    DOWN_CHAMBER   = 0,
    RIGHT_CHAMBER  = 1,
    LEFT_CHAMBER   = 2,
    EYE_CHAMBERS   = 3,
    MOUTH_CHAMBER  = 4
};

const int killPin = 39;


void setup() {
  Serial.begin(9600); 
  Serial.println("Softbot starting");
  neckPump.init();
  facePump.init();

  currentCommand = ' ';
  currentValue = 0;
  currentState = START_INPUT;


  int numOfChambers = sizeof(chambers) / sizeof(chambers[0]);
  for (int i = 0; i < numOfChambers; i++) {
     chambers[i].init();
     delay(10);
  }

  pinMode(killPin, INPUT);
}

void loop() {
    for (int i = 0; i < sizeof(chambers) / sizeof(chambers[0]); i++) {
        chambers[i].update();
    }
    // Kill switch
    if (digitalRead(killPin) == HIGH) {
        neckPump.stop();
        facePump.stop();
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
    } else {
        positionCounter++;
    }
}

void processCommand() {
    switch(currentCommand)  {
        case 'P': {
            neckPump.setSpeed(currentValue);
            break;
        }
        case 'S': {
            dispatchStop();
            neckPump.stop();
            break;
        }
        case 'E': {
            float inflation = (float)currentValue / 255.0;
            Serial.print("Eyes ");
            Serial.println(inflation);
            chambers[EYE_CHAMBERS].inflateTo(inflation, 0.95);
            break;
        }
        case 'M': {
            float inflation = (float)currentValue / 255.0;
            Serial.print("Mouth ");
            Serial.println(inflation);
            chambers[MOUTH_CHAMBER].inflateTo(inflation, 0.8);
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

    int maxPower = max(abs(currentPosition[0]), abs(currentPosition[1]));
    float speed = (float)maxPower / MAX_POSITION;
    //Serial.println("Update chambers");

    if (currentPosition[0] > 0 && currentPosition[0] > abs(currentPosition[1])) {
        left(speed);
    } else if (currentPosition[0] < 0 && abs(currentPosition[0]) > abs(currentPosition[1])) {
        right(speed);
    }
    else if (currentPosition[1] > 0  && currentPosition[1] > abs(currentPosition[0])) {
        down(speed);
    }
    else if (currentPosition[1] < 0) {
        up(speed);
    }
}

void left(float speed) {
    if (chambers[RIGHT_CHAMBER].isInflated()) {
        chambers[RIGHT_CHAMBER].deflate();
    } else {
        chambers[RIGHT_CHAMBER].stop();
        chambers[LEFT_CHAMBER].inflateMax(speed);
    }
}
void right(float speed) {
    if (chambers[LEFT_CHAMBER].isInflated()) {
        chambers[LEFT_CHAMBER].deflate();
    } else {
        chambers[LEFT_CHAMBER].stop();
        chambers[RIGHT_CHAMBER].inflateMax(speed);
    }

}
void up(float speed) {
    if (chambers[DOWN_CHAMBER].isInflated()) {
        chambers[DOWN_CHAMBER].deflate();
    } else {
        chambers[DOWN_CHAMBER].stop();
        chambers[LEFT_CHAMBER].inflateMax(speed);
        chambers[RIGHT_CHAMBER].inflateMax(speed);
    }
}
void down(float speed) {
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
        chambers[DOWN_CHAMBER].inflateMax(speed);
    }
}
