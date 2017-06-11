#!/bin/sh
# git clone https://github.com/zaphoyd/websocketpp
# cd websocketapp
# mkdir build
# cd build
# cmake ..
# make
# sudo make install
# sudo apt-get install libboost-all-dev
g++ softcontrol.cpp SerialPort.cpp -Wall -I /usr/local/include/websocketpp/ -lboost_system -lboost_chrono -lboost_thread -lpthread -o softcontrol

