#include "common.h"
#include "chamber.h"
#include "pumpng.h"
#include "arm.h"
#include "logger.h"

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
String VALID_COMMANDS = "XPSEMCWRL";

PumpNg pump(22,21,23,25);

Chamber chambers[4] = {
    Chamber("LeftArm",
            new Valve(20,18,38,25),
            new Valve(20,19,38,25),
            A0,
            120, 
            200
    ),
    Chamber("RightArm",
            new Valve(17,15,37,25),
            new Valve(17,16,37,25),
            A15,
            120, 
            200,
            0.305
    ),
    Chamber("LeftNeck",
            new Valve(2,26,5,25),
            new Valve(2,3,5,25),
            A16, 
            80, 
            200,
            0.226
    ),
    Chamber("RightNeck",
            new Valve(6,8,9,25),
            new Valve(6,7,9,25),
            A20,
            80,
            200,
            0.3
    )
    // //Chamber("Right", 32,24,A0, 0, 700),
  //  Chamber("Down",  26,28,A1, 0, 700),
  //  Chamber("Eyes", 25,23,A3, 0, 200),
  //  Chamber("Mouth", 29,27,A4, 0, 520), // 190, 290)
   // Chamber("Cheeks", 31 ,33, A5, 0, 200) 
};

Arm* rightArmSensor = new Arm(1, 10, 20);
Arm* leftArmSensor = new Arm(2, 28, 40);

enum CHAMBER_INDEX {
    LEFT_ARM_CHAMBER  = 0,
    RIGHT_ARM_CHAMBER  = 1,
    LEFT_CHAMBER  = 2,
    RIGHT_CHAMBER   = 3,
    DOWN_CHAMBER   = 4,
    EYE_CHAMBERS   = 5,
    MOUTH_CHAMBER  = 6,
    CHEEK_CHAMBERS = 7
};

const int killPin = 39;
int numOfChambers = sizeof(chambers) / sizeof(chambers[0]);


void setup() {
  Serial.begin(9600); 

  Logger::Write("Softbot starting");

  analogWriteResolution(10);

  pump.init();
  //pump.inflate();

  for (int i = 0; i < MAX_VALUES;i++) {
    currentValue[i] = 0;
  }

  currentCommand = ' ';
  currentState = START_INPUT;


  for (int i = 0; i < numOfChambers; i++) {
     chambers[i].init();
     delay(10);
  }
  rightArmSensor->init();
  //leftArmSensor->init();


  //getChamber(RIGHT_CHAMBER)->oscillate(241,245);

  pinMode(killPin, INPUT);
}

Chamber* getChamber(int id) {
    if (id <= numOfChambers -1) {
        return &chambers[id];
    } else {
        return NULL;
    }
}

void loop() {
    unsigned long now = millis();
    for (unsigned int i = 0; i < sizeof(chambers) / sizeof(chambers[0]); i++) {
        chambers[i].update(now);
    }
    rightArmSensor->update(now);
    //leftArmSensor->update(now);

    // Kill switch
    /*
    if (digitalRead(killPin) == HIGH) {
        pump.stop();
    }*/

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
          //Logger::Write("Start command");
        }
    }
    else if (currentState == COMMAND_INPUT) {
        char input = Serial.read();
        if(VALID_COMMANDS.indexOf(input)!= -1) {
              currentCommand = input;
          //    Logger::Printf("Command is %c", input);
              currentState = LENGTH_INPUT;
        } else {
            Logger::Write("WARNING INVALID COMMAND");
            currentState = START_INPUT;
        }
    }
    else if (currentState == VALUE_INPUT) {
       if (valueCounter > MAX_VALUES) {
         Logger::Write("WARNING VALUE COUNTER EXCEEDED MAX");
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
            Logger::Write("WARNING RECEIVED LENGTH LONGER THAN MAX");
            currentState = START_INPUT;
        }
        else if (currentLength > 0) {
            currentState = VALUE_INPUT;
         //   Logger::Printf("Length of command: %d", currentLength);

        } else {
            processCommand();
            currentState = START_INPUT;
        }
        valueCounter = 0;
     } 
}

