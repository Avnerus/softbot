#include <SPI.h>
#include "SparkFunBME280.h"

BME280 sensor;

void setup() {
      Serial.begin(9600);

      sensor.settings.commInterface = SPI_MODE;

      if (sensor.begin() == false) { //Begin communication over SPI. Use pin 10 as CS. 
          Serial.println("The sensor did not respond. Please check wiring.");
          // Freeze
          while(1);
      } else {
          Serial.println("BME280 Sensor initalized succesfully.");

          sensor.setTempOverSample(1); //0 to 16 are valid. 0 disables temp sensing. See table 24.
          sensor.setPressureOverSample(1); //0 to 16 are valid. 0 disables pressure sensing. See table 23.
          sensor.setHumidityOverSample(1); //0 to 16 are valid. 0 disables humidity sensing. See table 19.
        
          sensor.setMode(MODE_NORMAL); //MODE_SLEEP, MODE_FORCED, MODE_NORMAL is valid. See 3.3
      }
}

void loop() {
    Serial.print("Humidity: ");
    Serial.print(sensor.readFloatHumidity(), 0);

    Serial.print(" Pressure: ");
    Serial.print(sensor.readFloatPressure(), 0);

    Serial.print(" Temp: ");
    //Serial.print(sensor.readTempC(), 2);
    Serial.print(sensor.readTempF(), 2);

    Serial.println();

    delay(1000);
    
}
