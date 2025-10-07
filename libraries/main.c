#include <libwebsockets.h>
#include <string.h>
#include <movement.h>


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
 * @brief Mueve el carro
 * @param command comando de movimiento
 */
void changeMove(char * command){
    if(*command == 'F'){
        stop();
    }else{
        if(*command == 'w'){
            move_forward_pwm(*currSpeed);
        }
        if(*command == 's'){
            move_backward_pwm(*currSpeed);
        }
        if(*command == 'a'){
            move_left_and_go(*currSpeed);
        }
        if(*command == 'd'){
            move_right_and_go(*currSpeed);
        }
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
            changeLightState(message);
        }
    }
    
}

int * isRunning;

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

/* PC
gst-launch-1.0 udpsrc port=8080 caps="application/x-rtp, media=video, encoding-name=JPEG, payload=26" ! rtpjpegdepay ! jpegdec ! autovideosink



*/


/* PI
gst-launch-1.0 v4l2src device=/dev/video0 ! \
    image/jpeg,width=640,height=480,framerate=30/1 ! \
    rtpjpegpay ! \
    udpsink port=8080

*/

void *streamCamera(void *arg){
    system("gst-launch-1.0 v4l2src device=/dev/video0 ! \
    image/jpeg,width=640,height=480,framerate=30/1 ! \
    rtpjpegpay ! \
    udpsink host=10.85.138.244 port=8080");
}

int main(void) {
    setup_defaults(); 
    //Seteo de valores del carro --------------
    currDirection = (char *)malloc(sizeof(char));
    *currDirection = 'F';
    currSpeed = (int *)malloc(sizeof(int));
    *currSpeed = 0;
    isRunning = (int *)malloc(sizeof(int));
    *isRunning = 1;
    // ---------------------------

    //Cámara ------------------

    pthread_t t_camera;
    pthread_attr_t attr;
    if (pthread_create(&t_camera, NULL, streamCamera, NULL) != 0) {
        perror("pthread_create failed");
    }
    if (pthread_detach(t_camera) != 0) {
        perror("pthread_detach failed");
        // Handle error
    }
    // --------------------

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
    *isRunning = 0;
    lws_context_destroy(context);
    free(currDirection);
    free(currSpeed);
    free(isRunning);
    freeThemAll();
    return 0;
}
