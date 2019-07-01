#include "common.h"
#include "chamber.h"
#include "pumpng.h"
#include "arm.h"
#include "logger.h"
#include "processor.h"

const int MAX_POSITION = 50;

PumpNg pump(42,55,17,25); // Pump
//Chamber* chambers[NUM_OF_CHAMBERS];

Chamber* chambers[NUM_OF_CHAMBERS] = {
    new Chamber("LeftNeck",
            new Valve(4,9,5,25), // CHAMBER A-1
            new Valve(4,26,5,25), // CHAMBER A-2
            &pump,
            A10, 
            70, 
            210,
            1.0
           // 0.220
    ),
    new Chamber("RightNeck",
            new Valve(27,28,6,25), // CHAMBER B-1
            new Valve(27,31,6,25), // CHAMBER B-2
            &pump,
            A20,
            90,
            200,
            1.0
         //   0.29
    ),
    new Chamber("DownNeck",
            new Valve(32,40,2,25), // CHAMBER C-1
            new Valve(32,47,2,25), // CHAMBER C-2
            &pump,
            A19,
            90,
            200,
            1.0
         //   0.29
    ),
    new Chamber("Eyes",
            new Valve(48,23,7,25), // CHAMBER D-1
            new Valve(48,22,7,25), // CHAMBER D-2
            &pump,
            A18,
            90,
            120,
            1.0 
            //   0.29
    ),
    new Chamber("Cheeks",
            new Valve(21,20,8,25), // CHAMBER E-1
            new Valve(21,19,8,25), // CHAMBER E-2
            &pump,
            A17,
            85,
            102,
            1.0,
            1000
             //   0.29
    ),
    new Chamber("Arms",
            new Valve(18,16,29,25), // CHAMBER F-1
            new Valve(18,15,29,25), // CHAMBER F-2
            &pump,
            A16,
            120, 
            175,
            0.315,
            5000
    ),
    new Chamber("Mouth",
            new Valve(45,44,3,25), // CHAMBER H-1
            new Valve(45,43,3,25), // CHAMBER H-2
            &pump,
            A14,
            85, 
            110,
            1.0
    )
};
Arm rightArmSensor = Arm(2, 53, 17, -8);
Arm leftArmSensor =  Arm(1, 51, 20, -8);

Processor* processor = new Processor(chambers, &pump);

void setup() {
  Serial.begin(9600); 

  //Logger::Write("Softbot starting");

  analogWriteResolution(10);

  pump.init();
  //pump.inflate();


  for (int i = 0; i < NUM_OF_CHAMBERS; i++) {
     chambers[i]->init();
  }

  rightArmSensor.init();
  leftArmSensor.init();


  //etChamber(RIGHT_CHAMBER)->oscillate(241,245);

  //pinMode(killPin, INPUT);
}


void loop() {
    unsigned long now = millis();
    for (unsigned int i = 0; i < NUM_OF_CHAMBERS; i++) {
       chambers[i]->update(now);
    }
    rightArmSensor.update(now);
    leftArmSensor.update(now);

    // Kill switch
    /*
    if (digitalRead(killPin) == HIGH) {
        pump.stop();
    }*/

    while (Serial.available() > 0) {
        byte input = Serial.read();
        processor->processByte(input);
    }

}

/*
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
}*/

/*
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
    if (chambers[LEFT_CHAMBER].getState() == IDLE && chambers[RIGHT_CHAMBER].getState() == IDLE) {
        chambers[DOWN_CHAMBER].inflateMax(speed);
    }
    Chamber* downNeck = getChamber(DOWN_NECK_CHAMBER);
    if (downNeck) {
        downNeck->inflateMax(speed);
    }
} */
