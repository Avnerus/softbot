#include "arm.h"
#include "logger.h"

const int CHECK_INTERVAL = 20;
const int CALIBRATION_SAMPLES = 40 ;
const float CALIBRATION_DEVIATION = 5.0f;

Arm::Arm(int id, int pin, int threshold) {
    _id = id;
    _pin = pin;
    _active = false;
    _idlePressure = 0;
    _pushed = false;
    _threshold = threshold;
    _lastCheck = 0;
}

Arm::~Arm() {

}
void Arm::init() {
    _sensor.settings.commInterface = SPI_MODE;
    _calibrationStats.clear();

    if (_sensor.beginSPI(_pin) == false) { //Begin communication over SPI. Use pin 10 as CS. 
        Logger::Printf("The Arm sensor at %d did not respond :(",_pin);
    } else {
        Logger::Printf("The Arm sensor at %d initialized succesfully! (threshold %d)",_pin,_threshold);
        _active = true;
        _lastCheck = millis();
    }
}
void Arm::update(unsigned long now) {
    if (_active) {
        if (now - _lastCheck >= CHECK_INTERVAL) {
            _lastCheck = now;
            float pressure = _sensor.readFloatPressure();
            _calibrationStats.add(pressure);
            if (_calibrationStats.count() == CALIBRATION_SAMPLES) {
                float stdDev = _calibrationStats.pop_stdev();
                if (stdDev < CALIBRATION_DEVIATION) {
                    _idlePressure = _calibrationStats.average();
                }
                _calibrationStats.clear();
            } 
            if (_idlePressure != 0) {
                float diff = abs(pressure - _idlePressure);
                if (_pushed && diff < _threshold) {
                    _pushed = false;
                    Serial.print(">SAR");
                    Serial.print(_id);
                    Serial.print("<");
                }
                if (!_pushed && diff > _threshold) {
                    _pushed = true;
                    Serial.print(">SAP");
                    Serial.print(_id);
                    Serial.print("<");
                }
            }
        }
    }
}


