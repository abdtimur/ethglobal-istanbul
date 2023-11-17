import { Header } from "@pages/msg/msg";
import init, { is_supported_source_url } from "@pages/source";

init();

chrome.webRequest.onBeforeSendHeaders.addListener(
  requestHeadersListener,
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

enum LogLevel {
  None = 0,
  Info = 1,
  Debug = 2,
}

// const logLevel: LogLevel = LogLevel.None;
const logLevel: LogLevel = LogLevel.Info;
// const logLevel: LogLevel = LogLevel.Debug;

// eslint-disable-next-line
function logi(...args: any[]) {
  if (logLevel >= LogLevel.Info) {
    logInternal("[BG] [INFO]", ...args);
  }
}

// eslint-disable-next-line
function logd(...args: any[]) {
  if (logLevel >= LogLevel.Debug) {
    logInternal("[BG] [DEBUG]", ...args);
  }
}

// eslint-disable-next-line
function logInternal(tag: string, ...args: any[]) {
  console.log(tag, ...args);
}

function requestHeadersListener(
  details: chrome.webRequest.WebRequestHeadersDetails
): chrome.webRequest.BlockingResponse | void {
  logd("details.url:", details.url);

  if (!details.url) {
    logd("abort: no URL");
    return;
  }

  if (!is_supported_source_url(details.url)) {
    logd("abort: not a supported source URL");
    return;
  }

  // TODO: we should support POST and others later
  if (details.method !== "GET") {
    logd("abort: not a GET request");
    return;
  }

  logi("target url identified:", details.url);

  const headers = processHeaders(details.requestHeaders);
  logi("parsed headers:", JSON.stringify(headers));

  chrome.runtime
    .sendMessage({
      url: details.url,
      headers: headers,
    })
    .catch((err) =>
      console.warn("[BG] [ERROR]: chrome.runtime.sendMessage failed:", err)
    );
}

function processHeaders(
  headersArray?: chrome.webRequest.HttpHeader[]
): Header[] {
  if (!headersArray) {
    return [];
  }

  const headers: Header[] = [];
  for (const header of headersArray) {
    if (header.name && header.value) {
      headers.push({
        name: header.name,
        value: header.value,
      });
    }
  }
  return headers;
}
