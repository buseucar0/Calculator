cmake_minimum_required(VERSION 3.14)
project(Calculator LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ─── COVERAGE FLAG'LERİ ───
option(ENABLE_COVERAGE "Enable coverage reporting" ON)

if(ENABLE_COVERAGE)
    add_compile_options(--coverage -O0 -g)
    add_link_options(--coverage)
endif()

# ─── 1. ANA PROGRAM ───
add_executable(calculator
    src/main.cpp
    src/Calculator.cpp
)

# ─── 2. GOOGLE TEST ───
include(FetchContent)

FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)

FetchContent_MakeAvailable(googletest)

# ─── 3. TEST PROGRAMI ───
add_executable(calculator_tests
    tests/test_calculator.cpp
    src/Calculator.cpp
)

target_link_libraries(calculator_tests GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(calculator_tests)