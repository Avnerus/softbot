#include "chamber.h"

const int DEFLATE_INTERVAL_MS = 10;
const int INFLATED_THRESHOLD = 100;

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
    _pressure = analogRead(_pressureSensor);
    Serial.print("Chamber initialzied - Initial Pressure: ");
    Serial.println(_pressure);

    deflate();
    delay(2000);
    stop();
}

void Chamber::update() {
    // Blast Protection
    _pressure = analogRead(_pressureSensor);
    if (_pressure > _maxPressure) {
        stop();
    }
    /*

    if (_state == DEFLATING) {
        unsigned long time = millis();
        if (time - _lastDeflateToggle >= DEFLATE_INTERVAL_MS) {
            _deflateToggle = !_deflateToggle;
            digitalWrite(_releaseValve, _deflateToggle);
            _lastDeflateToggle = time;
        }
    } 
    */
    //digitalWrite(_entryValve, HIGH);*/
}

void Chamber::inflate() {
    if (_state != INFLATING && _pressure < _maxPressure) {
        _state = INFLATING;
        Serial.println(_entryValve);
        digitalWrite(_releaseValve, LOW);
        digitalWrite(_entryValve, HIGH);
    }
}

void Chamber::deflate() {
    if (_state != DEFLATING) {
        Serial.println("Deflating");
        _state = DEFLATING;
        _lastDeflateToggle = millis();
        _deflateToggle = LOW;
        digitalWrite(_entryValve, LOW);
        digitalWrite(_releaseValve, HIGH);
    }
}

void Chamber::stop() {
    if (!_state == IDLE) {
        digitalWrite(_entryValve, LOW);
        digitalWrite(_releaseValve, LOW);
        _state = IDLE;
    }
}

int Chamber::getPressure() {
    return _pressure;
}

bool Chamber::isInflated() {
    Serial.println(_pressure);
    return (_pressure >= INFLATED_THRESHOLD);
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}
