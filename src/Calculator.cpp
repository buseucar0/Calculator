#include "Calculator.h"

double Calculator::validateResult(double result) {
    double absResult = std::abs(result);

    if (absResult > 1000) {
        throw std::out_of_range("Sonuc 1000'den buyuk!");
    }
    if (absResult < 0.001 && result != 0) {
        throw std::out_of_range("Sonuc 0.001'den kucuk!");
    }
    return result;
}

double Calculator::add(double a, double b) {
    return validateResult(a + b);
}

double Calculator::subtract(double a, double b) {
    return validateResult(a - b);
}

double Calculator::multiply(double a, double b) {
    return validateResult(a * b);
}

double Calculator::divide(double a, double b) {
    if (b == 0) {
        throw std::invalid_argument("Sifira bolme hatasi!");
    }
    return validateResult(a / b);
}