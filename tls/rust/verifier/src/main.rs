use hack_source::SourceConfig;

use actix_cors::Cors;
use actix_web::{
    body::BoxBody,
    error::ErrorBadRequest,
    http::header::ContentType,
    middleware::Logger,
    web::{self, Data, Json},
    App, HttpRequest, HttpResponse, HttpServer, Responder, Result as ActixResult,
};
use elliptic_curve::pkcs8::{DecodePrivateKey, DecodePublicKey};
use env_logger::Env;
use eyre::eyre;
use httparse::{self, Request};
use p256::{
    ecdsa::{signature::Signer, Signature, SigningKey},
    PublicKey,
};
use serde::{Deserialize, Serialize};
use std::{
    env,
    io::{Error as IoError, ErrorKind as IoErrorKind, Result as IoResult},
    time::{self, SystemTime},
};
use tlsn_core::proof::{SessionProof, TlsProof};
use tlsn_tls_core::{anchors::RootCertStore, verify::WebPkiVerifier};

const CA_CERTS: &str = include_str!("../../client/ca-certificates.crt");

const ENV_VAR_NOTARY_PUBKEY: &str = "NOTARY_PUBKEY";
const ENV_VAR_VERIFIER_SECKEY: &str = "VERIFIER_SECKEY";
const ENV_VAR_PORT: &str = "PORT";

const DEFAULT_ADDR: &str = "0.0.0.0";
const DEFAULT_PORT: &str = "8080";

#[actix_web::main]
async fn main() -> IoResult<()> {
    env_logger::init_from_env(Env::new().default_filter_or("info"));

    let notary_pubkey_pem_file_path = env::var(ENV_VAR_NOTARY_PUBKEY).map_err(|e| {
        log::error!("{ENV_VAR_NOTARY_PUBKEY} env var has to point to notary pubkey PEM file: {e}");
        IoError::new(
            IoErrorKind::Other,
            format!("failed to get {ENV_VAR_NOTARY_PUBKEY} var from env: {e}"),
        )
    })?;

    let verifier_seckey_pem_file_path = env::var(ENV_VAR_VERIFIER_SECKEY).map_err(|e| {
        log::error!(
            "{ENV_VAR_VERIFIER_SECKEY} env var has to point to verifier seckey PEM file: {e}"
        );
        IoError::new(
            IoErrorKind::Other,
            format!("failed to get {ENV_VAR_VERIFIER_SECKEY} var from env: {e}"),
        )
    })?;

    let port = env::var(ENV_VAR_PORT).unwrap_or(DEFAULT_PORT.to_string());
    let addr = format!("{DEFAULT_ADDR}:{port}");
    log::info!("starting server on {addr}");

    let source_config = SourceConfig::default();

    run_server(
        &notary_pubkey_pem_file_path,
        &verifier_seckey_pem_file_path,
        &addr,
        source_config,
    )
    .await
}

#[derive(Clone, Debug)]
struct AppState {
    verifier: Verifier,
}

async fn run_server(
    notary_pubkey_pem_file_path: &str,
    verifier_seckey_pem_file_path: &str,
    addr: &str,
    source_config: SourceConfig,
) -> IoResult<()> {
    let verifier = Verifier::build(
        notary_pubkey_pem_file_path,
        verifier_seckey_pem_file_path,
        CA_CERTS,
        source_config,
    )
    .map_err(|e| {
        log::error!("failed to build verifier: {e}");
        IoError::new(IoErrorKind::Other, format!("failed to build verifier: {e}"))
    })?;
    let state = AppState { verifier };

    log::debug!("build verifier: OK");

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(state.clone()))
            .route(
                "/healthcheck",
                web::get().to(|| async { HttpResponse::Ok().body("OK") }),
            )
            .route("/verify", web::post().to(verify))
            .wrap(Logger::default())
            .wrap(Cors::permissive()) // FIXME: don't use in production, add real extension id
    })
    .keep_alive(None)
    .bind(addr)?
    .run()
    .await
}

async fn verify(state: Data<AppState>, proof_json: Json<TlsProof>) -> ActixResult<VerifiedProof> {
    let tls_proof = proof_json.into_inner();
    let verified_proof = state.verifier.verify(tls_proof).await.map_err(|e| {
        log::error!("failed to verify proof: {e}");
        ErrorBadRequest(format!("failed to verify proof: {e}"))
    })?;
    Ok(verified_proof)
}

impl Responder for VerifiedProof {
    type Body = BoxBody;

    fn respond_to(self, _: &HttpRequest) -> HttpResponse<Self::Body> {
        match serde_json::to_string(&self) {
            Err(e) => {
                log::error!("failed to serialize response: {e}");
                HttpResponse::InternalServerError()
                    .content_type(ContentType::plaintext())
                    .body(format!("failed to serialize response: {e}"))
            }
            Ok(body_json_str) => HttpResponse::Ok()
                .content_type(ContentType::json())
                .body(body_json_str),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifiedProof {
    pub signed_content: SignedContent,
    /// Verifier's signature over `signed_content` JSON string converted to bytes.
    pub signature: Signature,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignedContent {
    pub prove_utc_seconds: u64,
    pub verify_utc_seconds: u64,
    pub provider: String,
    pub property: String,
    pub value: String,
}

#[derive(Clone, Debug)]
pub struct Verifier {
    notary_pubkey: PublicKey,
    verifier_seckey: SigningKey,
    root_cert_store: RootCertStore,
    source_config: SourceConfig,
}

impl Verifier {
    pub fn build(
        notary_pubkey_pem_file_path: &str,
        verifier_seckey_pem_file_path: &str,
        ca_certs: &str,
        source_config: SourceConfig,
    ) -> eyre::Result<Self> {
        // TODO:
        Err(eyre!("not implemented"))
    }

    pub async fn verify(&self, tls_proof: TlsProof) -> eyre::Result<VerifiedProof> {
        // TODO:
        Err(eyre!("not implemented"))
    }
}
