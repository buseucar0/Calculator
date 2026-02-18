# 🧮 Calculator CI/CD Projesi

Bu proje, bir C++ hesap makinesi uygulamasının modern DevOps pratikleriyle nasıl geliştirileceğini göstermektedir.

## 📁 Proje Yapısı

```
Calculator/
├── src/
│   ├── main.cpp          # Ana program
│   ├── Calculator.cpp    # Hesap makinesi implementasyonu
│   └── Calculator.h      # Header dosyası
├── tests/
│   └── test_calculator.cpp  # Google Test ile unit testler
├── CMakeLists.txt        # CMake yapılandırması
├── Dockerfile            # Docker yapılandırması
├── Jenkinsfile           # CI/CD pipeline tanımı
└── README.md             # Bu dosya
```

## 🛠️ Kullanılan Teknolojiler

### C++17
Projenin yazıldığı programlama dili. C++17, modern C++ özelliklerini (structured bindings, if constexpr vb.) sunar.

### CMake
C++ projelerini derlemek için kullanılan yapılandırma aracı. `CMakeLists.txt` dosyası şunları tanımlar:
- Kaynak dosyalar
- Bağımlılıklar
- Derleme seçenekleri (coverage flag'leri dahil)

### Google Test (GTest)
C++ için unit test framework'ü. Her fonksiyonun doğru çalışıp çalışmadığını test eder.
```cpp
TEST(CalculatorTest, Addition) {
    Calculator calc;
    EXPECT_EQ(calc.add(2, 3), 5);
}
```

### Docker
Uygulamayı ve tüm bağımlılıklarını bir container içinde paketler. 3 aşamalı build kullanılır:
- **builder** → Derleme
- **tester** → Test + Coverage
- **runner** → Çalışma ortamı

### Jenkins
CI/CD (Continuous Integration / Continuous Delivery) aracı. Her `git push` sonrası otomatik olarak:
1. Kodu derler
2. Testleri çalıştırır
3. Coverage raporu üretir
4. Sonuçları raporlar

### ngrok
Jenkins yerel makinede çalıştığından GitHub'ın ona ulaşması için ngrok kullanılır. ngrok, yerel portu (8080) internete açar.
```
GitHub → ngrok → localhost:8080 (Jenkins)
```

### gcov + lcov
**Code Coverage** aracı. Testlerin kaynak kodun yüzde kaçını çalıştırdığını ölçer.
- `gcov` → Ham coverage verisi üretir
- `lcov` → gcov verisini işler
- `genhtml` → HTML raporu oluşturur

**Coverage Flag'leri:**
```cmake
--coverage   # Her satır çalıştığında kaydet
-O0          # Optimizasyon yapma
-g           # Debug bilgisi ekle
```

### HTML Publisher (Jenkins Plugin)
Jenkins'te lcov tarafından üretilen HTML coverage raporunu görüntülemeye yarar.

## 🔄 CI/CD Pipeline Akışı

```
git push
    ↓
GitHub Webhook tetiklenir
    ↓
ngrok → Jenkins'e iletir
    ↓
Jenkins Pipeline başlar:
    ├── 1. Checkout (kodu al)
    ├── 2. Build & Test (Docker ile derle + test et)
    ├── 3. Extract Reports (raporları çıkar)
    └── 4. Build Final Image (çalışma imajı)
    ↓
Raporlar yayınlanır:
    ├── JUnit Test Raporu
    └── Coverage HTML Raporu
```

## 🧪 Test Raporu
Jenkins'te her build sonrası:
- Kaç test geçti / başarısız
- Test süreleri
- Zaman içindeki trend

## 📊 Coverage Raporu
Her build sonrası kodun yüzde kaçının test edildiği gösterilir:
```
src/Calculator.cpp → %87 ✅
src/main.cpp       → %45 ⚠️
```

## 🚀 Nasıl Çalıştırılır?

### Lokal Derleme
```bash
mkdir build && cd build
cmake ..
cmake --build .
./calculator
```

### Testleri Çalıştır
```bash
cd build
./calculator_tests
```

### Docker ile Çalıştır
```bash
docker build --target runner -t calculator .
docker run calculator
```