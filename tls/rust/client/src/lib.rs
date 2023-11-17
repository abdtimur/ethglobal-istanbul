use async_io_stream::IoStream;
use eyre::eyre;
use futures::channel::oneshot;
use futures_util::{AsyncWriteExt, SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tlsn_core::proof::TlsProof;
use tlsn_prover::tls::{Prover, ProverConfig};
use tlsn_tls_client::RootCertStore;
use tokio_util::compat::FuturesAsyncReadCompatExt;
use url::Url;
use wasm_bindgen::prelude::*;
use web_time::Instant;
use ws_stream_wasm::{WsMessage, WsMeta, WsStreamIo};

// https://github.com/GoogleChromeLabs/wasm-bindgen-rayon#setting-up
pub use wasm_bindgen_rayon::init_thread_pool;

/// Provides `println!(..)`-style syntax for `console.log` logging.
#[macro_export]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

const CA_CERTS: &str = include_str!("../ca-certificates.crt");

#[wasm_bindgen]
pub async fn prover(input_json_str: &str) -> Result<String, JsValue> {
    set_panic_hook();

    let start_time = Instant::now();

    let opts: ProverOpts = serde_json::from_str(input_json_str)
        .map_err(|e| JsValue::from_str(&format!("failed to parse input JSON: {e}")[..]))?;
    log!("parse input JSON OK: {opts:?}");

    let proof_res = prover_internal(opts).await;
    log!("elapsed: {}s", start_time.elapsed().as_secs());

    let proof = proof_res.map_err(|e| JsValue::from_str(&format!("prover failed: {e}")[..]))?;
    log!("obtain proof OK");

    let proof_json_str = serde_json::to_string(&proof).map_err(|e| {
        JsValue::from_str(&format!("failed to serialize final proof content: {e}")[..])
    })?;
    log!("serialize final proof content OK");

    Ok(proof_json_str)
}

async fn prover_internal(opts: ProverOpts) -> eyre::Result<TlsProof> {
    let proxy_io_stream = connect_to_proxy(&opts.env.proxy_address, &opts.input.url)
        .await
        .map_err(|e| eyre!("connect to proxy failed: {e}"))?;

    log!("connect to proxy OK");

    let (notary_io_stream, session_id) =
        connect_to_notary(&opts.env.notary_address, opts.env.max_transcript_size)
            .await
            .map_err(|e| eyre!("connect to notary failed: {e}"))?;

    log!("connect to notary OK");

    let url = Url::parse(&opts.input.url)
        .map_err(|e| eyre!("failed to parse URL ({}): {e}", opts.input.url))?;

    log!("parse URL OK");

    let target_host = url
        .host_str()
        .ok_or_else(|| eyre!("URL has no host: {url}"))?;

    log!("get URL host OK");

    let mut root_cert_store = RootCertStore::empty();
    for pem in CA_CERTS.split("\n\n") {
        let pem = pem.trim();
        if pem.is_empty() {
            continue;
        }
        root_cert_store
            .add_pem(pem)
            .map_err(|e| eyre!("failed to add CA certificate: {e}"))?;
    }

    log!("build root CA certs store OK");

    // Prover config
    let prover_config = ProverConfig::builder()
        .id(session_id)
        .server_dns(target_host)
        .root_cert_store(root_cert_store)
        .max_transcript_size(opts.env.max_transcript_size)
        .build()
        .map_err(|e| eyre!("failed to build prover config: {e}"))?;

    log!("build prover config OK");

    // Create a Prover and set it up with the Notary. This will set up the MPC backend prior to
    // connecting to the server.
    let prover = Prover::new(prover_config)
        .setup(notary_io_stream)
        .await
        .map_err(|e| eyre!("failed to setup prover: {e}"))?;

    log!("create and setup prover OK");

    // Bind the Prover to the server connection. The returned `mpc_tls_conn` is an MPC TLS
    // connection to the Server: all data written to / read from it will be encrypted / decrypted
    // using MPC with the Notary.
    let (mpc_tls_conn, prover_future) = prover
        .connect(proxy_io_stream)
        .await
        .map_err(|e| eyre!("failed to connect prover and proxy: {e}"))?;

    log!("bind prover to server connection OK");

    let (prover_sender, prover_receiver) = oneshot::channel();
    let handled_prover_future = async {
        match prover_future.await {
            Err(e) => panic!("prover future failed: {e}"),
            Ok(prover_result) => match prover_sender.send(prover_result) {
                Err(e) => panic!("failed to send prover result: {e:?}"),
                Ok(()) => {
                    log!("send prover result OK");
                }
            },
        }
    };
    wasm_bindgen_futures::spawn_local(handled_prover_future);

    // Attach the hyper HTTP client to the TLS connection
    let (mut request_sender, conn) = hyper::client::conn::handshake(mpc_tls_conn.compat())
        .await
        .map_err(|e| eyre!("failed to handshake with server: {e}"))?;

    log!("attach HTTP client to TLS connection OK");

    // Spawn the HTTP task to be run concurrently
    let (conn_sender, conn_receiver) = oneshot::channel();
    let conn_future = conn.without_shutdown();
    let handled_conn_future = async {
        match conn_future.await {
            Err(e) => panic!("connection future failed: {e}"),
            Ok(conn_result) => match conn_sender.send(conn_result) {
                Err(e) => panic!("failed to send connection result: {e:?}"),
                Ok(()) => {
                    log!("send connection result OK");
                }
            },
        }
    };
    wasm_bindgen_futures::spawn_local(handled_conn_future);

    log!("starting an MPC TLS connection with the server");

    // TODO:
    Err(eyre::eyre!("not implemented"))
}

async fn connect_to_notary(
    notary_address: &str,
    max_transcript_size: usize,
) -> eyre::Result<(IoStream<WsStreamIo, Vec<u8>>, String)> {
    let (_, mut notary_ws_stream) = WsMeta::connect(notary_address, None)
        .await
        .map_err(|e| eyre!("failed to connect to notary: {e}"))?;

    // Configure notarization
    let payload_json_str = serde_json::to_string(&NotarizationSessionRequest {
        client_type: ClientType::Websocket,
        max_transcript_size: Some(max_transcript_size),
    })
    .map_err(|e| eyre!("failed to serialize configuration request: {e}"))?;

    notary_ws_stream
        .send(WsMessage::Text(payload_json_str))
        .await
        .map_err(|e| eyre!("failed to send configuration request to notary: {e}"))?;

    log!("configuration request sent");

    let message = notary_ws_stream.next().await.ok_or_else(|| {
        eyre!("failed to get configuration response from notary: no message received")
    })?;

    let configuration_response_json_str = match message {
        WsMessage::Text(text) => text,
        WsMessage::Binary(bytes) => String::from_utf8(bytes)
            .map_err(|e| eyre!("failed to parse configuration response to string: {e}"))?,
    };
    let configuration_response =
        serde_json::from_str::<NotarizationSessionResponse>(&configuration_response_json_str)
            .map_err(|e| eyre!("failed to parse configuration response: {e}"))?;

    log!("configuration response: {configuration_response:?}");

    // Request the notary to prepare for notarization
    let session_id = configuration_response.session_id;
    let payload_json_str = serde_json::to_string(&NotarizationRequestQuery {
        session_id: session_id.clone(),
    })
    .map_err(|e| eyre!("failed to serialize notarization request: {e}"))?;

    notary_ws_stream
        .send(WsMessage::Text(payload_json_str))
        .await
        .map_err(|e| eyre!("failed to send notarization request to notary: {e}"))?;

    log!("notarization request sent");

    Ok((notary_ws_stream.into_io(), session_id))
}

async fn connect_to_proxy(
    proxy_address: &str,
    target_url: &str,
) -> eyre::Result<IoStream<WsStreamIo, Vec<u8>>> {
    let (_, proxy_ws_stream) = WsMeta::connect(proxy_address, None)
        .await
        .map_err(|e| eyre!("failed to connect to proxy: {e}"))?;

    log!("connect to proxy OK");

    let mut proxy_io_stream = proxy_ws_stream.into_io();

    // Set the target for proxying
    let url_json_bytes = serde_json::to_vec(target_url)
        .map_err(|e| eyre!("failed to serialize proxy target: {e}"))?;

    log!("serialize proxy target OK");

    proxy_io_stream
        .write_all(&url_json_bytes)
        .await
        .map_err(|e| eyre!("failed to set proxy target: {e}"))?;

    log!("set proxy target OK");

    Ok(proxy_io_stream)
}

fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProverOpts {
    pub env: ProverEnv,
    pub input: ProverInput,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProverEnv {
    pub max_transcript_size: usize, // NOTE: only 1 << 14 for now
    pub proxy_address: String,
    pub notary_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProverInput {
    pub method: String, // NOTE: only GET for now
    pub url: String,
    pub headers: Vec<Header>,
    pub body: Option<Vec<u8>>, // NOTE: only None for now
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Header {
    pub name: String,
    pub value: String,
}

/// Response object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotarizationSessionResponse {
    /// Unique session id that is generated by notary and shared to prover
    pub session_id: String,
}

/// Request object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotarizationSessionRequest {
    pub client_type: ClientType,
    /// Maximum transcript size in bytes
    pub max_transcript_size: Option<usize>,
}

/// Types of client that the prover is using
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ClientType {
    /// Client that has access to the transport layer
    Tcp,
    /// Client that cannot directly access transport layer, e.g. browser extension
    Websocket,
}

/// Request query of the /notarize API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotarizationRequestQuery {
    /// Session id that is returned from /session API
    pub session_id: String,
}
