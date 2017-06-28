#include "chamber.h"

const int MIN_CHAMBER_PRESSURE = 60;
const int DEFLATE_INTERVAL_MS = 5;

Chamber::Chamber(Pump* pump, int entryValve, int releaseValve, int pressureSensor, int maxPressure) {
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _maxPressure = maxPressure;

    _pump = pump;
}
Chamber::~Chamber() {

}

void Chamber::init() {
    pinMode(_entryValve, OUTPUT);
    pinMode(_releaseValve, OUTPUT);
    digitalWrite(_entryValve, LOW);
    digitalWrite(_releaseValve, LOW); 

    _state = IDLE;

    Serial.println("Chamber initialzied");
}

void Chamber::update() {
    // Blast Protection
    _pressure = analogRead(_pressureSensor);
    if (_pressure > _maxPressure && _state == INFLATING) {
        stop();
    } 

    if (_state == DEFLATING) {
        unsigned long time = millis();
        if (time - _lastDeflateToggle >= DEFLATE_INTERVAL_MS) {
            _deflateToggle = !_deflateToggle;
            digitalWrite(_releaseValve, _deflateToggle);
            _lastDeflateToggle = time;
        }
    } 
    //digitalWrite(_entryValve, HIGH);
}

void Chamber::inflate() {
    Serial.println(_pressure);
    if (_pressure <= _maxPressure) {
        Serial.println("Inflating");
        Serial.println(_entryValve);
        digitalWrite(_releaseValve, LOW);
        digitalWrite(_entryValve, HIGH);
        //_pump->inflate();
        //

        _state = INFLATING;
    }
}

void Chamber::deflate() {
   // _pump->stop();
   //
   
     Serial.println("deflating");
    Serial.println(_releaseValve);
    _state = DEFLATING;
    _lastDeflateToggle = millis();
    _deflateToggle = LOW;
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
    Serial.println("Is inflated?");
    Serial.println(_pressure);
    return (_pressure >= MIN_CHAMBER_PRESSURE);
}
