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

const int SPI_PORT = 52;


void setup() {
  Serial.begin(9600);
  delay(3000);
  Serial.println("BME test");
  Serial.flush();


  sensor.settings.commInterface = SPI_MODE;
  calibrationStats.clear();
  actionStats.clear();
  bool worked = false;
  sensor.beginSPI(SPI_PORT);
  /*
  if (sensor.beginSPI(SPI_PORT) == false) { //Begin communication over SPI. Use pin 10 as CS.
    // Freeze
      while (!worked) {
        worked = sensor.beginSPI(SPI_PORT);
        Serial.println("No");
      }
  } else {
    Serial.println("BME280 Sensor initalized succesfully.");

  //    sensor.setTempOverSample(0); //0 to 16 are valid. 0 disables temp sensing. See table 24.
    //  sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
     // sensor.setHumidityOverSample(0); //0 to 16 are valid. 0 disables humidity sensing. See table 19 
    

    //sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
  } */
}

void loop() {

  float pressure = sensor.readFloatPressure();
  Serial.println(pressure);

 /*int bars = (int)pressure - 98000;
 //Serial.println(bars);/*
 for (int i = 0; i  < bars; i++) {
  Serial.print("|");
 }
 Serial.print('\n');*/

  delay(20);



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
