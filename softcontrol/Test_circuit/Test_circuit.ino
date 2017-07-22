
// This sample code is used with the control circuit to 
// inflate and deflate the robot in a loop, i.e. it creates 
// a kind of breathing pattern.
//*********************************************************//

int inflateTime = 2000; //This is the number of miliseconds the robot will inflate (try different values)
int deflateTime = 2000; //This is the number of miliseconds the robot will deflate (try different values)

int valvePin1 = 22;
int valvePin2 = 24;
int valvePin3 = 26;
int valvePin4 = 28;
int valvePin5 = 30;
int valvePin6 = 32;
int valvePin7 = 23;
int valvePin8 = 25;
int valvePin9 = 27;
int valvePin10 = 29;

int pumpEnable = 7;
int pumpMotor = 40;

int pumpEnable2 = 6;
int pumpMotor2 = 41;

int pressureSensor1 = A0;
int pressureSensor2 = A1;
int pressureSensor3 = A2;
int pressureSensor4 = A3;
int pressureSensor5 = A4;

void setup() {
  Serial.begin(9600); 
  Serial.println("Starting");
  pinMode(valvePin1, OUTPUT);
  pinMode(valvePin2, OUTPUT);
  pinMode(valvePin3, OUTPUT);
  pinMode(valvePin4, OUTPUT);
  pinMode(valvePin5, OUTPUT);
  pinMode(valvePin6, OUTPUT);
  pinMode(valvePin7, OUTPUT);
  pinMode(valvePin8, OUTPUT);
  pinMode(valvePin9, OUTPUT);
  pinMode(valvePin10, OUTPUT);

  pinMode(pumpEnable, OUTPUT);
  pinMode(pumpMotor, OUTPUT);
  pinMode(pumpEnable2, OUTPUT);
  pinMode(pumpMotor2, OUTPUT);

}

void loop() {


  Serial.println("Pump it");
  digitalWrite(pumpMotor, HIGH);
  analogWrite(pumpEnable, 220);

  digitalWrite(pumpMotor2, HIGH);
  analogWrite(pumpEnable2, 220);

  digitalWrite(valvePin1,LOW);
  digitalWrite(valvePin2,LOW);
  digitalWrite(valvePin3,LOW);
  digitalWrite(valvePin4,LOW);
  digitalWrite(valvePin5,LOW);
  digitalWrite(valvePin6,LOW);
  digitalWrite(valvePin7,LOW);
  digitalWrite(valvePin8,LOW);
  digitalWrite(valvePin9,LOW);
  digitalWrite(valvePin10,LOW);

  delay(inflateTime);

  int pressure;
  pressure = analogRead(pressureSensor1);
  Serial.println(pressure);
  pressure = analogRead(pressureSensor2);
  Serial.println(pressure);
  pressure = analogRead(pressureSensor3);
  Serial.println(pressure);
  pressure = analogRead(pressureSensor4);
  Serial.println(pressure);
  pressure = analogRead(pressureSensor5);
  Serial.println(pressure);

  digitalWrite(pumpMotor, LOW);
  analogWrite(pumpEnable, 0);

  digitalWrite(pumpMotor2, LOW);
  analogWrite(pumpEnable2, 0);

  digitalWrite(valvePin1,HIGH);
  digitalWrite(valvePin2,HIGH);
  digitalWrite(valvePin3,HIGH);
  digitalWrite(valvePin4,HIGH);
  digitalWrite(valvePin5,HIGH);
  digitalWrite(valvePin6,HIGH);
  digitalWrite(valvePin7,HIGH);
  digitalWrite(valvePin8,HIGH);
  digitalWrite(valvePin9,HIGH);
  digitalWrite(valvePin10,HIGH);

  Serial.println("Done");

  delay(deflateTime);
  
}
