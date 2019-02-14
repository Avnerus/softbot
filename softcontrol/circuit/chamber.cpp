#include "chamber.h"
#include "logger.h"

const int DEFLATE_INTERVAL_MS = 10;
const int PRESSURE_SENSE_INTERVAL = 1000;

Chamber::Chamber(
        const char name[10],
        Valve* entryValve,
        Valve* releaseValve,
        int  pressureSensor,
        uint16_t  minPressure,
        uint16_t  maxPressure
    ) {
    strcpy(_name, name);
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _minPressure = minPressure;
    _maxPressure = maxPressure;
    _destinationPressure = 0;
    _basePressure = 0;
    _lastPressureSense = 0;
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
    _oscillating = false;

    Logger::Printf("%s chamber initialized - Initial pressure: %d",_name, _pressure);

    deflateMax();
    delay(2000);
    _pressure = _basePressure = readPressure();
    stop();
}

void Chamber::update(unsigned long now) {
    // Blast Protection
    if (_pressureSensor != -1) {
        //_pressure = max(readPressure() - _basePressure,0);
        _pressure = readPressure();
        if (now - _lastPressureSense >= PRESSURE_SENSE_INTERVAL) {
            Serial.print(">SP");
            Serial.write(_name, 10);
            Serial.write((byte*)&_pressure,2);
            Serial.print("<");
            _lastPressureSense = now;
        }
        if (_state == INFLATING && _pressure >= _destinationPressure) {
            if (_oscillating) {
                _destinationPressure = _oscillateMin;
                deflateMax();
            } else {
                //Logger::Printf("%s stopping because %d reached %d", _name, _pressure, _destinationPressure);
                stop();
            }
        }
        else if (_state == IDLE && _pressure < _minPressure) {
           // Logger::Printf("%s Inflating to min pressure %d", _name, _minPressure);
            _destinationPressure = _minPressure;
            inflate(1.0);
        } 
        /*
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
            inflate(1.0);
        }*/
    }

}

void Chamber::inflateMax(float speed) {
    _destinationPressure = _maxPressure;
    Logger::Printf("%s InflatMax pressure %d at speed %f",_name, _destinationPressure, speed );
    inflate(0.5);
}
  
void Chamber::inflateTo(float max, float speed) {
    if (_oscillating) {
        stop();
        _oscillating = false;
    }
    _destinationPressure = _minPressure + (float)(_maxPressure - _minPressure) * max;
///    Logger::Printf("%s inflating from %d to %d", _name,  _pressure, _destinationPressure);
    if (_destinationPressure > _pressure) {
        inflate(speed);
    } else if (_destinationPressure < _pressure) {
        deflate(speed);
    }
}

void Chamber::inflate(float speed) {
   // Logger::Printf("%s inflate() %d", _name, _pressure);
    if (_pressure < _destinationPressure) {
        if (_state != INFLATING) {
            Logger::Printf("%s inflating at speed %d", _name, speed);
            _state = INFLATING;
            // Close before open?
            if (_releaseValve)  {
                _releaseValve->close();
            }
            
            if (_entryValve) {
                _entryValve->open(speed);
            }
        } else {
           // Logger::Printf("%s Already inflating!",_name);
        }
    }
}

void Chamber::deflate(float speed) {
    if (_state != DEFLATING) {
        Logger::Printf("%s Deflating at %f", _name, speed);
        _state = DEFLATING;
        // Close before open because of the shared pins
        
        if (_entryValve) {
            _entryValve->close();
        }
        if (_releaseValve) {
            _releaseValve->open(speed);
        }
    }
}

void Chamber::deflateMax() {
    _destinationPressure = _minPressure;
    deflate(1.0);
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

int16_t Chamber::getPressure() {
    return _pressure;
}

uint16_t Chamber::readPressure() {
    if (_pressureSensor != -1) {
        //return 1023 - analogRead(_pressureSensor);
        return analogRead(_pressureSensor);
    } else {
        return 0;
    }
}

bool Chamber::isInflated() {
    //return (_pressure >= INFLATED_THRESHOLD);
    return true;
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}
