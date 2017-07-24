#include "common.h"
#include "chamber.h"
#include "pump.h"


enum INPUT_STATE {
  START_INPUT = 0,
  COMMAND_INPUT = 1,
  VALUE_INPUT = 2,
  LENGTH_INPUT = 3,
  POSITION_INPUT = 4,
};

const int MAX_POSITION = 50;
const int MAX_VALUES = 4;

char currentCommand;
byte  currentValue[MAX_VALUES];
int   valueCounter = 0;
byte   currentLength = 0;

INPUT_STATE currentState;
const char* VALID_COMMANDS = "XPDUSRLEM";

Pump neckPump(7,40);
Pump facePump(6,41);

Chamber chambers[5] = {
    Chamber("Down", &neckPump, 26,28,A1, 0, 700),
    Chamber("Right", &neckPump, 32,24,A0, 0, 700),
    Chamber("Left", &neckPump, 30,22,A2, 0, 700),
    Chamber("Eye", &facePump, 25,23,A3, 0, 180),
    Chamber("Mouth", &facePump, 29,27,A4, 0, 290) // 190, 290)
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

  for (int i = 0; i < MAX_VALUES;i++) {
    currentValue[i] = 0;
  }

  currentCommand = ' ';
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

    while (Serial.available() > 0) {
        processByte();
    }

}

void processByte() {
/*
    Serial.print("Byte at state ");
    Serial.println(currentState); */

    if (currentState == START_INPUT) {
        char input = Serial.read();
        if (input == '>') {
          currentState = COMMAND_INPUT;
        }
    }
    else if (currentState == COMMAND_INPUT) {
        char input = Serial.read();
        if(strchr(VALID_COMMANDS,input) != -1) {
              currentCommand = input;
              currentState = LENGTH_INPUT;
        } else {
            Serial.println("WARNING INVALID COMMAND");
            currentState = START_INPUT;
        }
    }
    else if (currentState == VALUE_INPUT) {
       if (valueCounter > MAX_VALUES) {
         Serial.println("WARNING VALUE COUNTER EXCEEDED MAX");
         currentState = START_INPUT;
        } else {
            currentValue[valueCounter] = Serial.read();
            valueCounter++;
            if (valueCounter == currentLength) {
                 processCommand();
                 currentState = START_INPUT;
            }
       }
    }
    else if (currentState == LENGTH_INPUT) {
        currentLength = Serial.read();
        if (currentLength > MAX_VALUES) {
            Serial.println("WARNING RECEIVED LENGTH LONGER THAN MAX");
            currentState = START_INPUT;
        }
        else if (currentLength > 0) {
            currentState = VALUE_INPUT;
        } else {
            processCommand();
            currentState = START_INPUT;
        }
        valueCounter = 0;
     } 
}

void processCommand() {
    switch(currentCommand)  {
        case 'X': {
            updateChambers(currentValue[0] - 50, currentValue[1] - 50);
            break;
        }
        case 'P': {
            neckPump.setSpeed(currentValue[0]);
            break;
        }
        case 'S': {
            Serial.println("Stop Command");
            dispatchStop();
            neckPump.stop();
            break;
        }
        case 'E': {
            float inflation = (float)currentValue[0] / 255.0;
            Serial.print("Eyes ");
            Serial.println(inflation);
            chambers[EYE_CHAMBERS].inflateTo(inflation, 0.95);
            break;
        }
        case 'M': {
            float inflation = (float)currentValue[0] / 255.0;
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
    for (int i = 0; i < 3; i++) { // Just neck
        chambers[i].stop();
    }
}

void updateChambers(int x, int y) {

/*
    Serial.print("Movement ");
    Serial.print(x);
    Serial.print(",");
    Serial.println(y); */

    int maxPower = max(abs(x), abs(y));
    float speed = (float)maxPower / MAX_POSITION;
    //Serial.println("Update chambers");

    if (x > 0 && x > abs(y)) {
        left(speed);
    } else if (x < 0 && abs(x) > abs(y)) {
        right(speed);
    }
    else if (y > 0  && y > abs(x)) {
        down(speed);
    }
    else if (y < 0) {
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
