cmake_minimum_required (VERSION 2.6)

# Cross-compilación: usar toolchain de Yocto
# Para usar: cmake -DCMAKE_TOOLCHAIN_FILE=<path-to-yocto-toolchain> ..
# No configurar compilador aquí, el toolchain lo maneja



#define the project
project (carcontrol)

#add lib subdirectory to build
add_subdirectory (lib)

#include directories to building path
include_directories(${PROJECT_SOURCE_DIR}/include)
include_directories(${PROJECT_SOURCE_DIR}/lib)

# add the executable
add_executable (gpio_test gpio_test.c)
add_executable(control control.c)
add_executable(comms comms.c)
add_executable(main main.c)

#link against required libraries
target_link_libraries(gpio_test gpio)
target_link_libraries(control gpio movement)
link_directories(/usr/lib/x86_64-linux-gnu)
target_link_libraries(comms websockets)
target_link_libraries(main websockets movement)

#install the binary
install (TARGETS gpio_test DESTINATION bin)
install (TARGETS control DESTINATION bin)
install (TARGETS comms DESTINATION bin)
install (TARGETS main DESTINATION bin)


#package source generation
set(MAJOR "1")
set(MINOR "0")
set(PATCH "1")
set(CPACK_SOURCE_GENERATOR "TGZ")
set(CPACK_SOURCE_PACKAGE_FILE_NAME "${CMAKE_PROJECT_NAME}-${MAJOR}.${MINOR}.${PATCH}")
set(CPACK_SOURCE_IGNORE_FILES "/build/;${CPACK_SOURCE_IGNORE_FILES}")
include(CPack)
