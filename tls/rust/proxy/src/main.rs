use hack_source::SourceConfig;

use bytes::BytesMut;
use env_logger::Env;
use eyre::eyre;
use futures::stream::{self, SplitStream, StreamExt};
use futures::{SinkExt, Stream};
use futures_util::sink::Close;
use std::{
    env,
    io::Error,
    net::SocketAddr,
    pin::Pin,
    task::{Context, Poll},
};
use tokio::{
    io::{ReadHalf, WriteHalf},
    net::{TcpListener, TcpStream},
};
use tokio_tungstenite::WebSocketStream;
use tokio_util::codec::{BytesCodec, FramedRead, FramedWrite};
use tungstenite::{error::Error as WsError, Message};
use url::Url;

const ENV_VAR_PORT: &str = "PORT";

const DEFAULT_ADDR: &str = "0.0.0.0";
const DEFAULT_PORT: &str = "7000";

#[tokio::main]
async fn main() -> eyre::Result<()> {
    env_logger::init_from_env(Env::new().default_filter_or("info"));

    let port = env::var(ENV_VAR_PORT).unwrap_or(DEFAULT_PORT.to_string());
    let addr = format!("{DEFAULT_ADDR}:{port}");
    log::info!("starting server on {addr}");

    let listener = TcpListener::bind(&addr)
        .await
        .map_err(|e| eyre!("failed to instantiate TCP listener: {e:?}"))?;
    log::info!("listening for WebSocket connections on {addr}");

    let source_config = SourceConfig::default();

    loop {
        let tcp_stream = match listener.accept().await {
            Err(e) => {
                log::error!("failed to accept socket: {e:?}");
                continue;
            }
            Ok((stream, _)) => stream,
        };

        let sock_addr = match tcp_stream.peer_addr() {
            Err(e) => {
                log::error!("failed to get peer address: {e:?}");
                continue;
            }
            Ok(addr) => addr,
        };
        log::info!("accepted connection from {sock_addr:?}");

        tokio::spawn(accept_conn(source_config.clone(), tcp_stream, sock_addr));
    }
}

pub async fn accept_conn(
    source_config: SourceConfig,
    tcp_stream: TcpStream,
    sock_addr: SocketAddr,
) {
    match handle_conn(source_config, tcp_stream, sock_addr).await {
        Err(e) => log::error!("[{sock_addr}] connection handling failed: {e:?}"),
        Ok(_) => log::info!("[{sock_addr}] connection handling succeeded"),
    };
}

