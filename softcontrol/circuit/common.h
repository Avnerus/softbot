#ifndef COMMON_H
#define COMMON_H

#define NUM_OF_CHAMBERS 7

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


struct Orientation {
    int x;
    int y;
};


#endif
