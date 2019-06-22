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
String VALID_COMMANDS = "XPSEMCWRLH";

PumpNg pump(42,55,17,25); // Pump

Chamber chambers[7] = {
    Chamber("LeftNeck",
            new Valve(4,9,5,25), // CHAMBER A-1
            new Valve(4,26,5,25), // CHAMBER A-2
            &pump,
            A10, 
            90, 
            230,
            1.0
           // 0.220
    ),
    Chamber("RightNeck",
            new Valve(27,28,6,25), // CHAMBER B-1
            new Valve(27,31,6,25), // CHAMBER B-2
            &pump,
            A20,
            90,
            230,
            1.0
         //   0.29
    ),
    Chamber("DownNeck",
            new Valve(32,40,2,25), // CHAMBER C-1
            new Valve(32,47,2,25), // CHAMBER C-2
            &pump,
            A19,
            90,
            200,
            1.0
         //   0.29
    ),
    Chamber("Eyes",
            new Valve(48,23,7,25), // CHAMBER D-1
            new Valve(48,22,7,25), // CHAMBER D-2
            &pump,
            A18,
            85,
            120,
            1.0 
             //   0.29
    ),
    Chamber("Cheeks",
            new Valve(21,20,8,25), // CHAMBER E-1
            new Valve(21,19,8,25), // CHAMBER E-2
            &pump,
            A17,
            80,
            100,
            1.0
            
             //   0.29
    ),
    Chamber("Arms",
            new Valve(18,16,29,25), // CHAMBER F-1
            new Valve(18,15,29,25), // CHAMBER F-2
            &pump,
            A16,
            110, 
            200,
            1.0
    ),
    Chamber("Mouth",
            new Valve(45,44,3,25), // CHAMBER H-1
            new Valve(45,43,3,25), // CHAMBER H-2
            &pump,
            A14,
            85, 
            105,
            1.0
    )
        /*
        Chamber("LeftArm",
                new Valve(20,18,38,25),
                new Valve(20,19,38,25),
                &pump,
                A0,
                120, 
                200
        ),
        Chamber("RightArm",
                new Valve(17,15,37,25),
                new Valve(17,16,37,25),
                &pump,
                A15,
                100, 
                200
        ),*/
};

Arm* rightArmSensor = new Arm(1, 53, 25, -10);
Arm* leftArmSensor = new Arm(2, 52, 300, -200);

enum CHAMBER_INDEX {
    LEFT_NECK_CHAMBER  = 0,
    RIGHT_NECK_CHAMBER   = 1 ,
    DOWN_NECK_CHAMBER   = 2,
    EYE_CHAMBERS   = 3,
    CHEEK_CHAMBERS = 4,
    ARMS_CHAMBRS = 5,
    MOUTH_CHAMBER  = 6
};

enum CHAMBER_STATES {
    STOP_STATE = 0,
    INFLATE_STATE = 1,
    DEFLATE_STATE = 2
};

const int killPin = 39;
int numOfChambers = sizeof(chambers) / sizeof(chambers[0]);


void setup() {
  Serial.begin(9600); 

  //Logger::Write("Softbot starting");

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
  }
  rightArmSensor->init();
  leftArmSensor->init();


  //getChamber(RIGHT_CHAMBER)->oscillate(241,245);

  //pinMode(killPin, INPUT);
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
       // chambers[i].update(now);
    }
    rightArmSensor->update(now);
    leftArmSensor->update(now);

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
            int chamberIndex = (int)currentValue[0];
            Chamber* chamber = getChamber(chamberIndex);
            if (chamber) {
                Logger::Printf("Stop chamber ",chamber->getName(), chamberIndex);
                chamber->stop();
            } else {
                Logger::Printf("No such chamber ", chamberIndex);
            }
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
        case 'K': {
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
            Chamber* rightArm = getChamber(ARMS_CHAMBRS);
            if (rightArm){ 
                int value = (int)currentValue[0];
                rightArm->inflateTo((float)value / 255.0f, 1.0);
            }
            break;
        }
        case 'L': {
            Chamber* leftArm = getChamber(ARMS_CHAMBRS);
            if (leftArm){ 
                int value = (int)currentValue[0];
                leftArm->inflateTo((float)value / 255.0f, 1.0);
            }
            break;
        }
        case 'W': {
            int pin = (int)currentValue[0];
            int value = (int)currentValue[1] == 0 ? LOW : HIGH;
            digitalWrite(pin, value);
            Logger::Printf("Write ", value, " to pin ", pin);
            break;
        }
        case 'H': {
            int chamberIndex = (int)currentValue[0];
            int chamberState = (int)currentValue[1];
            Chamber* chamber = getChamber(chamberIndex);
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
            int chamberIndex = (int)currentValue[0];
            int value = (int)currentValue[1];
            float inflate = (float)value / 255.0f;
            Chamber* chamber = getChamber(chamberIndex);
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


void dispatchStop() {
    for (int i = 0; i < numOfChambers; i++) { // Just neck
        chambers[i].stop();
    }
}

void updateChambers(int x, int y) {

    //Logger::Printf("Movement (%d,%d)", x,y);

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
   // Logger::Printf("Go left at %f", speed);
    Chamber* leftNeck = getChamber(LEFT_NECK_CHAMBER);
    Chamber* rightNeck = getChamber(RIGHT_NECK_CHAMBER);

    if (rightNeck && rightNeck->isInflated()) {
        rightNeck->deflateMax();
    }
    else if (leftNeck) {
        leftNeck->inflateMax(1.0);
    }
    
}
void right(float speed) {
    Chamber* rightNeck = getChamber(RIGHT_NECK_CHAMBER);
    Chamber* leftNeck = getChamber(LEFT_NECK_CHAMBER);

    if (leftNeck && leftNeck->isInflated()) {
        leftNeck->deflateMax();
    }
    else if (rightNeck) {
        rightNeck->inflateMax(1.0);
    }
}
void down(float speed) {
    Chamber* downNeck = getChamber(DOWN_NECK_CHAMBER);
    Chamber* rightNeck = getChamber(RIGHT_NECK_CHAMBER);
    Chamber* leftNeck = getChamber(LEFT_NECK_CHAMBER);
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
    Chamber* downNeck = getChamber(DOWN_NECK_CHAMBER);
    if (downNeck) {
        downNeck->inflateMax(speed);
    }
}
