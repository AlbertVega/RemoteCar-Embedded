#include <libwebsockets.h>
#include <string.h>
#include <signal.h>

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

/**
 * @brief Ejecuta el comando recibido
 * @param message Puntero del mensaje recibido
 * @param len Longitud del mensaje
 */
void executeCommand(char * message, int len){
    if(message[0] == 'v'){
        int speed = decodeSpeed(message, len);
        printf("Speed: %d\n", speed);
    }else{
        if (len == 1){//Direcciones simples
            if(message[0] == 'F'){
                printf("PARA\n");
            }
            if(message[0] == 'w'){//Adelante
                printf("Adelante\n");
            }
            if(message[0] == 's'){//Atrás
                printf("Atrás\n");
            }
            if(message[0] == 'a'){//Izquierda
                printf("Izquierda\n");
            }
            if(message[0] == 'd'){//Derecha
                printf("Derecha\n");
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
            executeCommand((char *)in, (int)len);
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
    return 0;
}
