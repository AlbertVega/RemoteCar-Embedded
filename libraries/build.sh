#!/bin/bash

# Script para compilar con diferentes targets
# Uso: ./build.sh [yocto|native|clean]

# Configuración
YOCTO_SDK="/opt/poky/5.0.12"
YOCTO_TOOLCHAIN="$YOCTO_SDK/sysroots/x86_64-pokysdk-linux/usr/share/cmake/cortexa7t2hf-neon-vfpv4-poky-linux-gnueabi-toolchain.cmake"

case "$1" in
    "yocto"|"cross")
        echo "🚀 Cross-compilando para ARM con Yocto SDK..."
        
        # Verificar que existe el SDK
        if [ ! -f "$YOCTO_TOOLCHAIN" ]; then
            echo "❌ Error: No se encuentra el toolchain de Yocto en:"
            echo "   $YOCTO_TOOLCHAIN"
            echo ""
            echo "💡 Verifica que el SDK esté instalado y ajusta la ruta en este script"
            exit 1
        fi
        
        # Build
        mkdir -p build-arm
        cd build-arm
        
        cmake -DCMAKE_TOOLCHAIN_FILE="$YOCTO_TOOLCHAIN" \
              -DCMAKE_BUILD_TYPE=Release \
              ..
              
        make -j$(nproc)
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Cross-compilación exitosa!"
            echo "📁 Binarios ARM en: build-arm/"
            echo "🔍 Verificar arquitectura:"
            file gpio_test
        fi
        ;;
        
    "native")
        echo "🖥️  Compilando nativo para desarrollo..."
        mkdir -p build-native
        cd build-native
        
        cmake -DCMAKE_BUILD_TYPE=Debug ..
        make -j$(nproc)
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Compilación nativa exitosa!"
            echo "📁 Binarios nativos en: build-native/"
        fi
        ;;
        
    "clean")
        echo "🧹 Limpiando builds..."
        rm -rf build-arm build-native build
        echo "✅ Build directories eliminados"
        ;;
        
    "install")
        if [ -d "build-arm" ]; then
            echo "📦 Instalando binarios ARM..."
            cd build-arm && make install
        else
            echo "❌ No hay build ARM. Ejecuta: $0 yocto"
            exit 1
        fi
        ;;
        
    *)
        echo "🛠️  Script de build para libgpio"
        echo ""
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  yocto   - Cross-compilar para ARM (Raspberry Pi)"
        echo "  native  - Compilar nativo (desarrollo en PC)"
        echo "  clean   - Limpiar todos los builds"
        echo "  install - Instalar binarios ARM"
        echo ""
        echo "Ejemplos:"
        echo "  $0 yocto     # Para Raspberry Pi"
        echo "  $0 native    # Para testing en PC"
        echo ""
        exit 1
        ;;
esac