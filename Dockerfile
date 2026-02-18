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

# Derle (build klasörü varsa sil, yoksa oluştur)
RUN rm -rf build && mkdir build && cd build && cmake .. && cmake --build .

# ─── 2. AŞAMA: TEST ───
FROM builder AS tester

# Testleri çalıştır
RUN cd build && ./calculator_tests

# ─── 3. AŞAMA: ÇALIŞMA ───
FROM ubuntu:24.04 AS runner

WORKDIR /app
COPY --from=builder /app/build/calculator .

CMD ["./calculator"]