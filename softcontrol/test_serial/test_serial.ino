void setup() {
  // start serial port at 9600 bps and wait for port to open:
  Serial.begin(9600);
}

void loop() {
  // if we get a valid byte, read analog ins:
 // if (Serial.available() > 0) {
  //}
  Serial.print(">DHello<");
  delay(1000);
}
