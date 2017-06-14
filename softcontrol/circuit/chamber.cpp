#include "chamber.h"

const int MIN_CHAMBER_PRESSURE = 60;

Chamber::Chamber(int entryValve, int releaseValve, int pressureSensor, int maxPressure) {
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _maxPressure = maxPressure;

    _state = IDLE;
}
Chamber::~Chamber() {

}

void Chamber::init() {
    pinMode(_entryValve, OUTPUT);
    pinMode(_releaseValve, OUTPUT);
    digitalWrite(_entryValve, LOW);
    digitalWrite(_releaseValve, LOW); 

    Serial.println("Chamber initialzied");
}

void Chamber::update() {
    // Blast Protection
    
    _pressure = analogRead(_pressureSensor);
    if (_pressure > _maxPressure && _state == INFLATING) {
        stop();
    } 
    //digitalWrite(_entryValve, HIGH);
}

void Chamber::inflate() {
    if (_pressure <= _maxPressure) {
        digitalWrite(_releaseValve, LOW);
        digitalWrite(_entryValve, HIGH);
        //_pump->inflate();
        //

        _state = INFLATING;
    }
}

void Chamber::deflate() {
    digitalWrite(_releaseValve, HIGH);
   // _pump->stop();
    //Serial.println("deflate");
    _state = DEFLATING;
}

void Chamber::stop() {
    digitalWrite(_entryValve, LOW);
    digitalWrite(_releaseValve, LOW);
  //  _pump->stop();
    _state = IDLE;
}

int Chamber::getPressure() {
    return _pressure;
}

bool Chamber::isInflated() {
    return (_pressure >= MIN_CHAMBER_PRESSURE);
}
