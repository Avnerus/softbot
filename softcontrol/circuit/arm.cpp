#include "arm.h"
#include "logger.h"

const int CHECK_INTERVAL = 20;
const int CALIBRATION_SAMPLES = 20 ;
const float CALIBRATION_DEVIATION = 5.0f;

Arm::Arm(int id, int pin, int threshold, bool springy) {
    _id = id;
    _pin = pin;
    _active = false;
    _idlePressure = 0;
    _pushed = false;
    _threshold = threshold;
    _currentThreshold = threshold;
    _springy = springy;
    _lastCheck = 0;

    _sensor = new BME280();
    _calibrationStats = new Statistic();
}

Arm::~Arm() {

}
void Arm::init() {
    _sensor->settings.commInterface = SPI_MODE;
    _sensor->settings.chipSelectPin = _pin;
    _calibrationStats->clear();
/*
    if (_sensor.beginSPI(_pin) == false) { //Begin communication over SPI. Use pin 10 as CS. 
        Logger::Printf("The Arm sensor at %d did not respond :(",_pin);
    } else {
        Logger::Printf("The Arm sensor at %d initialized succesfully! (threshold %d)",_pin,_threshold);
        _active = true;
        _lastCheck = millis();
    }*/
    _sensor->beginSPI(_pin);
     Logger::Printf("The Arm sensor at %d initialized! (threshold %d)",_pin,_threshold);
     delay(1000);
    _active = true;
}
void Arm::update(unsigned long now) {
    if (_active) {
        if (now - _lastCheck >= CHECK_INTERVAL) {
            _lastCheck = now;
            float pressure = (_sensor->readFloatPressure());
            _calibrationStats->add(pressure);
            if (!(_pushed && _springy) && (_calibrationStats->count() >= CALIBRATION_SAMPLES)) {
                //float stdDev = _calibrationStats.pop_stdev();
               // if (stdDev < CALIBRATION_DEVIATION) {
                _idlePressure = _calibrationStats->average();
              //  }
                _calibrationStats->clear();
                if (_pushed && !_springy) {
                    _currentThreshold = _threshold * -1.0f;
                } else {
                    _currentThreshold = _threshold;
                }
            } 
            if (_idlePressure != 0) {
                float diff = pressure - _idlePressure;
                /*
                if (_id == 2) {
                    Serial.print(">SAD ");
                    Serial.print(pressure);
                    Serial.print(',');
                    Serial.print(_idlePressure);
                    Serial.print("<");
                }*/

                if (_pushed && diff < _currentThreshold) {
                    _pushed = false;
                    Serial.print(">SAR");
                    Serial.print(_id);
                    Serial.print("<");
                }
                if (!_pushed && diff > _currentThreshold) {
                    _pushed = true;
                    Serial.print(">SAP");
                    Serial.print(_id);
                    Serial.print("<");
                }
            }
        }
    }
}


