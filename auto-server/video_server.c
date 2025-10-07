#include <libwebsockets.h>
#include <string.h>

int * startStream;

static int callback_echo(struct lws *wsi, enum lws_callback_reasons reason,
                         void *user, void *in, size_t len) {
    switch (reason) {
        case LWS_CALLBACK_ESTABLISHED:
            system("gst-launch-1.0 udpsrc port=8080 caps=\"application/x-rtp, media=video, encoding-name=JPEG, payload=26\" ! rtpjpegdepay ! jpegdec ! autovideosink");
            *startStream = 1;
            break;
        case LWS_CALLBACK_RECEIVE:
            *startStream = 1;
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

    //Cámara ------------------
    startStream = (int *)malloc(sizeof(int));
    *startStream = 0;
    
    // --------------------

    struct lws_context_creation_info info;
    memset(&info, 0, sizeof(info));
    info.port = 2025;
    info.protocols = protocols;
    info.gid = -1;
    info.uid = -1;

    info.options = 0; 
    info.extensions = NULL; // Deshabilita el permessage-deflate


    struct lws_context *context = lws_create_context(&info);
    if (!context) {
        return 1;
    }
    while (1) {
        lws_service(context, 1000);
    }
    lws_context_destroy(context);
    free(startStream);
    return 0;
}
