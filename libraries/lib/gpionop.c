
#include <gpio.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>  // Para strncmp()

// Verificar la existencia de un directorio para un pin GPIO
int directory_exists(unsigned int pin) {
    char path[64];
    snprintf(path, sizeof(path), "/sys/class/gpio/gpio%d", pin);
    return access(path, F_OK) != -1;
}

// Leer la primera línea de un archivo
int read_line_from_file(const char *path, char *buffer, size_t size) {
    FILE *file = fopen(path, "r");
    if (file == NULL) {
        return -1; // Error al abrir el archivo
    }
    if (fgets(buffer, size, file) == NULL) {
        fclose(file);
        return -1; // Error al leer la línea
    }
    fclose(file);
    return 0; // Éxito
}

// Escribir una línea en un archivo
int write_line_to_file(const char *path, const char *line) {
    FILE *file = fopen(path, "w");
    if (file == NULL) {
        return -1; // Error al abrir el archivo
    }
    if (fputs(line, file) == EOF) {
        fclose(file);
        return -1; // Error al escribir la línea
    }
    fclose(file);
    return 0; // Éxito
}

// Funcion para verificar la direccion actual de un pin
gpio_result_t getPinMode(unsigned int pin) {
    if (directory_exists(pin)) {
        char path[64];
        snprintf(path, sizeof(path), "/sys/class/gpio/gpio%d/direction", pin);  
        char buffer[16];
        if (read_line_from_file(path, buffer, sizeof(buffer)) == 0) {
            printf("PIN %d ya se encuentra establecido como: %s\n", pin, buffer);
            if (strncmp(buffer, "out", 3) == 0) {
                return OUTPUT;
            } else if (strncmp(buffer, "in", 2) == 0) {
                return INPUT;
            }
        }
    } else {
        return GPIO_ERROR_INVALID_PIN; // El pin no está exportado
    }
    return GPIO_ERROR_INVALID_PIN; // No se pudo determinar el modo
}

// Funcion para configurar el modo de un pin GPIO
gpio_result_t pinMode(unsigned int pin, pinMode_t mode) {
    if (directory_exists(pin)) {
        printf("PIN %d ya está exportado\n", pin);
    } else {
        // Si no existe, hay que exportarlo
        char pin_str[8];
        snprintf(pin_str, sizeof(pin_str), "%d", pin);
        if (write_line_to_file("/sys/class/gpio/export", pin_str) == 0) {
            printf("PIN %d exportado\n", pin);
        } else {
            return GPIO_ERROR_INVALID_PIN; // Error al exportar
        }
    }

    // Configurar la dirección
    char direction_path[64];
    snprintf(direction_path, sizeof(direction_path), "/sys/class/gpio/gpio%d/direction", pin);
    const char *direction = (mode == OUTPUT) ? "out" : "in";
    if (write_line_to_file(direction_path, direction) == 0) {
        printf("PIN %d configurado como %s\n", pin, direction);
        return GPIO_SUCCESS;
    } else {
        return GPIO_ERROR_INVALID_PIN;
    }
    
}

// Funcion para escribir un valor digital en un pin GPIO
gpio_result_t digitalWrite(unsigned int pin, pinValue_t value) {
    // Vericar que el pin sea output
    if (getPinMode(pin) != OUTPUT) {
        printf("Error: El pin %d no está configurado como OUTPUT\n", pin);
        return GPIO_ERROR_INVALID_PIN;
    }
    char value_path[64];
    snprintf(value_path, sizeof(value_path), "/sys/class/gpio/gpio%d/value", pin);
    const char *value_str = (value == HIGH) ? "1" : "0";
    if (write_line_to_file(value_path, value_str) == 0) {
        printf("PIN %d establecido en %s\n", pin, value_str);
        return GPIO_SUCCESS;
    } else {
        return GPIO_ERROR_INVALID_PIN;
    }
}

// Funcion para leer un valor digital de un pin GPIO
gpio_result_t digitalRead(unsigned int pin) {
    // Vericar que el pin sea input
    if (getPinMode(pin) != INPUT) {
        printf("Error: El pin %d no está configurado como INPUT\n", pin);
        return GPIO_ERROR_INVALID_PIN;
    }
    char value_path[64];
    snprintf(value_path, sizeof(value_path), "/sys/class/gpio/gpio%d/value", pin);
    char buffer[4];
    if (read_line_from_file(value_path, buffer, sizeof(buffer)) == 0) {
        if (strncmp(buffer, "1", 1) == 0) {
            printf("PIN %d leído como HIGH\n", pin);
            return HIGH;
        } else if (strncmp(buffer, "0", 1) == 0) {
            printf("PIN %d leído como LOW\n", pin);
            return LOW;
        }
    }
    return GPIO_ERROR_INVALID_PIN; // Error al leer el valor
    
}

// Funcion para hacer parpadear un pin GPIO
gpio_result_t blink(unsigned int pin, float freq, float duration) {
    // Verificar que el pin sea output
    if (getPinMode(pin) != OUTPUT) {
        printf("Error: El pin %d no está configurado como OUTPUT\n", pin);
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
        digitalWrite(pin, HIGH);
        usleep(half_period_us);
        digitalWrite(pin, LOW);
        usleep(half_period_us);
    }
    return GPIO_SUCCESS;
}

// Funcion para hacer funcionar un PWM por HW en los pines que lo soportan
gpio_result_t configPWM(unsigned int pin, float freq, float dutyCycle) {
    
    printf("Configurando PWM en el pin %d con frecuencia %.2f Hz y ciclo de trabajo %.2f%%\n", pin, freq, dutyCycle * 100);
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
