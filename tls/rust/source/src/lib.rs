use regex::Regex;
use std::collections::HashMap;
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
        Self {
            sources: vec![Source {
                url_regex: Regex::new(
                    r"^https://twitter\.com/i/api/graphql/.*/UserByScreenName.*$",
                )
                .unwrap(),
                url_shortener: Some(UrlShortener::TwitterUserByScreenName),
                allowed_headers: HashMap::from([
                    (
                        "accept".to_string(),
                        AllowedHeader {
                            shortener: Some(HeaderShortener::Accept),
                        },
                    ),
                    (
                        "accept-language".to_string(),
                        AllowedHeader {
                            shortener: Some(HeaderShortener::AcceptLanguage),
                        },
                    ),
                    (
                        "authorization".to_string(),
                        AllowedHeader { shortener: None },
                    ),
                    (
                        "cookie".to_string(),
                        AllowedHeader {
                            shortener: Some(HeaderShortener::Cookie(
                                CookieShortener::TwitterUserByScreenName,
                            )),
                        },
                    ),
                    ("user-agent".to_string(), AllowedHeader { shortener: None }),
                    (
                        "x-csrf-token".to_string(),
                        AllowedHeader { shortener: None },
                    ),
                ]),
                reveal_req: RevealReq {
                    headers: vec![
                        "accept".to_string(),
                        "accept-language".to_string(),
                        "connection".to_string(),
                        "host".to_string(),
                        "user-agent".to_string(),
                    ],
                },
                reveal_resp: RevealResp {
                    headers: vec![
                        "connection".to_string(),
                        "date".to_string(),
                        "last-modified".to_string(),
                    ],
                    body: RevealBody::Json {
                        paths: vec![
                            "data.user.result.id".to_string(),
                            "data.user.result.legacy.created_at".to_string(),
                            "data.user.result.legacy.default_profile".to_string(),
                            "data.user.result.legacy.followers_count".to_string(),
                            "data.user.result.rest_id".to_string(),
                        ],
                    },
                },
            }],
        }
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
        let shortened_url = match &self.url_shortener {
            Some(shortener) => shortener.shorten(url),
            None => url.to_string(),
        };

        let mut shortened_headers: Vec<Header> = Vec::new();
        for header in headers {
            let name = header.name.to_lowercase();
            let allowed_header = match self.allowed_headers.get(&name) {
                Some(allowed_header) => allowed_header,
                None => continue,
            };
            let shortened_value = allowed_header.shorten(&header.value);
            shortened_headers.push(Header {
                name,
                value: shortened_value,
            });
        }

        (shortened_url, shortened_headers)
    }
}

#[derive(Clone, Debug)]
pub struct Header {
    pub name: String,
    pub value: String,
}

#[derive(Clone, Debug)]
pub enum HeaderShortener {
    Accept,
    AcceptLanguage,
    Cookie(CookieShortener),
}

impl HeaderShortener {
    fn shorten(&self, header_value: &str) -> String {
        // TODO:
        header_value.to_string()
    }
}

#[derive(Clone, Debug)]
pub enum CookieShortener {
    TwitterUserByScreenName,
}

impl CookieShortener {
    fn allowed_cookie_names(&self) -> Vec<Regex> {
        // TODO:
        vec![]
    }
}

#[derive(Clone, Debug)]
pub struct AllowedHeader {
    pub shortener: Option<HeaderShortener>,
}

impl AllowedHeader {
    pub fn shorten(&self, header_value: &str) -> String {
        match &self.shortener {
            Some(shortener) => shortener.shorten(header_value),
            None => header_value.to_string(),
        }
    }
}

#[derive(Clone, Debug)]
pub enum UrlShortener {
    TwitterUserByScreenName,
}

impl UrlShortener {
    pub fn shorten(&self, url: &str) -> String {
        // TODO:
        url.to_string()
    }
}

#[derive(Clone, Debug, Default)]
pub struct RevealReq {
    pub headers: Vec<String>,
    // TODO: only GET methods are supported for now so no redact for request body
}

#[derive(Clone, Debug, Default)]
pub struct RevealResp {
    pub headers: Vec<String>,
    pub body: RevealBody,
}

#[derive(Clone, Debug, Default)]
pub enum RevealBody {
    Html, // TODO: HTML is ignored for now, only JSON is supported

    Json {
        paths: Vec<String>,
    },

    #[default]
    Unknown,
}
