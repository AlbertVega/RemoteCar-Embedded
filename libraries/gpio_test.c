
#include <gpio.h>
#include <stdio.h>
#include <unistd.h>  // Para sleep()

// Probar biblioteca GPIO
int main() {
    // Configura GPIO17 como salida
    GPIOPin led = pinMode(17, 1); // 1 = OUTPUT

    // Blink a 2Hz durante 5 segundos
    blink(&led, 2.0, 5.0);

    // Configura GPIO18 como entrada
    GPIOPin button = pinMode(18, 0); // 0 = INPUT

    printf("Estado de GPIO18: %d\n", digitalRead(&button));

    close(led.fd_line);
    close(button.fd_line);
    close(led.fd_chip);
    close(button.fd_chip);

    return 0;
}