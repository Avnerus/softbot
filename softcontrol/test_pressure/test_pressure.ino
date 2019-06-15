int pressureA = A10;
int pressureB = A20;

void setup() {
    Serial.begin(9600);
    delay(3000);
}

void loop() {
    int pressure = analogRead(pressureB);
    Serial.println(pressure);
    delay(50);
}
