use hack_source::SourceConfig;

use env_logger::Env;
use eyre::eyre;
use std::env;
use tokio::net::TcpListener;

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

        // TODO:
        // tokio::spawn(accept_conn(source_config.clone(), tcp_stream, sock_addr));
    }
}
