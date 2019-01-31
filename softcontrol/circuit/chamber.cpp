#include "chamber.h"
#include "logger.h"

const int DEFLATE_INTERVAL_MS = 10;
const int INFLATED_THRESHOLD = 70;

Chamber::Chamber(
        const char* name,
        Valve* entryValve,
        Valve* releaseValve,
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
}
Chamber::~Chamber() {

}

void Chamber::init() {
    if (_entryValve) {
        _entryValve->init();
        _entryValve->close();
    }

    if (_releaseValve) {
        _releaseValve->init();
        _entryValve->close();
    }

    _state = IDLE;
    if (_pressureSensor != -1) {
        _pressure = analogRead(_pressureSensor);
    }
    _oscillating = false;

    Logger::Printf("%s chamber initialized - Initial pressure: %d",_name, _pressure);

    deflate();
    delay(2000);
    stop();
}

void Chamber::update() {
    // Blast Protection
    if (_pressureSensor != -1) {
        _pressure = analogRead(_pressureSensor);
        if (_state == INFLATING && _pressure > _destinationPressure) {
            if (_oscillating) {
                _destinationPressure = _oscillateMin;
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
            Logger::Printf("%s Inflating to min pressure %d", _name, _minPressure);
            _destinationPressure = _minPressure;
            inflate(0.8);
        }
    }

}

void Chamber::inflateMax(float speed) {
   // Logger::Printf("%s InflatMax %f",_name, speed );
    _destinationPressure = _maxPressure;
    inflate(speed);
}

void Chamber::inflateTo(float max, float speed) {
    if (_oscillating) {
        stop();
        _oscillating = false;
    }
    _destinationPressure = _minPressure + (float)(_maxPressure - _minPressure) * max;
    Logger::Printf("%s inflating from %d to %d", _name,  _pressure, _destinationPressure);
    if (_destinationPressure > _pressure) {
        inflate(speed);
    } else if (_destinationPressure < _pressure && _pressure > INFLATED_THRESHOLD) {
        deflate();
    }
}

void Chamber::inflate(float speed) {
    if (_pressure < _destinationPressure) {
        Logger::Printf("%s inflating at speed %f", _name, speed);
        if (_state != INFLATING) {
            _state = INFLATING;
            // Close before open?
            if (_releaseValve)  {
                _releaseValve->close();
            }
            
            if (_entryValve) {
                _entryValve->open();
            }
        }
    } 
}

void Chamber::deflate() {
    if (_state != DEFLATING) {
        Logger::Printf("%s Deflating", _name);
        _state = DEFLATING;
        // Close before open because of the shared pins
        
        if (_entryValve) {
            _entryValve->close();
        }
        if (_releaseValve) {
            _releaseValve->open();
        }
    }
}

void Chamber::deflateMax() {
    _destinationPressure = _minPressure;
    deflate();
}

void Chamber::stop() {
    if (!_state == IDLE) {
        Logger::Printf("%s stopping at %d", _name, _pressure);
        if (_entryValve) {
            _entryValve->close();
        }
        if (_releaseValve) {
            _releaseValve->close();
        }
        _state = IDLE;
    }
}

void Chamber::oscillate(float min, float max) {
    _oscillateMin = _minPressure + (float)(_maxPressure - _minPressure) * min;
    _oscillateMax = _minPressure + (float)(_maxPressure - _minPressure) * max;
    _oscillating = true;

    Logger::Printf("%s oscillating with %d/%d", _name, _oscillateMin, _oscillateMax);

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
    //return (_pressure >= INFLATED_THRESHOLD);
    return true;
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}
