#include <SPI.h>
#include "SparkFunBME280.h"
#include "Statistic.h"

#include "valve.h"
#include "pumpng.h"

PumpNg pump(22,21,23,20);
Valve valve(15,16,17,20);


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
unsigned long t2 = 0;
unsigned long t3 = 0;
int step = 0;

void setup() {
      Serial.begin(9600);
      Serial.println("BME test");
      pump.init();
      valve.init();

      sensor.settings.commInterface = SPI_MODE;
      calibrationStats.clear();
      actionStats.clear();

      if (sensor.begin() == false) { //Begin communication over SPI. Use pin 10 as CS. 
          Serial.println("The sensor did not respond. Please check wiring.");
          // Freeze
          while(1);
      } else {
          Serial.println("BME280 Sensor initalized succesfully.");
          /*

          sensor.setTempOverSample(0); //0 to 16 are valid. 0 disables temp sensing. See table 24.
          sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
          sensor.setHumidityOverSample(0); //0 to 16 are valid. 0 disables humidity sensing. See table 19.
          */
        
          //sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
      }
}

void loop() {
    
    float pressure = sensor.readFloatPressure();
    //Serial.println(pressure); 
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
        Serial.write('S');
        Serial.write((byte)diff); 
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
    
    
    delay(20);

    if (step == 0) {
        t2 = millis() + 4000;
        valve.close();
        pump.inflate();
        step = 1;
    }
    if (millis() > t2 && step == 1)  {
        t3 = millis() + 2000;
        valve.open();
        pump.stop();
        step = 2;
    }
    if (millis() > t3 && step == 2)  {
        step = 0;
    }


    /*
    Serial.print(" Pressure: ");
    Serial.print(sensor.readFloatPressure(), 0);


    Serial.print(" Temp: ");
    Serial.print(sensor.readTempC(), 2);

    Serial.println();

    Serial.print("Humidity: ");
    Serial.print(sensor.readFloatHumidity(), 0);

    delay(1000); */
    
    /*
    Serial.println(sensor.readFloatPressure(), 0);
    delay(10); */
}
