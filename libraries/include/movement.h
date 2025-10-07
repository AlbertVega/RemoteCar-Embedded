
#include <gpio.h>

// Define default pin numbers
int PIN_IN3 = 22;
int PIN_IN4 = 23;
int PIN_LEFT_LED1 = 25;
int PIN_RIGHT_LED1 = 24;
int PIN_LEFT_LED2 = 26;
int PIN_RIGHT_LED2 = 16;
int PIN_IN1 = 17;
int PIN_IN2 = 27;
int PIN_EN = 13;

// Define GPIO pin structures (extern declarations)
extern GPIOPin* motor_IN3;
extern GPIOPin* motor_IN4;
extern GPIOPin* left_led1;
extern GPIOPin* left_led2;
extern GPIOPin* right_led1;
extern GPIOPin* right_led2;
extern GPIOPin* motor_IN1;
extern GPIOPin* motor_IN2;
extern GPIOPin* motor_EN;

// Setup with different pins
int setup(int pin_in3, int pin_in4, int left_pin_led1, int right_pin_led1, int left_pin_led2, int right_pin_led2, int pin_in1, int pin_in2, int pin_en);

// Setup default pins
int setup_defaults();

// Move forward
int move_forward();

// Move backward
int move_backward();

// Move to the left (power on left leds)
int move_left();

// Move to the right (power on right leds)
int move_right();

// Stop movement
int stop();

void changeLightState(char* lights);

void freeThemAll();

void turnLedOnOff(GPIOPin * pin, int state);

void blinkIt(GPIOPin * pin, float freq, float duration);


void lightsBackTogether();