// app/tests/test_calculator.cpp
#include <gtest/gtest.h>
#include "../app/calculator.hpp"

TEST(AddTest, NormalToplama) {
    Calculator calc;
    int result = calc.Add(2, 3);
    EXPECT_EQ(result, 5); // Doğru sonuç olmalıdır, ancak şu anda 6 olarak hesaplanıyor.
}