int E1 = 6;
int M1 = 7;
int V1 = 9;

int motorSpeed = 0;

void setup() {
  pinMode(E1, OUTPUT);
  pinMode(V1, OUTPUT);
  Serial.begin(9600); 
  int sensorValue = analogRead(A0);
}

void loop() {
  /*
    int sensorValue = analogRead(A0);
    int motorSpeed = round((float)sensorValue / 1023 * 255);
    //Serial.println(motorSpeed);
 */
     
    if (Serial.available()) {
      motorSpeed = Serial.read();
     // Serial.println(motorSpeed);
    } 
    digitalWrite(M1,HIGH);
    analogWrite(E1, motorSpeed);


    // Protection
    int pressure = analogRead(A1);
    if (pressure > 300) {
     digitalWrite(V1, HIGH);
    } else if (pressure < 80) {
      digitalWrite(V1, LOW);
    }
    Serial.println(pressure); 
    
    delay(30);
}
