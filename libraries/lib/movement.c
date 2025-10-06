
#include <movement.h>
#include <stdlib.h>
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

// Define global GPIO pin structures
GPIOPin* motor_IN3;
GPIOPin* motor_IN4;
GPIOPin* left_led1;
GPIOPin* left_led2;
GPIOPin* right_led1;
GPIOPin* right_led2;
GPIOPin* motor_IN1;
GPIOPin* motor_IN2;
GPIOPin* motor_EN;

// Global flag to stop all blink threads
volatile int stop_blink_flag = 0;

// Global flag to stop PWM
volatile int stop_pwm_flag = 0;

// Structure for PWM parameters
typedef struct {
    GPIOPin* gpio;
    float duty_cycle;  // 0.0 a 1.0 (0% a 100%)
    int period_ms;     // Período en millisegundos
} pwm_params_t;


// Structure for passing blink parameters to thread
typedef struct {
    GPIOPin* gpio;
    float freq;
    float duration;
} blink_params_t;

// Configuration with different pins
int setup(int pin_in3, int pin_in4, int left_pin_led1, int right_pin_led1, int left_pin_led2, int right_pin_led2, int pin_in1, int pin_in2, int pin_en) {
    // Change pin assignments
    PIN_IN3 = pin_in3;
    PIN_IN4 = pin_in4;
    PIN_LEFT_LED1 = left_pin_led1;
    PIN_RIGHT_LED1 = right_pin_led1;
    PIN_LEFT_LED2 = left_pin_led2;
    PIN_RIGHT_LED2 = right_pin_led2;
    PIN_IN1 = pin_in1;
    PIN_IN2 = pin_in2;
    PIN_EN = pin_en;

    // Allocate memory for GPIO pin structures
    motor_IN3 = malloc(sizeof(GPIOPin));
    motor_IN4 = malloc(sizeof(GPIOPin));
    left_led1 = malloc(sizeof(GPIOPin));
    right_led1 = malloc(sizeof(GPIOPin));
    left_led2 = malloc(sizeof(GPIOPin));
    right_led2 = malloc(sizeof(GPIOPin));
    motor_IN1 = malloc(sizeof(GPIOPin));
    motor_IN2 = malloc(sizeof(GPIOPin));
    motor_EN = malloc(sizeof(GPIOPin));
    
    // Verify memory allocation
    if (!motor_IN3 || !motor_IN4 || !left_led1 || !right_led1 || 
        !left_led2 || !right_led2 || !motor_IN1 || !motor_IN2 || !motor_EN) {
        printf("Error: No se pudo asignar memoria para los GPIOs\n");
        return GPIO_ERROR_INVALID_PIN;
    }

    // Initialize GPIO pins with status prints
    printf("Configurando GPIOs:\n");

    *motor_IN3 = pinMode(PIN_IN3, OUTPUT);
    if (motor_IN3->fd_line >= 0) {
        printf("Motor IN3 (pin %d): Configurado correctamente\n", PIN_IN3);
    } else {
        printf("Motor IN3 (pin %d): Error de configuración\n", PIN_IN3);
    }

    *motor_IN4 = pinMode(PIN_IN4, OUTPUT);
    if (motor_IN4->fd_line >= 0) {
        printf("Motor IN4 (pin %d): Configurado correctamente\n", PIN_IN4);
    } else {
        printf("Motor IN4 (pin %d): Error de configuración\n", PIN_IN4);
    }

    *left_led1 = pinMode(PIN_LEFT_LED1, OUTPUT);
    if (left_led1->fd_line >= 0) {
        printf("Left LED 1 (pin %d): Configurado correctamente\n", PIN_LEFT_LED1);
    } else {
        printf("Left LED 1 (pin %d): Error de configuración\n", PIN_LEFT_LED1);
    }

    *right_led1 = pinMode(PIN_RIGHT_LED1, OUTPUT);
    if (right_led1->fd_line >= 0) {
        printf("Right LED 1 (pin %d): Configurado correctamente\n", PIN_RIGHT_LED1);
    } else {
        printf("Right LED 1 (pin %d): Error de configuración\n", PIN_RIGHT_LED1);
    }

    *left_led2 = pinMode(PIN_LEFT_LED2, OUTPUT);
    if (left_led2->fd_line >= 0) {
        printf("Left LED 2 (pin %d): Configurado correctamente\n", PIN_LEFT_LED2);
    } else {
        printf("Left LED 2 (pin %d): Error de configuración\n", PIN_LEFT_LED2);
    }

    *right_led2 = pinMode(PIN_RIGHT_LED2, OUTPUT);
    if (right_led2->fd_line >= 0) {
        printf("Right LED 2 (pin %d): Configurado correctamente\n", PIN_RIGHT_LED2);
    } else {
        printf("Right LED 2 (pin %d): Error de configuración\n", PIN_RIGHT_LED2);
    }

    *motor_IN1 = pinMode(PIN_IN1, OUTPUT);
    if (motor_IN1->fd_line >= 0) {
        printf("Motor IN1 (pin %d): Configurado correctamente\n", PIN_IN1);
    } else {
        printf("Motor IN1 (pin %d): Error de configuración\n", PIN_IN1);
    }

    *motor_IN2 = pinMode(PIN_IN2, OUTPUT);
    if (motor_IN2->fd_line >= 0) {
        printf("Motor IN2 (pin %d): Configurado correctamente\n", PIN_IN2);
    } else {
        printf("Motor IN2 (pin %d): Error de configuración\n", PIN_IN2);
    }

    *motor_EN = pinMode(PIN_EN, OUTPUT);
    if (motor_EN->fd_line >= 0) {
        printf("Motor EN (pin %d): Configurado correctamente\n", PIN_EN);
    } else {
        printf("Motor EN (pin %d): Error de configuración\n", PIN_EN);
    }

    // Verify initialization
    if( motor_IN3->fd_line < 0 || motor_IN4->fd_line < 0 ||
        left_led1->fd_line < 0 || right_led1->fd_line < 0 ||
        left_led2->fd_line < 0 || right_led2->fd_line < 0 ||
        motor_IN1->fd_line < 0 || motor_IN2->fd_line < 0 || motor_EN->fd_line < 0) {
        printf("\nError: Uno o más GPIOs no se configuraron correctamente\n");
        
        // Clean up allocated memory on failure
        free(motor_IN3);
        free(motor_IN4);
        free(left_led1);
        free(right_led1);
        free(left_led2);
        free(right_led2);
        free(motor_IN1);
        free(motor_IN2);
        free(motor_EN);

        return GPIO_ERROR_INVALID_PIN;
    }

    printf("\nTodos los GPIOs configurados exitosamente\n");

    // Habilitar enable
    digitalWrite(motor_EN, HIGH);

    // Initialize all pins to LOW
    stop();

    return GPIO_SUCCESS;

}

