#include "chamber.h"

const int DEFLATE_INTERVAL_MS = 10;
const int INFLATED_THRESHOLD = 70;

Chamber::Chamber(
        char* name,
        PumpNg** pumps,
        int numOfPumps,
        int entryValve,
        int releaseValve,
        int pressureSensor,
        int minPressure,
        int maxPressure
    ) {
    _name = name;
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _minPressure = minPressure < INFLATED_THRESHOLD ? INFLATED_THRESHOLD : minPressure;
    _maxPressure = maxPressure;
    _destinationPressure = maxPressure;
    _pumps = pumps;
    _numOfPumps = numOfPumps;
}
Chamber::~Chamber() {

}

void Chamber::init() {
    pinMode(_releaseValve, OUTPUT);
    digitalWrite(_releaseValve, LOW); 

    if (_entryValve > 0) {
        pinMode(_entryValve, OUTPUT);
        digitalWrite(_entryValve, LOW);
    }

    _state = IDLE;
    _pressure = analogRead(_pressureSensor);
    _oscillating = false;
    _usingPump = false;

    Serial.print(_name);
    Serial.print(" Chamber initialzied - Initial Pressure: ");
    Serial.println(_pressure);

    Serial.print("Number of pumps: ");
    Serial.println(_numOfPumps);

    deflate();
    delay(2000);
    stop();
}

void Chamber::update() {
    // Blast Protection
    _pressure = analogRead(_pressureSensor);
    if (_state == INFLATING && _pressure > _destinationPressure) {
        if (_oscillating) {
            _destinationPressure = _oscillateMin;
            releasePump(); 
            deflate();
        } else {
            stop();
        }
    }
    else if (_state == DEFLATING && 
            (_pressure < _destinationPressure || _pressure < _minPressure)) {
        if (_oscillating) {
            _destinationPressure = _oscillateMax;
            inflate(1.0);
        } else {
            stop();
        }
    } else if (_state == IDLE && _minPressure > INFLATED_THRESHOLD &&  _pressure < _minPressure) {
        Serial.print("Inflating to min pressure ");
        Serial.println(_minPressure);
        _destinationPressure = _minPressure;
        inflate(0.8);
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
    if (_oscillating) {
        stop();
        _oscillating = false;
    }
    _destinationPressure = _minPressure + (float)(_maxPressure - _minPressure) * max;
    Serial.print(_name);
    Serial.print(": Change pressure from ");
    Serial.print(_pressure);
    Serial.print(" To ");
    Serial.println(_destinationPressure);
    if (_destinationPressure > _pressure) {
        inflate(speed);
    } else if (_destinationPressure < _pressure && _pressure > INFLATED_THRESHOLD) {
        deflate();
    }
}

void Chamber::inflate(float speed) {
    Serial.print(_name);
    Serial.println("::Inflate()");
    if (_pressure < _destinationPressure) {
        if (_state != INFLATING) {
            _state = INFLATING;
            digitalWrite(_releaseValve, LOW);
            if (_entryValve > 0) {
                digitalWrite(_entryValve, HIGH);
            }
            grabPump();
        }
        for (int i = 0; i < _numOfPumps; i++) {
            PumpNg* pump = _pumps[i];
            if (pump->getSpeed() < speed) {
                pump->setSpeed(speed);
            }
        }
    } 
}

void Chamber::deflate() {
    if (_state != DEFLATING) {
        Serial.print(_name);
        Serial.println("::Deflate()");
        _state = DEFLATING;
        //_lastDeflateToggle = millis();
        //_deflateToggle = LOW;
        if (_entryValve > 0) {
            digitalWrite(_entryValve, LOW);
        }
        digitalWrite(_releaseValve, HIGH);
        for (int i = 0; i < _numOfPumps; i++) {
            PumpNg* pump = _pumps[i];
            pump->stop();
        }
    }
}

void Chamber::deflateMax() {
    _destinationPressure = _minPressure;
    deflate();
}

void Chamber::stop() {
    if (!_state == IDLE) {
        Serial.print(_name);
        Serial.print(" Stop ");
        Serial.println(_pressure);
        if (_entryValve > 0) {
            digitalWrite(_entryValve, LOW);
        }
        digitalWrite(_releaseValve, LOW);
        releasePump();
        _state = IDLE;
    }
}

void Chamber::oscillate(float min, float max) {
    _oscillateMin = _minPressure + (float)(_maxPressure - _minPressure) * min;
    _oscillateMax = _minPressure + (float)(_maxPressure - _minPressure) * max;
    _oscillating = true;

    Serial.print("Eyes Oscillate ");
    Serial.print(_oscillateMin);
    Serial.print("/");
    Serial.println(_oscillateMax);

    _destinationPressure = _oscillateMax;
    inflate(1.0);
}

void Chamber::endOscillation() {
    _oscillating = false;
}

int Chamber::getPressure() {
    return _pressure;
}

bool Chamber::isInflated() {
    return (_pressure >= INFLATED_THRESHOLD);
}

void Chamber::grabPump() {
    if (!_usingPump) {
        for (int i = 0; i < _numOfPumps; i++) {
            PumpNg* pump = _pumps[i];
            pump->grab();
        }
        _usingPump = true;
    }
}

void Chamber::releasePump() {
    if (_usingPump) {
        for (int i = 0; i < _numOfPumps; i++) {
            PumpNg* pump = _pumps[i];
            pump->release();
        }
        _usingPump = false;
    }
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}
