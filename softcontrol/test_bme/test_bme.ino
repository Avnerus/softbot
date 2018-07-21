#include <SPI.h>
#include "SparkFunBME280.h"
#include "Statistic.h"

BME280 sensor;
Statistic calibrationStats; 
Statistic actionStats; 

float idlePressure = 0;   
int idleSamples = 0;
float currentPressure = 0;
int currentSamples = 0;
bool calibrated = false;
bool pushed = false;
float stdDev = 0;

void setup() {
      Serial.begin(9600);
      Serial.println("BME test");

      sensor.settings.commInterface = SPI_MODE;
      calibrationStats.clear();
      actionStats.clear();

      if (sensor.begin() == false) { //Begin communication over SPI. Use pin 10 as CS. 
          Serial.println("The sensor did not respond. Please check wiring.");
          // Freeze
          while(1);
      } else {
          Serial.println("BME280 Sensor initalized succesfully.");

          sensor.setTempOverSample(0); //0 to 16 are valid. 0 disables temp sensing. See table 24.
          sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
          sensor.setHumidityOverSample(0); //0 to 16 are valid. 0 disables humidity sensing. See table 19.
        
          //sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
      }
}

void loop() {
    float pressure = sensor.readFloatPressure();
    calibrationStats.add(pressure);

    if (calibrationStats.count() == 300) {
        stdDev = calibrationStats.pop_stdev();
        if (stdDev < 5.0f) {
            idlePressure = calibrationStats.average();
        }
        calibrationStats.clear();
    }

    if (idlePressure != 0) {
        float diff = pressure - idlePressure;

        if (diff > 20 && diff < 30 && !pushed) { 
            Serial.println("Push!");
            Serial.println(diff);
            pushed = true;
        }
        if (diff < -20  && diff > -30 && pushed) { 
            Serial.println("Release!");
            Serial.println(diff);
            pushed = false;
        }
    }
    
    
    delay(10);


/*

    Serial.print(" Pressure: ");
    Serial.print(sensor.readFloatPressure(), 0);


    Serial.print(" Temp: ");
    Serial.print(sensor.readTempC(), 2);
    Serial.print(sensor.readTempF(), 2);

    Serial.println();

    Serial.print("Humidity: ");
    Serial.print(sensor.readFloatHumidity(), 0);

    delay(1000); */
    
}
