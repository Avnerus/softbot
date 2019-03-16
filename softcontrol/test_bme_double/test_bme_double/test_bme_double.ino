#include <SPI.h>
#include "SparkFunBME280.h"
#include "Statistic.h"



BME280 sensor1;
BME280 sensor2;

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

  calibrationStats.clear();
  actionStats.clear();

  sensor1.settings.commInterface = SPI_MODE;
//  sensor2.settings.commInterface = SPI_MODE;

  if (sensor1.beginSPI(10) == false) { //Begin communication over SPI. Use pin 10 as CS.
    // Freeze
    while (1) {
          Serial.println("The sensor at 10 did not respond. Please check wiring.");

    };
    
  } 
  Serial.println("BME280 Sensor 10 initalized succesfully.");
  if (sensor2.beginSPI(9) == false) { //Begin communication over SPI. Use pin 10 as CS.
    while (1) {
       Serial.println("The sensor at 9 did not respond. Please check wiring.");  
    }
  }
  Serial.println("BME280 Sensor 9 initalized succesfully.");
/*

      sensor.setTempOverSample(0); //0 to 16 are valid. 0 disables temp sensing. See table 24.
      sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
      sensor.setHumidityOverSample(0); //0 to 16 are valid. 0 disables humidity sensing. See table 19.
    

    //sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
  */
}

void loop() {

  float pressure1 = sensor1.readFloatPressure();
  float pressure2 = sensor2.readFloatPressure();
  
  Serial.print(pressure1);
  Serial.print(' ');
  Serial.println(pressure2);


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
