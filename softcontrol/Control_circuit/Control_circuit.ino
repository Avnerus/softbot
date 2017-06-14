//*********************************************************//
// This sample code is used with the control circuit to 
// inflate and deflate the robot in a loop, i.e. it creates 
// a kind of breathing pattern.
//*********************************************************//

int inflateTime = 2000; //This is the number of miliseconds the robot will inflate (try different values)
int deflateTime = 2000; //This is the number of miliseconds the robot will deflate (try different values)

int valvePin1 = 12;
int valvePin2 = 8;
int valvePin3 = 9;
int valvePin4 = 6;
int valvePin5 = 10;
int valvePin6 = 11;

int pumpEnable = 3;
int pumpMotor = 4;

void setup() {
  Serial.begin(9600); 
  Serial.println("Starting");
  pinMode(valvePin1, OUTPUT);
  pinMode(valvePin2, OUTPUT);
  pinMode(valvePin3, OUTPUT);
  pinMode(valvePin4, OUTPUT);
  pinMode(valvePin5, OUTPUT);
  pinMode(valvePin6, OUTPUT);

  pinMode(pumpEnable, OUTPUT);
  pinMode(pumpMotor, OUTPUT);

}

void loop() {

  digitalWrite(pumpMotor, HIGH);
  analogWrite(pumpEnable, 200);

  digitalWrite(valvePin1,LOW);
  digitalWrite(valvePin2,LOW);
  digitalWrite(valvePin3,LOW);
  
  digitalWrite(valvePin4,LOW);
  
  digitalWrite(valvePin5,LOW);
  
  digitalWrite(valvePin6,LOW);

  delay(inflateTime);

  digitalWrite(pumpMotor, LOW);
  analogWrite(pumpEnable, 0);

  digitalWrite(valvePin1,HIGH);
  digitalWrite(valvePin2,HIGH);
  digitalWrite(valvePin3,HIGH);
  
  digitalWrite(valvePin4,HIGH);
  digitalWrite(valvePin5,HIGH);
  
  digitalWrite(valvePin6,HIGH);
  delay(deflateTime);
  
}
