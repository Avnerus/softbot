#!/bin/sh
sudo socat -d -d pty,link=/dev/ttyACM0,ispeed=9600,ospeed=9600,perm=0666,rawer,echo=0 pty,rawer,ispeed=9600,ospeed=9600,perm=0666,echo=0