// Configuration with default pins
int setup_defaults() {
    return setup(PIN_IN3, PIN_IN4, PIN_LEFT_LED1, PIN_RIGHT_LED1, PIN_LEFT_LED2, PIN_RIGHT_LED2, PIN_IN1, PIN_IN2, PIN_EN);
}

// Custom interruptible blink function
void* interruptible_blink(GPIOPin* gpio, float freq, float duration) {
    if (freq <= 0 || duration <= 0) return NULL;
    
    int period_ms = (int)(1000.0 / freq);  // Period in milliseconds
    int half_period_ms = period_ms / 2;    // Half period (ON/OFF time)
    int total_cycles = (int)(duration * freq);  // Total blink cycles
    
    for (int i = 0; i < total_cycles && !stop_blink_flag; i++) {
        // Turn LED ON
        digitalWrite(gpio, HIGH);
        
        // Sleep in small chunks to check stop flag frequently
        for (int j = 0; j < half_period_ms && !stop_blink_flag; j += 10) {
            usleep(10000);  // Sleep 10ms at a time
        }
        
        if (stop_blink_flag) break;
        
        // Turn LED OFF
        digitalWrite(gpio, LOW);
        
        // Sleep in small chunks to check stop flag frequently
        for (int j = 0; j < half_period_ms && !stop_blink_flag; j += 10) {
            usleep(10000);  // Sleep 10ms at a time
        }
    }
    
    // Ensure LED is OFF when done
    digitalWrite(gpio, LOW);
    return NULL;
}

// Thread function for non-blocking blink
void* blink_thread(void* arg) {
    blink_params_t* params = (blink_params_t*)arg;
    interruptible_blink(params->gpio, params->freq, params->duration);
    free(params);  // Clean up allocated memory
    return NULL;
}


// PWM continuous function (runs until stopped)
void* continuous_pwm(void* arg) {
    pwm_params_t* params = (pwm_params_t*)arg;
    
    int on_time_ms = (int)(params->period_ms * params->duty_cycle);
    int off_time_ms = params->period_ms - on_time_ms;
    
    while (!stop_pwm_flag) {
        // Turn ON
        digitalWrite(params->gpio, HIGH);
        
        for (int i = 0; i < on_time_ms && !stop_pwm_flag; i += 5) {
            usleep(5000);  // 5ms chunks
        }
        
        if (stop_pwm_flag) break;
        
        // Turn OFF
        digitalWrite(params->gpio, LOW);
        
        for (int i = 0; i < off_time_ms && !stop_pwm_flag; i += 5) {
            usleep(5000);  // 5ms chunks
        }
    }
    
    digitalWrite(params->gpio, LOW);
    free(params); 
    return NULL;
}

