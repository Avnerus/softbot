#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

class Logger {

    public:
        static void Write(const char* msg);
        static void Printf(const char *fmt, ...);
};
#endif
