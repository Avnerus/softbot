#include "logger.h"

void Logger::Write(const char* msg) {
    Serial.print(">D");
    Serial.print(msg);
    Serial.print("<");
}
/* 
 This function desroys SPI on the teensy for some reason
 
void Logger::Printf(const char *fmt, ... ) {
        char buf[256]; // resulting string limited to 256 chars
        va_list args;
        va_start (args, fmt );
        vsnprintf(buf, 256, fmt, args);
        va_end (args);
        Serial.print(">D");
        Serial.print(buf);
        Serial.print("<");
}*/

void Logger::Printf(const char *fmt, ... ) {
        Serial.print(">D");
        Serial.print(fmt);
        Serial.print("<");
}

void Logger::Printf(const char *text1, const char* text2, int num1, const char* text3, int num2) {
        Serial.print(">D");
        Serial.print(text1);
        Serial.print(text2);
        Serial.print(num1);
        Serial.print(text3);
        Serial.print(num2);
        Serial.print("<");
}
void Logger::Printf(const char *text1, const char* text2, int num1, const char* text3, float num2) {
        Serial.print(">D");
        Serial.print(text1);
        Serial.print(text2);
        Serial.print(num1);
        Serial.print(text3);
        Serial.print(num2);
        Serial.print("<");
}
void Logger::Printf(const char *text1, const char* text2, int num1) {
        Serial.print(">D");
        Serial.print(text1);
        Serial.print(text2);
        Serial.print(num1);
        Serial.print("<");
}