// Start continuous PWM (non-blocking)
int start_pwm(GPIOPin* gpio, int percentage) {
    if (percentage < 0 || percentage > 100) {
        return GPIO_ERROR_INVALID_DURATION;
    }
    
    // Stop any previous PWM
    stop_pwm_flag = 1;
    usleep(50000);  // Wait 50ms for cleanup
    stop_pwm_flag = 0;
    
    // Create PWM parameters
    pwm_params_t* params = malloc(sizeof(pwm_params_t));
    params->gpio = gpio;
    params->duty_cycle = percentage / 100.0;
    params->period_ms = 20;  
    
    // Start PWM thread
    pthread_t pwm_thread_id;
    pthread_create(&pwm_thread_id, NULL, continuous_pwm, params);
    pthread_detach(pwm_thread_id);  
    
    return GPIO_SUCCESS;
}

int move_forward_pwm(int percentaje) {
    if (percentaje < 0 || percentaje > 100) return GPIO_ERROR_INVALID_DURATION;
    float duty_cycle = percentaje / 100.0;
    return start_pwm(motor_IN2, percentaje);
}

// Move forward
int move_forward() {
    return digitalWrite(motor_IN2, HIGH);
}

int move_backward_pwm(int percentaje) {
    if (percentaje < 0 || percentaje > 100) return GPIO_ERROR_INVALID_DURATION;
    float duty_cycle = percentaje / 100.0;
    return start_pwm(motor_IN1, percentaje);
}

// Move backward
int move_backward() {
    return digitalWrite(motor_IN1, HIGH);
}

// Move to the left (power on left leds)
int move_left_and_go(int percentaje) {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;
    
    // Start motor immediately
    int motor_result = digitalWrite(motor_IN4, HIGH);

    // Start moving car
    move_forward_pwm(percentaje);
    
    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = left_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = left_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread
    
    return motor_result;
}

// Move to the left (power on left leds)
int move_left() {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;
    
    // Start motor immediately
    int motor_result = digitalWrite(motor_IN4, HIGH);
    
    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = left_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = left_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread
    
    return motor_result;
}

int move_right_and_go(int percentaje) {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;
    
    // Start motor immediately
    int motor_result = digitalWrite(motor_IN3, HIGH);

    // Start moving car
    move_forward_pwm(percentaje);
    
    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = right_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = right_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread

    return motor_result;
}

// Move to the right (power on right leds)
int move_right() {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;
    
    // Start motor immediately
    int motor_result = digitalWrite(motor_IN3, HIGH);
    
    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = right_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = right_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread

    return motor_result;
}

// Turn on right lights
int blink_right_lights() {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;

    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = right_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = right_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread

    return 0;
}

// Turn on left lights
int blink_left_lights() {
    // Reset stop flag to allow new blinks
    stop_blink_flag = 0;

    // Start LEDs blink in separate thread (non-blocking)
    pthread_t blink_thread_id1;
    blink_params_t* params = malloc(sizeof(blink_params_t));
    params->gpio = left_led1;
    params->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params->duration = 4.0;  // Durante 4 segundos

    pthread_t blink_thread_id2;
    blink_params_t* params2 = malloc(sizeof(blink_params_t));
    params2->gpio = left_led2;
    params2->freq = 0.5;  // 0.5 Hz = blink cada 1 segundos
    params2->duration = 4.0;  // Durante 4 segundos

    pthread_create(&blink_thread_id1, NULL, blink_thread, params);
    pthread_detach(blink_thread_id1);  // No necesitamos esperar al thread

    pthread_create(&blink_thread_id2, NULL, blink_thread, params2);
    pthread_detach(blink_thread_id2);  // No necesitamos esperar al thread

    return 0;
}

// Stop everything
int stop() {
    // Set flag to stop all blink threads
    stop_blink_flag = 1;
    
    // Wait a bit for threads to stop
    usleep(50000);  // Wait 50ms
    
    // Turn off all pins
    int result = digitalWrite(motor_IN3, LOW) | digitalWrite(motor_IN4, LOW) |
                 digitalWrite(left_led1, LOW) | digitalWrite(right_led1, LOW) |
                 digitalWrite(left_led2, LOW) | digitalWrite(right_led2, LOW) |
                 digitalWrite(motor_IN1, LOW) | digitalWrite(motor_IN2, LOW);
    
    // Reset flag for future blinks
    stop_blink_flag = 0;
    
    return result;
}