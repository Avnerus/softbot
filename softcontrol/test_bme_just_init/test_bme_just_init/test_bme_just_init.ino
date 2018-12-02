#include <SPI.h>
#include "SparkFunBME280.h"


BME280 sensor1;
BME280 sensor2;


bool init1 = false;
bool init2 = false;

void setup() {
  Serial.begin(9600);


  sensor1.settings.commInterface = SPI_MODE;
  sensor2.settings.commInterface = SPI_MODE;

  while (!init1 || !init2) {
    if (sensor1.beginSPI(10) == false) { //Begin communication over SPI. Use pin 10 as CS.
          Serial.println("The sensor at 10 did not respond. Please check wiring.");
    } else {
      init1 = true;
      Serial.println("BME280 Sensor at 10 initalized succesfully.");
    }
    if (sensor2.beginSPI(9) == false) { //Begin communication over SPI. Use pin 10 as CS.
          Serial.println("The sensor at 9 did not respond. Please check wiring.");
    } else {
      init2 = true;
      Serial.println("BME280 Sensor at 9 initalized succesfully.");
    }
    delay(1000);
  }

  
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
