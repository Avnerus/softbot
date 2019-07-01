#!/bin/sh
gst-launch-1.0 pulsesrc ! queue ! opusenc ! rtpopuspay ! udpsink host=127.0.0.1 port=8003 v4l2src ! videoconvert ! video/x-raw, framerate=30/1, width=640, height=480 ! vp8enc cpu-used=5 threads=3 deadline=1 ! rtpvp8pay ! udpsink host=127.0.0.1 port=8004 sync=false
