
#include <gpio.h>
#include <stdio.h>
#include <stdlib.h>  // Para atoi(), atof()
#include <string.h>  // Para strcmp()
#include <unistd.h>  // Para sleep()

// Probar biblioteca GPIO con comandos simples
// Uso: ./gpio_test <pin> <mode> <value> [frecuencia] [duracion]
// Ejemplos:
//   ./gpio_test 12 out 1        - Pone pin 12 en HIGH
//   ./gpio_test 12 out 0        - Pone pin 12 en LOW  
//   ./gpio_test 18 in           - Lee el estado del pin 18
//   ./gpio_test 17 blink 2 5    - Parpadea pin 17 a 2Hz por 5 segundos
int main(int argc, char *argv[]) {
    
    // Verificar argumentos mínimos
    if (argc < 3) {
        printf("Uso: %s <pin> <mode> [value] [freq] [duration]\n", argv[0]);
        printf("Modos:\n");
        printf("  in           - Leer pin como entrada\n");
        printf("  out <0|1>    - Escribir 0 o 1 al pin\n");
        printf("  blink <freq> <duration> - Parpadear pin\n");
        printf("Ejemplos:\n");
        printf("  %s 12 out 1\n", argv[0]);
        printf("  %s 18 in\n", argv[0]);
        printf("  %s 17 blink 2 5\n", argv[0]);
        return 1;
    }

    // Obtener parámetros
    int pin = atoi(argv[1]);           // Convertir string a int
    char *mode = argv[2];              // Modo: "in", "out", "blink"
    
    printf("Pin: %d, Modo: %s\n", pin, mode);

    if (strcmp(mode, "in") == 0) {
        // Modo INPUT - Leer pin
        GPIOPin input_pin = pinMode(pin, INPUT);
        if (input_pin.fd_line < 0) {
            printf("Error: No se pudo configurar pin %d como entrada\n", pin);
            return 1;
        }
        
        int value = digitalRead(&input_pin);
        printf("Estado del pin %d: %s\n", pin, value ? "HIGH" : "LOW");
        
        // Cerrar recursos
        close(input_pin.fd_line);
        close(input_pin.fd_chip);
        
    } else if (strcmp(mode, "out") == 0) {
        // Modo OUTPUT - Escribir pin
        if (argc < 4) {
            printf("Error: Falta valor para modo 'out' (0 o 1)\n");
            return 1;
        }
        
        int value = atoi(argv[3]);     // 0 o 1
        GPIOPin output_pin = pinMode(pin, OUTPUT);
        
        if (output_pin.fd_line < 0) {
            printf("Error: No se pudo configurar pin %d como salida\n", pin);
            return 1;
        }
        
        gpio_result_t result = digitalWrite(&output_pin, value ? HIGH : LOW);
        printf("Pin %d puesto en %s\n", pin, value ? "HIGH" : "LOW");
        
        // Cerrar recursos
        close(output_pin.fd_line);
        close(output_pin.fd_chip);
        
    } else if (strcmp(mode, "blink") == 0) {
        // Modo BLINK - Parpadear pin
        if (argc < 5) {
            printf("Error: Faltan parámetros para 'blink' (frecuencia y duración)\n");
            return 1;
        }
        
        float freq = atof(argv[3]);      // Frecuencia en Hz
        float duration = atof(argv[4]);  // Duración en segundos
        
        GPIOPin blink_pin = pinMode(pin, OUTPUT);
        if (blink_pin.fd_line < 0) {
            printf("Error: No se pudo configurar pin %d para blink\n", pin);
            return 1;
        }
        
        printf("Parpadeando pin %d a %.1fHz por %.1f segundos...\n", pin, freq, duration);
        gpio_result_t result = blink(&blink_pin, freq, duration);
        printf("Blink completado\n");
        
        // Cerrar recursos
        close(blink_pin.fd_line);
        close(blink_pin.fd_chip);
        
    } else {
        printf("Error: Modo '%s' no reconocido. Use 'in', 'out' o 'blink'\n", mode);
        return 1;
    }

    return 0;
}