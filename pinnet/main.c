#include <libwebsockets.h>
#include <string.h>
#include <signal.h>


/**
 * @brief Dirección del carro. 
 * F: Está quieto
 * w: Adelante
 * a: Atrás
 * s: Derecha
 * d: Izquierda
 */
char * currDirection;
/**
 * @brief Velocidad del carro. 0 - 100
 */
int * currSpeed;
/**
 * @brief Arreglo con el estado de las cuatro luces.
 * 0: Frontal derecha
 * 1: Frontal izquierda
 * 2: Trasera derecha
 * 3: Trasera izquierda 
 */
int * lightsState; 

/***
 * @brief Retorna la velocidad como entero
 * @param mess Puntero al string a numerar
 * @param len longitud del string
 * @return Velocidad como número
 */
int decodeSpeed(char * mess, int len){
    int speed = 0;
    int pow = 1;
    for(int i = len - 1; i > 0; i--){
        speed += (mess[i] - '0')*pow;
        pow *= 10;
    }
    return speed;
}

void changeMove(char * command){
    if(*command == 'F'){
        printf("Stop\n");
    }else{
        printf("Command: %c\n",*command);
    }
}

/**
 * @brief Procesa el comando recibido
 * @param message Puntero del mensaje recibido
 * @param len Longitud del mensaje
 */
void processCommand(char * message, int len){
    if(message[0] == 'v'){
        int speed = decodeSpeed(message, len);
        if(speed != *currSpeed){
            printf("Speed: %d\n", speed);
            *currSpeed = speed;
        }
    }else{
        if (len == 1){//Direcciones simples
            if(message[0] != *currDirection){
                *currDirection = message[0];
                changeMove(currDirection);
            }
        }
        if(len == 2){//Faros
            if(message[1] == 'f'){//Frontal
                printf("Faro Frontal\n");
            }
            if(message[1] == 't'){//Traseros
                printf("Faro Traseros\n");
            }
            if(message[1] == 'i'){//Izquierda
                printf("Faro Izquierda\n");
            }
            if(message[1] == 'd'){//Derecha
                printf("Faro Derecha\n");
            }
        }
    }
    
}

/**
 * @brief Método para captación de eventos
 * @param wsi Puntero del socket
 * @param reason Motivo de porqué se está cayendo en este método
 * @param in Puntero del mensaje
 * @param len longitud del mensaje
 * @return 0 cuando cierra
 */
static int callback_echo(struct lws *wsi, enum lws_callback_reasons reason,
                         void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_ESTABLISHED:
            printf("Client connected\n");
            break;
        case LWS_CALLBACK_RECEIVE:
            processCommand((char *)in, (int)len);
            lws_write(wsi, (unsigned char*)in, len, LWS_WRITE_TEXT);
            break;
        default:
            break;
    }
    return 0;
}

static struct lws_protocols protocols[] = {
    { "echo-protocol", callback_echo, 0, 1024 },
    { NULL, NULL, 0, 0 }
};

int main(void) {
    //Seteo de valores del carro --------------
    currDirection = (char *)malloc(sizeof(char));
    *currDirection = 'F';
    currSpeed = (int *)malloc(sizeof(int));
    *currSpeed = 0;
    lightsState = (int *)malloc(sizeof(int)*4);
    for(int i = 0; i < 4; i++){
        lightsState[i] = 0;
    }
    // ---------------------------
    struct lws_context_creation_info info;
    memset(&info, 0, sizeof(info));
    info.port = 2027;
    info.protocols = protocols;
    info.gid = -1;
    info.uid = -1;

    info.options = 0; 
    info.extensions = NULL; // Deshabilita el permessage-deflate

    struct lws_context *context = lws_create_context(&info);
    if (!context) {
        fprintf(stderr, "Failed to create context\n");
        return 1;
    }
    printf("Server started on port %d\n", 2027);
    while (1) {
        lws_service(context, 1000);
    }
    lws_context_destroy(context);
    free(currDirection);
    free(currSpeed);
    free(lightsState);
    return 0;
}
