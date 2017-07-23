#include "chamber.h"

const int DEFLATE_INTERVAL_MS = 10;
const int INFLATED_THRESHOLD = 65;

Chamber::Chamber(Pump* pump, int entryValve, int releaseValve, int pressureSensor, int maxPressure) {
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _maxPressure = maxPressure;
    _destinationPressure = maxPressure;

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
    if ((_state == INFLATING && _pressure > _destinationPressure) || 
        (_state == DEFLATING && _pressure < INFLATED_THRESHOLD)) {
        Serial.print("Stop!!! ");
        Serial.println(_pressure);

        stop();
    }

    /*

    // If I'm deflating I have the right to stop the pump
    if (_state == DEFLATING && _pump->getMotorSpeed() > 0) {
        _pump->stop();
    }*/

    /*

    Interval deflation

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

void Chamber::inflateMax(float speed) {
    _destinationPressure = _maxPressure;
    inflate(speed);
}

void Chamber::inflateTo(float max, float speed) {
    _destinationPressure = (float)_maxPressure * max;
    Serial.println(_destinationPressure);
    Serial.println(_pressure);
    if (_destinationPressure > _pressure) {
        inflate(speed);
    } else if (_destinationPressure < _pressure && _pressure > INFLATED_THRESHOLD) {
        deflate();
    }
}

void Chamber::inflate(float speed) {
    if (_pressure < _destinationPressure) {

        if (_pump->getSpeed() < speed) {
            _pump->setSpeed(speed);
        }
        if (_state != INFLATING) {
            _state = INFLATING;
            digitalWrite(_releaseValve, LOW);
            digitalWrite(_entryValve, HIGH);
        }
    } 
}

void Chamber::deflate() {
    Serial.println("Deflating");
    if (_state != DEFLATING) {
        _state = DEFLATING;
        _lastDeflateToggle = millis();
        _deflateToggle = LOW;
        digitalWrite(_entryValve, LOW);
        digitalWrite(_releaseValve, HIGH);
    }
}

void Chamber::stop() {
    if (!_state == IDLE) {
        Serial.println("Stop");
        digitalWrite(_entryValve, LOW);
        digitalWrite(_releaseValve, LOW);
        _pump->stop();
        _state = IDLE;
    }
}

int Chamber::getPressure() {
    return _pressure;
}

bool Chamber::isInflated() {
    return (_pressure >= INFLATED_THRESHOLD);
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}
