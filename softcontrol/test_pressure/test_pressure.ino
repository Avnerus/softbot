void setup() {
    Serial.begin(9600);
    delay(3000);
}

void loop() {
    int pressure = analogRead(A15);
    Serial.println(pressure);
    delay(100);
}
