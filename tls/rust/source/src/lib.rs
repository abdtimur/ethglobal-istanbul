use regex::Regex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn is_supported_source_url(url: &str) -> bool {
    SourceConfig::default().is_supported_source_url(url)
}

#[derive(Clone, Debug)]
pub struct SourceConfig {
    sources: Vec<Source>,
}

impl Default for SourceConfig {
    fn default() -> Self {
        // TODO:
        Self { sources: vec![] }
    }
}

impl SourceConfig {
    pub fn is_supported_source_url(&self, url: &str) -> bool {
        self.sources
            .iter()
            .any(|source| source.url_regex.is_match(url))
    }

    pub fn find_source(&self, url: &str) -> Option<&Source> {
        self.sources
            .iter()
            .find(|source| source.url_regex.is_match(url))
    }
}

#[derive(Clone, Debug)]
pub struct Source {
    url_regex: Regex,
    url_shortener: Option<UrlShortener>,
    allowed_headers: HashMap<String, AllowedHeader>,

    pub reveal_req: RevealReq,
    pub reveal_resp: RevealResp,
}

impl Source {
    pub fn minify_request(&self, url: &str, headers: &[Header]) -> (String, Vec<Header>) {
        // TODO:
        (url.to_string(), headers.to_vec())
    }
}
