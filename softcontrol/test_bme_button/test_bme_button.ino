#include <SPI.h>
#include "SparkFunBME280.h"
#include "Statistic.h"


BME280 sensor;
Statistic calibrationStats; 

float idlePressure = 0;   
int idleSamples = 0;
float currentPressure = 0;
int currentSamples = 0;
bool calibrated = false;
bool pushed = false;
float stdDev = 0;
unsigned long lastCheck;
int step = 0;
int sampleCount = 50;

float threshold = 60.0;
float currentThreshold = 60.0;


void setup() {
      Serial.begin(9600);
      delay(3000);
      Serial.println("BME test");

      sensor.settings.commInterface = SPI_MODE;
      calibrationStats.clear();

     // if (sensor.beginSPI(10) == false) { //Begin communication over SPI. Use pin 10 as CS. 
      if (sensor.beginSPI(10) == false) { //Begin communication over SPI. Use pin 10 as CS. 

          /*
          while (1) {
              if (sensor.beginSPI(10) == false) {
                Serial.println("The sensor did not respond. Please check wiring.");
              } else {
                Serial.println("OK");
              }
          }*/

      } else {
          Serial.println("BME280 Sensor initalized succesfully.");
          /*

          sensor.setTempOverSample(0); //0 to 16 are valid. 0 disables temp sensing. See table 24.
          sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
          sensor.setHumidityOverSample(0); //0 to 16 are valid. 0 disables humidity sensing. See table 19.
          */
        
          //sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
      }
      lastCheck = millis();
}

void loop() {
    if (millis() - lastCheck >= 20) {
        lastCheck = millis();
        float pressure = sensor.readFloatPressure();
        calibrationStats.add(pressure);

        if (!pushed && calibrationStats.count() >= 20) {
           // stdDev = calibrationStats.pop_stdev();
            //if (stdDev < 0.0f) {
            idlePressure = calibrationStats.average();
            //}
            /*
            if (pushed) {
                currentThreshold = threshold * -1.0f;
            } else {
                currentThreshold = threshold;
            }*/
            calibrationStats.clear();
        } 
        if (idlePressure != 0) {
            float diff = pressure - idlePressure;
            Serial.print(diff);
            Serial.print(" - ");
            Serial.print(pushed);
            Serial.print(" ( ");
            Serial.print(currentThreshold);
            Serial.print(")");
            Serial.print(" [");
            Serial.print(pressure);
            Serial.print(",");
            Serial.print(idlePressure);
            Serial.println("]");

            if (pushed && diff < currentThreshold) {
                pushed = false;
                Serial.print('R');
            }
            if (!pushed && diff > currentThreshold) {
                pushed = true;
                Serial.print('P');
            }
            //Serial.println((byte)diff); 
            /*

            if (diff > 40 && diff < 100 && !pushed) { 
                Serial.print("S");
                Serial.println(1);
             //   Serial.println(diff);
                pushed = true;
            }
            else if (diff < -40  && diff > -80 && pushed) { 
                Serial.print("S");
                Serial.println(0);
               // Serial.println(diff);
                pushed = false;
            }*/
        }
        
        

    }
}