void processCommand() {
    //Logger::Printf("Processing command %c", currentCommand);
    switch(currentCommand)  {
        case 'X': {
            updateChambers(currentValue[0] - 50, currentValue[1] - 50);
            break;
        }
        case 'P': {
            pump.setSpeed((float)currentValue[0] / 255.0);
            break;
        }
        case 'S': {
            Logger::Write("Stop Command");
            dispatchStop();
           // pump.stop();
            break;
        }
        case 'E': {
            Chamber* eyes = getChamber(EYE_CHAMBERS);
            if (eyes) {
                if (currentLength == 2) {
                    float inflationMin = (float)currentValue[0] / 255.0;
                    float inflationMax = (float)currentValue[1] / 255.0;
                    eyes->oscillate(inflationMin,inflationMax);
                } else {
                    float inflation = (float)currentValue[0] / 255.0;

                    eyes->inflateTo(inflation, 0.95);
                }
            }
            break;
        }
        case 'M': {
            Chamber* mouth = getChamber(MOUTH_CHAMBER);
            if (mouth) {
                if (currentLength == 2) {
                    float inflationMin = (float)currentValue[0] / 255.0;
                    float inflationMax = (float)currentValue[1] / 255.0;
                    mouth->oscillate(inflationMin,inflationMax);
                    
                } 
                else {
                    float inflation = (float)currentValue[0] / 255.0;
                    mouth->inflateTo(inflation, 0.95);
                }
           }
           break;
        }
        case 'C': {
            Chamber* cheeks = getChamber(CHEEK_CHAMBERS);
            if (cheeks) {
                if (currentLength == 2) {
                    float inflationMin = (float)currentValue[0] / 255.0;
                    float inflationMax = (float)currentValue[1] / 255.0;
                    cheeks->oscillate(inflationMin,inflationMax);
                } else {
                    float inflation = (float)currentValue[0] / 255.0;
                    cheeks->inflateTo(inflation, 0.95);
                }
            }
            break;
        }
        case 'R': {
            Chamber* rightArm = getChamber(RIGHT_CHAMBER);
            if (rightArm){ 
                if (currentLength == 2) {
                    float inflationMin = (float)currentValue[0] / 255.0;
                    float inflationMax = (float)currentValue[1] / 255.0;
                    rightArm->oscillate(inflationMin,inflationMax);

                    /*
                    float inflation = (float)currentValue[0] / 255.0;
                    float speed = (float)currentValue[1] / 255.0;
                    rightArm->inflateTo(inflation, speed);*/

                } else {
                    float inflation = (float)currentValue[0] / 255.0;
                    rightArm->inflateTo(inflation, 1.0);
                }
            }
            break;
        }
        case 'L': {
            Chamber* leftArm = getChamber(LEFT_ARM_CHAMBER);
            if (leftArm){ 
                int value = (int)currentValue[0];
                if (value > 100) {
                    leftArm->inflateMax(1.0);
                } else if (value > 0) {
                    leftArm->stop();
                } else {
                    leftArm->deflateMax(1.0);
                }
            }
            break;
        }
        case 'W': {
            int pin = (int)currentValue[0];
            int value = (int)currentValue[1] == 0 ? LOW : HIGH;
            digitalWrite(pin, value);
            Logger::Printf("Write %d to pin %d", pin, value);
            break;
        }
        default: {
            break;
        }
     }
}


void dispatchStop() {
    for (int i = 0; i < numOfChambers; i++) { // Just neck
        chambers[i].stop();
    }
}

void updateChambers(int x, int y) {

    Logger::Printf("Movement (%d,%d)", x,y);

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
    Logger::Printf("Go left at %f", speed);
    Chamber* leftNeck = getChamber(LEFT_CHAMBER);
    Chamber* rightNeck = getChamber(RIGHT_CHAMBER);

    if (rightNeck && rightNeck->isInflated()) {
        rightNeck->deflateMax();
    }
    else if (leftNeck) {
        leftNeck->inflateMax(1.0);
    }
    
}
void right(float speed) {
    Chamber* rightNeck = getChamber(RIGHT_CHAMBER);
    Chamber* leftNeck = getChamber(LEFT_CHAMBER);

    if (leftNeck && leftNeck->isInflated()) {
        leftNeck->deflateMax();
    }
    else if (rightNeck) {
        rightNeck->inflateMax(1.0);
    }
}
void down(float speed) {
    Chamber* downNeck = getChamber(DOWN_CHAMBER);
    Chamber* rightNeck = getChamber(RIGHT_CHAMBER);
    Chamber* leftNeck = getChamber(LEFT_CHAMBER);
    if (downNeck && downNeck->isInflated()) {
        downNeck->deflateMax();
    }
    if (rightNeck && leftNeck) {
        leftNeck->inflateMax(speed);
        rightNeck->inflateMax(speed);
    }
}
void up(float speed) {
    /*
    if (chambers[LEFT_CHAMBER].getState() == IDLE && chambers[RIGHT_CHAMBER].getState() == IDLE) {
        chambers[DOWN_CHAMBER].inflateMax(speed);
    }*/
    Chamber* downNeck = getChamber(DOWN_CHAMBER);
    if (downNeck) {
        downNeck->inflateMax(speed);
    }
}
