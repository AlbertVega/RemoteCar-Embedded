

// Definiciones de tipos
typedef enum {
    INPUT = 0,
    OUTPUT = 1,
} pinMode_t;

typedef enum {
    LOW = 0,
    HIGH = 1,
} pinValue_t;

typedef enum {
    GPIO_SUCCESS = 1,
    GPIO_ERROR_INVALID_PIN = -1,
    GPIO_ERROR_INVALID_FREQ = -2,
    GPIO_ERROR_INVALID_DURATION = -3
} gpio_result_t;

typedef struct {
    int fd_chip;      // chip
    int fd_line;      // línea
    int pin;          // GPIO (line offset)
    int is_output;    // salida/entrada
} GPIOPin;


// Funciones
GPIOPin pinMode(unsigned int pin, pinMode_t mode);
gpio_result_t digitalWrite(GPIOPin *gpio, pinValue_t value);
int digitalRead(GPIOPin *gpio);
gpio_result_t blink(GPIOPin *gpio, float freq, float duration);