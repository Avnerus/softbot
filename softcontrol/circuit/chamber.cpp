#include "chamber.h"
#include "logger.h"

const int DEFLATE_INTERVAL_MS = 10;
const int PRESSURE_SENSE_INTERVAL = 1000;
const int PRESSURE_AVERAGE_COUNT = 100;
const int PRESSURE_LEEWAY = 15;
const int INFLATE_SHOCK_PERIOD = 700;

Chamber::Chamber(
        const char name[10],
        Valve* entryValve,
        Valve* releaseValve,
        PumpNg* pump,
        int  pressureSensor,
        uint16_t  minPressure,
        uint16_t  maxPressure,
        float deflationSpeed
    ) {
    strcpy(_name, name);
    _entryValve = entryValve;
    _releaseValve = releaseValve;
    _pressureSensor = pressureSensor;
    _minPressure = minPressure;
    _maxPressure = maxPressure;
    _deflationSpeed = deflationSpeed;
    _pump = pump;
    _destinationPressure = 0;
    _basePressure = 0;
    _lastPressureSense = 0;
    _pressureReadCount = 0;
    _pressureReadSum = 0;
    _startedInflating = 0;
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

    //Logger::Printf("%s chamber initialized - Initial pressure: %d",_name, _pressure);

    _pressure = readPressure();
}

void Chamber::update(unsigned long now) {
    // Blast Protection
    if (_pressureSensor != -1) {
        //_pressure = max(readPressure() - _basePressure,0);
        int currentPressure = readPressure();
        _pressureReadSum += currentPressure;
        _pressureReadCount += 1;
        if (_pressureReadCount >= PRESSURE_AVERAGE_COUNT) {
            _pressure = _pressureReadSum / PRESSURE_AVERAGE_COUNT;
            _pressureReadCount = 0;
            _pressureReadSum = 0;

            if (now - _lastPressureSense >= PRESSURE_SENSE_INTERVAL) {
                Serial.print(">SP");
                Serial.write(_name, 10);
                Serial.write((byte*)&_pressure,2);
                Serial.print("<");
                _lastPressureSense = now;
            }
            if (
                _pressure > _maxPressure + PRESSURE_LEEWAY &&
                _state == INFLATING && 
                 now - _startedInflating > INFLATE_SHOCK_PERIOD
            ) {
                stop();
            }
            else {
                if (_state == INFLATING &&
                    _pressure >= _destinationPressure + PRESSURE_LEEWAY &&
                     now - _startedInflating > INFLATE_SHOCK_PERIOD
                    ) {
                    if (_oscillating) {
                        _destinationPressure = _oscillateMin;
                        deflate(_deflationSpeed);
                    } else {
                        stop();
                    }
                }
                else if (_state == IDLE && _pressure <= _minPressure - PRESSURE_LEEWAY && _pump->isOn()) {
                     Logger::Printf(_name, " inflating from ",_pressure," to min pressure ", _minPressure);
                    _destinationPressure = _minPressure;
                     inflate(1.0);
                } 
                else if (_state == DEFLATING && 
                        (_pressure <= _destinationPressure + PRESSURE_LEEWAY  || _pressure <= _minPressure + PRESSURE_LEEWAY )) {
                    if (_oscillating) {
                        _destinationPressure = _oscillateMax;
                        inflate(1.0);
                    } else {
                        stop();
                    }
                }
            }

        }
    }
}

void Chamber::inflateMax(float speed) {
    _destinationPressure = _maxPressure;
    Logger::Printf(_name, " inflatMax pressure ",_destinationPressure, "at speed ", speed );
    inflate(speed);
}
  
void Chamber::inflateTo(float max, float speed) {
    if (_oscillating) {
        stop();
        _oscillating = false;
    }
    _destinationPressure = _minPressure + (float)(_maxPressure - _minPressure) * max;
    Logger::Printf(_name," inflating from ",_pressure, " to ", _destinationPressure);
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
            //Logger::Printf("%s inflating at speed %f", _name, speed);
            _state = INFLATING;
            _startedInflating = millis();
            // Close before open because of shared PWM
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
        Logger::Printf(_name, " deflating to ", _destinationPressure, " at speed ", speed);
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

void Chamber::deflate() {
    deflate(_deflationSpeed);
}

void Chamber::deflateMax(float speed) {
    _destinationPressure = _minPressure;
    deflate(speed);
}

void Chamber::deflateMax() {
    deflateMax(_deflationSpeed);
}

void Chamber::stop() {
    if (!_state == IDLE) {
        Logger::Printf(_name, " stopping at ", _pressure);
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

    //Logger::Printf("%s oscillating with %d/%d", _name, _oscillateMin, _oscillateMax);

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
    if (_pressureSensor == -1) {
        return true;
    } else {
        return !pressureIsNear(_minPressure);
    }
}

bool Chamber::pressureIsNear(uint16_t target) {
    return abs(_pressure - target) <= PRESSURE_LEEWAY;
}

CHAMBER_STATE Chamber::getState() {
    return _state;
}

const char* Chamber::getName() {
    return _name;
}
