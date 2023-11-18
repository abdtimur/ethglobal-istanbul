# NOTE: Run this Dockerfile in the context of the workspace root
# `ethglobal-istanbul/tls/rust/`.

ARG RUST_VERSION=1.73.0
ARG ALPINE_VERSION=3.18


FROM rust:${RUST_VERSION}-alpine${ALPINE_VERSION} AS builder
ENV TIME_ZONE=Etc/UTC
RUN                                                       \
  mkdir /user &&                                          \
  echo "nobody:x:65534:65534:nobody:/:" > /user/passwd && \
  echo "nobody:x:65534:" > /user/group
RUN                                                              \
  apk update &&                                                  \
  apk upgrade &&                                                 \
  apk add --no-cache --update                                    \
    tzdata                                                       \
    ca-certificates &&                                           \
  apk add --no-cache --update                                    \
    --repository https://dl-cdn.alpinelinux.org/alpine/edge/main \
    clang17                                                      \
    lld &&                                                       \
  echo "${TIME_ZONE}" > /etc/timezone &&                         \
  cp /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime &&          \
  date &&                                                        \
  rm -rf /var/cache/apk/*
ENV RUSTFLAGS="-C link-arg=-fuse-ld=lld"
COPY . /workspace
WORKDIR /workspace/verifier
ENV VERIFIER_BUILD_TARGET=x86_64-unknown-linux-musl
RUN                                                              \
  rustc -vV &&                                                   \
  rustup target add ${VERIFIER_BUILD_TARGET} &&                  \
  cargo build                                                    \
    --release                                                    \
    --target ${VERIFIER_BUILD_TARGET} &&                         \
  cp -v                                                          \
    ../target/${VERIFIER_BUILD_TARGET}/release/hack_verifier     \
    /workspace/


FROM scratch
ENV                                   \
  PORT=8080                           \
  RUST_LOG=debug                      \
  NOTARY_PUBKEY=/debug-notary.pub     \
  VERIFIER_SECKEY=/debug-verifier.key
COPY --from=builder /user/passwd /etc/passwd
COPY --from=builder /user/group /etc/group
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/timezone /etc/timezone
COPY --from=builder /etc/localtime /etc/localtime
COPY --from=builder /workspace/fixture/debug-notary.pub /debug-notary.pub
COPY --from=builder /workspace/fixture/debug-verifier.key /debug-verifier.key
COPY --from=builder /workspace/hack_verifier /hack_verifier
USER nobody:nobody
ENTRYPOINT ["/hack_verifier"]
