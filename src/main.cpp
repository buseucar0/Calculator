#include <iostream>
#include "Calculator.h"

int main() {
    Calculator calc;
    double a, b;
    char op;

    std::cout << "--- Hesap Makinesi ---" << std::endl;
    std::cout << "Birinci sayiyi giriniz: ";
    std::cin >> a;
    std::cout << "Ikinci sayiyi giriniz: ";
    std::cin >> b;
    std::cout << "Islemi giriniz (+, -, *, /): ";
    std::cin >> op;

    try {
        double result;
        switch (op) {
            case '+': result = calc.add(a, b); break;
            case '-': result = calc.subtract(a, b); break;
            case '*': result = calc.multiply(a, b); break;
            case '/': result = calc.divide(a, b); break;
            default:
                std::cerr << "[HATA] Gecersiz islem: " << op << std::endl;
                return 1;
        }
        std::cout << "Sonuc: " << a << " " << op << " " << b << " = " << result << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "[HATA] " << e.what() << std::endl;
        return 1;
    }

    return 0;
}