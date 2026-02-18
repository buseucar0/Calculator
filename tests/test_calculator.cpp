#include <gtest/gtest.h>
#include "../src/Calculator.h"

// ═══════════════════════════════════════
// 1. TOPLAMA TESTLERİ
// ═══════════════════════════════════════

TEST(AddTest, NormalToplama) {
    Calculator calc;
    EXPECT_EQ(calc.add(10, 5), 15);
}

TEST(AddTest, NegatifToplama) {
    Calculator calc;
    EXPECT_EQ(calc.add(-3, -7), -10);
}

TEST(AddTest, SifirToplama) {
    Calculator calc;
    EXPECT_EQ(calc.add(0, 0), 0);
}

TEST(AddTest, CokBuyukSonuc) {
    Calculator calc;
    EXPECT_THROW(calc.add(501, 501), std::out_of_range);
}

// ═══════════════════════════════════════
// 2. ÇIKARMA TESTLERİ
// ═══════════════════════════════════════

TEST(SubtractTest, NormalCikarma) {
    Calculator calc;
    EXPECT_EQ(calc.subtract(10, 3), 7);
}

TEST(SubtractTest, NegatifSonuc) {
    Calculator calc;
    EXPECT_EQ(calc.subtract(3, 10), -7);
}

// ═══════════════════════════════════════
// 3. ÇARPMA TESTLERİ
// ═══════════════════════════════════════

TEST(MultiplyTest, NormalCarpma) {
    Calculator calc;
    EXPECT_EQ(calc.multiply(4, 5), 20);
}

TEST(MultiplyTest, SifirCarpma) {
    Calculator calc;
    EXPECT_EQ(calc.multiply(100, 0), 0);
}

TEST(MultiplyTest, CokBuyukSonuc) {
    Calculator calc;
    EXPECT_THROW(calc.multiply(100, 20), std::out_of_range);
}

// ═══════════════════════════════════════
// 4. BÖLME TESTLERİ
// ═══════════════════════════════════════

TEST(DivideTest, NormalBolme) {
    Calculator calc;
    EXPECT_EQ(calc.divide(10, 2), 5);
}

TEST(DivideTest, SifiraBolme) {
    Calculator calc;
    EXPECT_THROW(calc.divide(10, 0), std::invalid_argument);
}

TEST(DivideTest, CokKucukSonuc) {
    Calculator calc;
    EXPECT_THROW(calc.divide(1, 5000), std::out_of_range);
}

// ═══════════════════════════════════════
// 5. SINIR DEĞER TESTLERİ
// ═══════════════════════════════════════

TEST(BoundaryTest, Tam1000) {
    Calculator calc;
    EXPECT_EQ(calc.add(500, 500), 1000);
}

TEST(BoundaryTest, Tam1000Ustu) {
    Calculator calc;
    EXPECT_THROW(calc.add(500, 501), std::out_of_range);
}