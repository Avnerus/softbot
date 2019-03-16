#include "logger.h"

void Logger::Write(const char* msg) {
    Serial.print(">D");
    Serial.print(msg);
    Serial.print("<");
}
void Logger::Printf(const char *fmt, ... ) {
        char buf[128]; // resulting string limited to 128 chars
        va_list args;
        va_start (args, fmt );
        vsnprintf(buf, 128, fmt, args);
        va_end (args);
        Serial.print(">D");
        Serial.print(buf);
        Serial.print("<");
}
