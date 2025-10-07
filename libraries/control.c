
#include <movement.h>
#include <stdio.h>


// Control with commands in terminal
int main() {
    char command;
    setup_defaults();  // Setup with default pins
    printf("Control de movimiento del carro:\n");
    printf("f: avanzar\n");
    printf("b: retroceder\n");
    printf("l: girar a la izquierda\n");
    printf("r: girar a la derecha\n");
    printf("s: detener\n");
    printf("q: salir\n");

    while (1) {
        printf("Ingrese comando: ");
        scanf(" %c", &command);
        switch (command) {
            case 'f':
                move_forward();
                break;
            case 'b':
                move_backward();
                break;
            case 'l':
                move_left();
                break;
            case 'r':
                move_right();
                break;
            case 's':
                stop();
                break;
            case 'q':
                stop();
                printf("Saliendo...\n");
                return 0;
            default:
                printf("Comando no reconocido. Use f, b, l, r, s o q.\n");
        }
    }
    
    return 0;
}