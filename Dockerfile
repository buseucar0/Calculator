# ─── 1. AŞAMA: DERLEME ───
FROM ubuntu:24.04 AS builder

# Gerekli araçları kur
RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Proje dosyalarını kopyala
WORKDIR /app
COPY . .

# Derle
RUN rm -rf build && mkdir build && cd build && cmake .. && cmake --build .

# ─── 2. AŞAMA: TEST ───
FROM builder AS tester

# Test sonuçları için klasör oluştur
RUN mkdir -p /app/test-results

# Testleri çalıştır ve XML rapor üret
RUN cd build && ./calculator_tests --gtest_output=xml:/app/test-results/test_results.xml

# ─── 3. AŞAMA: ÇALIŞMA ───
FROM ubuntu:24.04 AS runner

WORKDIR /app
COPY --from=builder /app/build/calculator .

CMD ["./calculator"]