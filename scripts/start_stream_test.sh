#!/bin/sh

#gst-launch-1.0 pulsesrc ! queue ! opusenc ! rtpopuspay ! udpsink host=127.0.0.1 port=8003 rpicamsrc preview=false ! x264enc tune=zerolatency speed-preset=ultrafast qp-min=18 pass=5 quantizer=21 ! video/x-h264,width=640,height=480,framerate=30/1 ! rtph264pay ! udpsink host=127.0.0.1 port=8004 sync=false

gst-launch-1.0 v4l2src ! queue ! opusenc ! rtpopuspay ! udpsink host=13.48.101.56 port=8003 rpicamsrc preview=false ! videoconvert ! video/x-raw, framerate=30/1, width=640, height=480 ! vp8enc cpu-used=5 threads=3 deadline=1 ! rtpvp8pay ! udpsink host=13.48.101.56 port=8004 sync=false


# Low CPU useage
#gst-launch-1.0 pulsesrc ! queue ! opusenc ! rtpopuspay ! udpsink host=127.0.0.1 port=8003 rpicamsrc preview=false ! x264enc tune=fastdecode speed-preset=1 pass=5 quantizer=30 ! video/x-h264,width=640,height=480,framerate=30/1 ! rtph264pay ! udpsink host=127.0.0.1 port=8004 sync=false

