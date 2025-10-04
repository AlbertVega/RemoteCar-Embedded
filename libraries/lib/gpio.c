
#include <gpio.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>  // Para strncmp()
#include <sys/types.h> // Para tipos estándar
#include <sys/time.h>  // Para useconds_t
#include <fcntl.h> // Para access()
#include <linux/gpio.h>
#include <sys/ioctl.h>
#include <stdlib.h> // Para exit()

#define GPIOCHIP "/dev/gpiochip0"


// Funcion para configurar el modo de un pin GPIO
GPIOPin pinMode(unsigned int pin, pinMode_t mode) {
    GPIOPin gpio;
    memset(&gpio, 0, sizeof(GPIOPin));
    gpio.pin = pin;
    gpio.is_output = (mode == OUTPUT); // 1 = OUTPUT, 0 = INPUT

    gpio.fd_chip = open(GPIOCHIP, O_RDWR);
    if (gpio.fd_chip < 0) {
        perror("open gpiochip");
        exit(1);
    }

    struct gpiohandle_request req;
    memset(&req, 0, sizeof(req));
    req.lineoffsets[0] = pin;
    req.lines = 1;
    strcpy(req.consumer_label, "gpio_api");

    if (gpio.is_output) {
        req.flags = GPIOHANDLE_REQUEST_OUTPUT;
        req.default_values[0] = 0;
    } else {
        req.flags = GPIOHANDLE_REQUEST_INPUT;
    }

    if (ioctl(gpio.fd_chip, GPIO_GET_LINEHANDLE_IOCTL, &req) < 0) {
        perror("GPIO_GET_LINEHANDLE_IOCTL");
        exit(1);
    }

    gpio.fd_line = req.fd;
    return gpio;
}

// Funcion para escribir un valor digital en un pin GPIO
gpio_result_t digitalWrite(GPIOPin *gpio, pinValue_t value) {
    if (!gpio->is_output) {
        fprintf(stderr, "Error: pin %d no está en modo salida\n", gpio->pin);
        return GPIO_ERROR_INVALID_PIN;
    }

    struct gpiohandle_data data;
    data.values[0] = value == HIGH ? 1 : 0;

    if (ioctl(gpio->fd_line, GPIOHANDLE_SET_LINE_VALUES_IOCTL, &data) < 0) {
        perror("GPIOHANDLE_SET_LINE_VALUES_IOCTL");
        return GPIO_ERROR_INVALID_PIN;
    }
}

// Funcion para leer un valor digital de un pin GPIO
int digitalRead(GPIOPin *gpio) {
    if (gpio->is_output) {
        fprintf(stderr, "Error: pin %d no está en modo entrada\n", gpio->pin);
        return GPIO_ERROR_INVALID_PIN;
    }

    struct gpiohandle_data data;
    if (ioctl(gpio->fd_line, GPIOHANDLE_GET_LINE_VALUES_IOCTL, &data) < 0) {
        perror("GPIOHANDLE_GET_LINE_VALUES_IOCTL");
        return GPIO_ERROR_INVALID_PIN;
    }

    return data.values[0];
}

// Funcion para hacer parpadear un pin GPIO
gpio_result_t blink(GPIOPin *gpio, float freq, float duration) {
    if (!gpio->is_output) {
        fprintf(stderr, "Error: pin %d no está en modo salida\n", gpio->pin);
        return GPIO_ERROR_INVALID_PIN;
    }
    if (freq <= 0) {
        return GPIO_ERROR_INVALID_FREQ;
    }
    if (duration <= 0) {
        return GPIO_ERROR_INVALID_DURATION;
    }

    float period = 1.0f / freq; // Periodo en segundos
    unsigned int half_period_us = (unsigned int)((period / 2) * 1000000); // Microsegundos
    unsigned int total_cycles = (unsigned int)(duration * freq);
    for (unsigned int i = 0; i < total_cycles; i++) {
        digitalWrite(gpio, HIGH);
        usleep(half_period_us);
        digitalWrite(gpio, LOW);
        usleep(half_period_us);
    }

    return GPIO_SUCCESS;
}

/*
 * Raspberry Pi 4 GPIO pins (BCM numbering) disponibles para uso general
 * 
 * Precaución: Algunos pines tienen funciones especiales (I2C, SPI, UART, PWM),
 * si los usas asegúrate de que no interfieran con tu hardware.
 *
 * Pin físico (header 40) -> GPIO BCM -> Comentarios
 *
 * 7   -> 4    : GPIO, seguro para uso general
 * 11  -> 17   : GPIO, seguro
 * 12  -> 18   : GPIO / PWM0
 * 13  -> 27   : GPIO
 * 15  -> 22   : GPIO
 * 16  -> 23   : GPIO
 * 18  -> 24   : GPIO / PWM1
 * 29  -> 5    : GPIO
 * 31  -> 6    : GPIO
 * 32  -> 12   : GPIO / PWM0
 * 33  -> 13   : GPIO / PWM1
 * 35  -> 19   : GPIO / PCM
 * 36  -> 16   : GPIO
 * 37  -> 26   : GPIO
 * 38  -> 20   : GPIO / PCM
 * 40  -> 21   : GPIO / PCM
 *
 * Otros pines físicos (3, 5, 8, 10, 19, 21, 23, 24, 26, 27, 28) pueden usarse
 * como GPIO, pero están asociados a interfaces especiales:
 * - 3 / 5   : I2C (SDA1 / SCL1)
 * - 8 / 10 / 19 / 21 / 23 / 24 / 26 : SPI
 * - 14 / 15 : UART
 * - 27 / 28 : EEPROM ID
 *
 * GND, 3.3V y 5V no son GPIO y no deben exportarse.xxx
 */
