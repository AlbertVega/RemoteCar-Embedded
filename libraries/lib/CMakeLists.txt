#add include to directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../include)

#set the proper macros
set(GPIO_LIBRARY_NAME gpio)
set(GPIO_SRC_FILES gpio.c)
set(GPIO_INCLUDE_FILES ${CMAKE_CURRENT_SOURCE_DIR}/../include/gpio.h)

set(MOVEMENT_LIBRARY_NAME movement)
set(MOVEMENT_SRC_FILES movement.c)
set(MOVEMENT_INCLUDE_FILES ${CMAKE_CURRENT_SOURCE_DIR}/../include/movement.h)

#add the library
add_library(${GPIO_LIBRARY_NAME} SHARED ${GPIO_SRC_FILES} ${GPIO_INCLUDE_FILES})
add_library(${MOVEMENT_LIBRARY_NAME} SHARED ${MOVEMENT_SRC_FILES} ${MOVEMENT_INCLUDE_FILES})

# Link movement library with gpio and pthread
find_package(Threads REQUIRED)
target_link_libraries(${MOVEMENT_LIBRARY_NAME} ${GPIO_LIBRARY_NAME} Threads::Threads)

#installing the library
install (TARGETS ${GPIO_LIBRARY_NAME} DESTINATION lib)
install (FILES ${GPIO_INCLUDE_FILES} DESTINATION include)

install (TARGETS ${MOVEMENT_LIBRARY_NAME} DESTINATION lib)
install (FILES ${MOVEMENT_INCLUDE_FILES} DESTINATION include)