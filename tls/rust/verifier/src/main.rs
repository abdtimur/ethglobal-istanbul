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
    pub fact: String,
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
        let notary_pubkey = PublicKey::read_public_key_pem_file(notary_pubkey_pem_file_path)
            .map_err(|e| {
                eyre!("failed to read notary pubkey from file {notary_pubkey_pem_file_path}: {e}")
            })?;

        let verifier_seckey = SigningKey::read_pkcs8_pem_file(verifier_seckey_pem_file_path)
            .map_err(|e| {
                eyre!(
                    "failed to read verifier seckey from file {verifier_seckey_pem_file_path}: {e}"
                )
            })?;

        let mut root_cert_store = RootCertStore::empty();
        for pem in ca_certs.split("\n\n") {
            let pem = pem.trim();
            if pem.is_empty() {
                continue;
            }
            root_cert_store
                .add_pem(pem)
                .map_err(|e| eyre!("failed to add CA certificate: {e}"))?;
        }

        Ok(Self {
            notary_pubkey,
            verifier_seckey,
            root_cert_store,
            source_config,
        })
    }

    pub async fn verify(&self, tls_proof: TlsProof) -> eyre::Result<VerifiedProof> {
        let TlsProof {
            session: session_proof,
            substrings: substrings_proof,
        } = tls_proof;

        let cert_verifier = WebPkiVerifier::new(self.root_cert_store.clone(), None);
        session_proof
            .verify(self.notary_pubkey, &cert_verifier)
            .map_err(|e| {
                log::error!("failed to verify session proof: {e}");
                eyre!("failed to verify session proof: {e}")
            })?;

        log::debug!("verify session proof: OK");

        let SessionProof {
            header: session_header,
            server_name,
            ..
        } = session_proof;

        let prove_utc_seconds = session_header.time();
        let verify_utc_seconds = SystemTime::now()
            .duration_since(time::UNIX_EPOCH)
            .map_err(|e| {
                log::error!("failed to get current time: {e}");
                eyre!("failed to get current time: {e}")
            })?
            .as_secs();

        let (mut sent_redacted_transcript, mut recv_redacted_transcript) =
            substrings_proof.verify(&session_header).map_err(|e| {
                log::error!("failed to verify substrings proof: {e}");
                eyre!("failed to verify substrings proof: {e}")
            })?;

        log::debug!("verify substrings proof: OK");

        // Use '1' so that both strings and numbers in JSON can be parsed.
        sent_redacted_transcript.set_redacted(b'1');
        recv_redacted_transcript.set_redacted(b'1');

        let mut headers = [httparse::EMPTY_HEADER; 64];
        let mut req = Request::new(&mut headers);
        let _ = req.parse(sent_redacted_transcript.data()).map_err(|e| {
            log::error!("failed to parse request from sent redacted transcript: {e}");
            eyre!("failed to parse request from sent redacted transcript: {e}")
        })?;
        let Some(req_path) = req.path else {
            log::error!("failed to parse request path from sent redacted transcript");
            return Err(eyre!(
                "failed to parse request path from sent redacted transcript"
            ));
        };

        let server_name = server_name.as_str();
        let req_url = format!("https://{server_name}{req_path}");
        if !self.source_config.is_supported_source_url(&req_url) {
            log::error!("unsupported source URL: {req_url}");
            return Err(eyre!("unsupported source URL: {req_url}"));
        }

        log::debug!("request URL OK: {req_url}");

        let sent_redacted_transcript = String::from_utf8(sent_redacted_transcript.data().to_vec())
            .map_err(|e| {
                log::error!("failed to convert sent redacted transcript to string: {e}");
                eyre!("failed to convert sent redacted transcript to string: {e}")
            })?;
        let recv_redacted_transcript = String::from_utf8(recv_redacted_transcript.data().to_vec())
            .map_err(|e| {
                log::error!("failed to convert recv redacted transcript to string: {e}");
                eyre!("failed to convert recv redacted transcript to string: {e}")
            })?;

        log::debug!("sent redacted transcript:\n{sent_redacted_transcript}");
        log::debug!("recv redacted transcript:\n{recv_redacted_transcript}");

        // HACK: for hackathon's sake
        let Some(idx) = recv_redacted_transcript.find("{\"data") else {
            log::error!("failed to parse twitter resp");
            return Err(eyre!("failed to parse twitter resp"));
        };
        let twitter_resp_str = &recv_redacted_transcript[idx..];

        log::debug!("twitter resp str:\n{twitter_resp_str}");

        let twitter_resp: TwitterUserByScreenNameResp = serde_json::from_str(twitter_resp_str)
            .map_err(|e| {
                log::error!("failed to parse Twitter response from recv redacted transcript: {e}");
                eyre!("failed to parse Twitter response from recv redacted transcript: {e}")
            })?;
        let fact = serde_json::to_string(&twitter_resp.data.user.result).map_err(|e| {
            log::error!("failed to convert Twitter fact to JSON string: {e}");
            eyre!("failed to convert Twitter fact to JSON string: {e}")
        })?;

        let signed_content = SignedContent {
            prove_utc_seconds,
            verify_utc_seconds,
            provider: "twitter".to_string(), // It's a hackathon, so hardcode it for now.
            fact,
        };

        let signed_content_json_str = serde_json::to_string(&signed_content).map_err(|e| {
            log::error!("failed to convert signed content to JSON string: {e}");
            eyre!("failed to convert signed content to JSON string: {e}")
        })?;
        let signed_content_bytes = signed_content_json_str.as_bytes();
        let signature: Signature = self.verifier_seckey.sign(signed_content_bytes);

        log::debug!("sign content: OK: {signature:?}");

        let verified_proof = VerifiedProof {
            signed_content,
            signature,
        };

        Ok(verified_proof)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TwitterUserByScreenNameResp {
    pub data: TwitterUserByScreenNameRespData,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TwitterUserByScreenNameRespData {
    pub user: TwitterUserByScreenNameRespDataUser,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TwitterUserByScreenNameRespDataUser {
    pub result: TwitterUserByScreenNameRespDataUserResult,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TwitterUserByScreenNameRespDataUserResult {
    pub id: String,
    pub rest_id: String,
    pub legacy: TwitterUserByScreenNameRespDataUserResultLegacy,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TwitterUserByScreenNameRespDataUserResultLegacy {
    pub created_at: String,
    pub default_profile: bool,
    pub followers_count: u64,
}
