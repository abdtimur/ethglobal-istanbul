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

  // TODO: use some real is supported check later
  const isSupportedSourceUrl = (url: string) => {
    return (
      url.includes("https://twitter.com/i/api/graphql/") &&
      url.includes("UserByScreenName")
    );
  };
  if (!isSupportedSourceUrl(details.url)) {
    logd("abort: not a supported source URL");
    return;
  }

  // TODO: we should support POST and others later
  if (details.method !== "GET") {
    logd("abort: not a GET request");
    return;
  }

  logi("target url identified:", details.url);

  // TODO:
}
