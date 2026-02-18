# ─── 1. AŞAMA: DERLEME ───
FROM ubuntu:24.04 AS builder

RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    git \
    lcov \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN rm -rf build && mkdir build && cd build && cmake .. && cmake --build .

# ─── 2. AŞAMA: TEST ───
FROM builder AS tester

RUN mkdir -p /app/test-results /app/coverage

RUN cd build && ./calculator_tests --gtest_output=xml:/app/test-results/test_results.xml

RUN cd build && \
    lcov --capture --directory . --output-file /app/coverage/coverage.info --ignore-errors mismatch && \
    lcov --remove /app/coverage/coverage.info '/usr/*' '*/googletest/*' '*/build/*' --output-file /app/coverage/coverage_filtered.info --ignore-errors unused && \
    genhtml /app/coverage/coverage_filtered.info --output-directory /app/coverage/html

# ─── 3. AŞAMA: ÇALIŞMA ───
FROM ubuntu:24.04 AS runner

WORKDIR /app
COPY --from=builder /app/build/calculator .

CMD ["./calculator"]