async fn handle_conn(
    source_config: SourceConfig,
    tcp_stream: TcpStream,
    sock_addr: SocketAddr,
) -> eyre::Result<()> {
    let ws_stream = tokio_tungstenite::accept_async(tcp_stream)
        .await
        .map_err(|e| eyre!("failed to accept WebSocket connection: {e:?}"))?;
    log::info!("[{sock_addr}] accepted WebSocket connection");

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    let msg = ws_receiver
        .next()
        .await
        .ok_or_else(|| eyre!("failed to receive target URL message"))?
        .map_err(|e| eyre!("failed to receive target URL message: {e:?}"))?;

    let msg = if let Message::Binary(bytes) = msg {
        bytes
    } else {
        return Err(eyre!("received unexpected target URL message type"));
    };

    let url: String = serde_json::from_slice(&msg)
        .map_err(|e| eyre!("failed to serde-parse URL from bytes: {e:?}"))?;

    if !source_config.is_supported_source_url(&url) {
        return Err(eyre!("unsupported source URL: {url:?}"));
    }

    let url = Url::parse(&url).map_err(|e| eyre!("failed to parse URL from string: {}", e))?;
    log::debug!("[{sock_addr}] target URL: {url:?}");

    let target_host = url
        .host_str()
        .ok_or_else(|| eyre!("target URL has no host"))?;
    let target_port = url
        .port_or_known_default()
        .ok_or_else(|| eyre!("target URL has no port"))?;
    let target_addr = format!("{target_host}:{target_port}");
    log::debug!("[{sock_addr}] target address: {target_addr}");

    let target_tcp_stream = TcpStream::connect(&target_addr)
        .await
        .map_err(|e| eyre!("failed to connect to target {target_addr}: {e:?}"))?;

    let (target_tcp_receiver, target_tcp_sender) = tokio::io::split(target_tcp_stream);
    let mut target_tcp_sender = FramedWrite::new(target_tcp_sender, BytesCodec::new());

    let mut proxy_stream = ProxyStream::new(
        ws_receiver,
        FramedRead::new(target_tcp_receiver, BytesCodec::new()),
    );

    let mut is_tcp_closed = false;
    let mut is_ws_closed = false;
    while let Some(event) = proxy_stream.next().await {
        if is_tcp_closed && is_ws_closed {
            break;
        }

        match event {
            ProxyEvent::WebSocketRead(buffer) => {
                let len = buffer.len();
                log::debug!("[{sock_addr}] received from websocket, len: {len}",);

                if is_tcp_closed {
                    log::debug!("[{sock_addr}] can't forward to tcp: tcp is closed",);
                    continue;
                }

                target_tcp_sender
                    .send(BytesMut::from(buffer.as_slice()))
                    .await
                    .map_err(|e| eyre!("failed to send to tcp: {e:?}",))?;
                log::debug!("[{sock_addr}] sent to tcp, len: {len}");
            }

            ProxyEvent::TcpRead(buffer) => {
                let len = buffer.len();
                log::debug!("[{sock_addr}] received from tcp, len: {len}");

                if is_ws_closed {
                    log::debug!("[{sock_addr}] can't forward to websocket: websocket is closed",);
                    continue;
                }

                ws_sender
                    .send(Message::Binary(buffer))
                    .await
                    .map_err(|e| eyre!("failed to send to websocket: {e:?}",))?;
                log::debug!("[{sock_addr}] sent to websocket, len: {len}");
            }

            ProxyEvent::TcpClosed => {
                log::debug!("[{sock_addr}] tcp receiver closed");
                is_tcp_closed = true;
                if is_tcp_closed && is_ws_closed {
                    break;
                }
            }

            ProxyEvent::WebSocketClosed => {
                log::debug!("[{sock_addr}] websocket receiver closed");
                is_ws_closed = true;
                if is_tcp_closed && is_ws_closed {
                    break;
                }
            }
        }
    }

    let target_tcp_close: Close<'_, FramedWrite<WriteHalf<TcpStream>, BytesCodec>, BytesMut> =
        target_tcp_sender.close();
    target_tcp_close
        .await
        .map_err(|e| eyre!("failed to close tcp sender: {e:?}"))?;
    log::debug!("[{sock_addr}] tcp sender closed");

    ws_sender
        .close()
        .await
        .map_err(|e| eyre!("failed to close websocket sender: {e:?}"))?;
    log::debug!("[{sock_addr}] websocket sender closed");

    log::debug!("[{sock_addr}] connection closed");

    Ok(())
}

pub enum ProxyEvent {
    WebSocketClosed,
    WebSocketRead(Vec<u8>),
    TcpClosed,
    TcpRead(Vec<u8>),
}

pub struct ProxyStream {
    events: Pin<Box<dyn Stream<Item = ProxyEvent> + Send>>,
}

fn ws_receiver_adapter<S>(stream: S) -> impl Stream<Item = ProxyEvent>
where
    S: Stream<Item = Result<Message, WsError>>,
{
    stream.map(|msg| match msg {
        Err(e) => {
            log::error!("ws stream: error: {e:?}");
            ProxyEvent::WebSocketClosed
        }
        Ok(msg) => match msg {
            Message::Binary(buffer) => ProxyEvent::WebSocketRead(buffer),
            Message::Text(txt) => ProxyEvent::WebSocketRead(txt.into_bytes()),
            Message::Close(_) => ProxyEvent::WebSocketClosed,
            other => {
                log::error!("ws stream: unexpected message: {other:?}");
                ProxyEvent::WebSocketClosed
            }
        },
    })
}

fn tcp_receiver_adapter<S>(stream: S) -> impl Stream<Item = ProxyEvent>
where
    S: Stream<Item = Result<BytesMut, Error>>,
{
    stream.map(|res| match res {
        Err(e) => {
            log::debug!("tcp stream: error: {e:?}");
            ProxyEvent::TcpClosed
        }
        Ok(bytes_mut) => ProxyEvent::TcpRead(bytes_mut.to_vec()),
    })
}

impl ProxyStream {
    pub fn new(
        ws_receiver: SplitStream<WebSocketStream<TcpStream>>,
        tcp_receiver: FramedRead<ReadHalf<TcpStream>, BytesCodec>,
    ) -> Self {
        ProxyStream {
            events: Box::pin(stream::select(
                tcp_receiver_adapter(tcp_receiver),
                ws_receiver_adapter(ws_receiver),
            )),
        }
    }
}

impl Stream for ProxyStream {
    type Item = ProxyEvent;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.events.poll_next_unpin(cx)
    }
}
