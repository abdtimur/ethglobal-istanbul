# NOTE: Run this Dockerfile in the context of the workspace root
# `ethglobal-istanbul/tls/rust/`.

ARG GIT_IMAGE_VERSION=2.40.1
ARG RUST_VERSION=1.73.0
ARG ALPINE_VERSION=3.18


FROM alpine/git:${GIT_IMAGE_VERSION} AS cloner
ARG TLSN_FORK_REPO
ARG TLSN_FORK_REV
WORKDIR /workspace
RUN                                                     \
  git clone "${TLSN_FORK_REPO}" /workspace/tlsn &&      \
  cd /workspace/tlsn &&                                 \
  git checkout "${TLSN_FORK_REV}"
COPY ./notary/notary-config.yml /workspace/notary-config.yml
COPY ./fixture/debug-notary.key /workspace/debug-notary.key


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
    ca-certificates                                              \
    pkgconfig                                                    \
    openssl-dev &&                                               \
  apk add --no-cache --update                                    \
    --repository https://dl-cdn.alpinelinux.org/alpine/edge/main \
    clang17                                                      \
    lld &&                                                       \
  echo "${TIME_ZONE}" > /etc/timezone &&                         \
  cp /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime &&          \
  date &&                                                        \
  rm -rf /var/cache/apk/*
ENV                                    \
  RUSTFLAGS="-C link-arg=-fuse-ld=lld" \
  OPENSSL_DIR="/usr"
COPY --from=cloner /workspace /workspace
WORKDIR /workspace/tlsn/notary-server
ENV NOTARY_BUILD_TARGET=x86_64-unknown-linux-musl
RUN                                                        \
  rustc -vV &&                                             \
  rustup target add ${NOTARY_BUILD_TARGET} &&              \
  cargo build                                              \
    --release                                              \
    --target ${NOTARY_BUILD_TARGET}                        \
    --bin notary_server_ws &&                              \
  cp -v                                                    \
    target/${NOTARY_BUILD_TARGET}/release/notary_server_ws \
    /workspace/notary


FROM scratch
WORKDIR /
COPY --from=builder /user/passwd /etc/passwd
COPY --from=builder /user/group /etc/group
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/timezone /etc/timezone
COPY --from=builder /etc/localtime /etc/localtime
COPY --from=builder /workspace/notary-config.yml /notary-config.yml
COPY --from=builder /workspace/debug-notary.key /debug-notary.key
COPY --from=builder /workspace/notary /notary
USER nobody:nobody
ENTRYPOINT ["/notary", "--config-file", "/notary-config.yml"]
