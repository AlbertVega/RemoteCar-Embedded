# Proyecto "RemoteCar-Embedded"

## Hardware

## Imagen de Yocto y herramienta de Cross-toolchain
*faltan modificaciones** 
- Abrir terminal en yocto_image/poky-scarthgap-5.0/poky
- Escribir comando `source oe-init-build-env rpi4`
- Deshabilidar restricciones de AppArmor con el siguiente comando: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`
- Escribir comando `bitbake core-image-base`


## Flasheo de imagen

Para flashear la imagen del sistema operativo creado con Yocto, se pueden usar diferentes herramientas, en este caso en específico se usó el Raspberry Pi Imager. A continuación se especifica el paso a paso para hacerlo:

La interfaz del Raspberry Pi Imager luce así:

<img width="683" height="491" alt="image" src="https://github.com/user-attachments/assets/03169f66-c8f4-4350-9863-76c4450325a3" />

1. En `ELEGIR DISPOSITIVO` se selecciona la versión de Raspberry Pi con la que se cuenta, en este caso Raspberry Pi 4.

<img width="683" height="491" alt="image" src="https://github.com/user-attachments/assets/9621d334-c9fc-4c62-b1de-454b30229a93" />

2. En la opción de `ELEGIR SO` se desplaza hasta el final y selecciona la opción "Usar Personalizado".

<img width="683" height="491" alt="image" src="https://github.com/user-attachments/assets/7f47c32e-cbd7-44f9-b8ce-b21ab72c006c" />

3. En la opción `ELEGIR ALMACENAMIENTO` simplemente se selecciona la microSD en la que se va a flashaear el SO.

<img width="683" height="491" alt="image" src="https://github.com/user-attachments/assets/ab81a009-7fad-41e5-a598-0ab9682a04c2" />

4. Luego se debe hacer click en `SIGUIENTE` y aparecerá una ventana emergente preguntando si desea aplicar ajustes de personalización del SO, dar click en `NO` y empezará el proceso de flasheo automáticamente.

Con este proceso realizado correctamente, estará listo el sistema operativo dentro de la microSD, preparada para insertarla dentro de la raspberry.

## Configuración del Wifi

Para esto es importante contar con un cable de red RJ45 para conectarse a la raspberry por ssh y configurar el wifi. Una vez que conecte la Raspberry a la PC por USB C a la PC, encenderla y conectar el cable de red, es ncesario seguir los siguientes pasos:

1. Identificar la IP de la raspberry, para esto puede conectarse a la página de configuración del router de su servicio de internet y ver los dispositivos conectados, debería aparecer como `raspberrypi4`, obtener y guardar la dirección IP.
2. Conectarse a la Raspberry por SSH, para esto poner en la terminal de ubuntu el siguiente comando (reemplazar `<ip_raspberry>` por la ip de la raspberry correspondiente):
```
ssh root@<ip_raspberry>
```
4. En caso de aparecer un mensaje como el siguiente:

<img width="814" height="360" alt="image" src="https://github.com/user-attachments/assets/1a443910-d548-4f77-bf48-bdbc7bc69193" />

Se debe correr el comando (reemplazar `<ip_raspberry>` por la ip de la raspberry correspondiente):
```
ssh-keygen -R <ip_raspberry>
```
Y luego volver a ingresar el comando anterior del paso 2.

5. Si la conexión fue exitosa deberá ver lo siguiente en la consola:

<img width="819" height="127" alt="image" src="https://github.com/user-attachments/assets/f3014dfa-b146-4849-8610-93c3590a2704" />

6. Una vez conectado es hora de configurar el wifi, para esto se utilizará la herramienta connmanctl. Entonces ingresar el comando `connmanctl ....`
7. A continuación, se verifica la habilitación de la conexión utilizando el comando:
```
enable wifi
```
El comando debería retornar el siguiente texto: 
```
Enabled wifi
```
8. Con la opción habilitada, se ingresa el comando para realizar un escaneo de la red wifi, el cual se da como:
```
scan wifi
```
Esperar hasta que aparezca en la terminal: 
```
Scan completed for wifi
```
9. Desplegar la lista de redes a las que se puede acceder, tras escribir `services` en la terminal. En la lista, se debería encontrar la red wifi a la que se desea conectar.
10. Se activa la interacción de credenciales de Connman con:
    ```
    agent on
    ```
Sin este comando, puede fallar el registro a una red debido a que no tiene como interactuar con el usuario para solicitar la contraseña. 
11.Acto seguido, se realiza la conexión a la red, con el comando: 
```
connect wifi_<codigo_red>
```
Nota: el código de red es el que se encuentra a la derecha, consecutivo a los nombres de las redes. Por ejemplo: 
```
Red_Personal              wifi_dcd645412fb_4g2hsdasdsmn_managed_psk
```
entonces, el comando de connect sería: 
```
connect wifi_dcd645412fb_4g2hsdasdsmn_managed_psk
```
11. Para verificar que la conexión ha sido exitosa, simplemente se volverá a emplear el comando `services`, y antes del nombre de la red, deberá aparecer las siglas `*AR` que significan que la red está lista, seleccionada y asociada al dispositivo. 
