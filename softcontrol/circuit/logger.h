#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

class Logger {

    public:
        static void Write(const char* msg);
        static void Printf(const char *fmt, ...);
        static void Printf(const char *text1, const char* text2, int num1, const char* text3, int num2);
        static void Printf(const char *text1, const char* text2, int num1, const char* text3, float num2);
        static void Printf(const char *text1, const char* text2, int num1);
};
#endif
