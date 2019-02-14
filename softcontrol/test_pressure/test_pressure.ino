void setup() {
    Serial.begin(9600);
    delay(3000);
}

void loop() {
    int pressure = analogRead(A20);
    Serial.println(pressure);
    delay(50);
}
