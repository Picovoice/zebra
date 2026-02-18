cmake_minimum_required(VERSION 3.13)
project(zebra_demo)

set(CMAKE_C_STANDARD 99)
set(CMAKE_BUILD_TYPE Release)

include_directories("${PROJECT_SOURCE_DIR}/../../include")

add_executable(zebra_demo zebra_demo.c)

if (NOT WIN32)
    target_link_libraries(zebra_demo dl)
endif()
