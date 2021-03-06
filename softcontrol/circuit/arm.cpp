#include "arm.h"
#include "logger.h"

const int CHECK_INTERVAL = 20;
const int CALIBRATION_SAMPLES = 20 ;
const float CALIBRATION_DEVIATION = 5.0f;

Arm::Arm(int id, int pin, float threshold, float releaseThreshold) {
    _id = id;
    _pin = pin;
    _active = false;
    _idlePressure = 0;
    _pushed = false;
    _threshold = threshold;
    _releaseThreshold = releaseThreshold;
    _currentThreshold = threshold;
    _lastCheck = 0;

    _sensor = BME280();
    _calibrationStats = new Statistic();
}

Arm::~Arm() {

}
void Arm::init() {
/*
    if (_sensor.beginSPI(_pin) == false) { //Begin communication over SPI. Use pin 10 as CS. 
        Logger::Printf("The Arm sensor at %d did not respond :(",_pin);
    } else {
        Logger::Printf("The Arm sensor at %d initialized succesfully! (threshold %d)",_pin,_threshold);
        _active = true;
        _lastCheck = millis();
    }*/
    _sensor.beginSPI(_pin);
    _calibrationStats->clear();
     Logger::Printf("The Arm sensor at ", _pin, " initialized! threshold",_threshold);
    _active = true;
}
void Arm::update(unsigned long now) {
    if (_active) {
        if (now - _lastCheck >= CHECK_INTERVAL) {
            _lastCheck = now;
            float pressure = (_sensor.readFloatPressure());
            _calibrationStats->add(pressure);
            if (_calibrationStats->count() >= CALIBRATION_SAMPLES) {
                //float stdDev = _calibrationStats.pop_stdev();
               // if (stdDev < CALIBRATION_DEVIATION) {
                _idlePressure = _calibrationStats->average();
              //  }
                _calibrationStats->clear();
            } 
            if (_idlePressure != 0) {
                float diff = pressure - _idlePressure;

                /*
                
                if (_id == 2) {
                    Serial.print(">SAD ");
                    Serial.print(pressure);
                    Serial.print(',');
                    Serial.print(_idlePressure);
                    Serial.print(',');
                    Serial.print(diff);
                    Serial.print("<");
                }*/

                if (_pushed && diff < _releaseThreshold) {
                    _pushed = false;
                    Serial.print(">SAR");
                    Serial.print(_id);
                    Serial.print("<");
                }
                else if (!_pushed && diff > _threshold) {
                    _pushed = true;
                    Serial.print(">SAP");
                    Serial.print(_id);
                    Serial.print("<");
                }
            }
        }
    }
}


