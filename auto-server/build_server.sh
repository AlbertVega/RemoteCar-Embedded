#!/bin/bash
# Exit if any command fails
set -e

# Start npm project
echo "Starting npm project..."  
npm start &                

# Compile and run C program
echo "Compiling C program..."
gcc ./video_server.c -o ./video_server -lwebsockets -udpsrc # compile
chmod +x ./video_server
./video_server
echo "Running C program..."

# Keep script alive (so background processes don’t die)
wait
