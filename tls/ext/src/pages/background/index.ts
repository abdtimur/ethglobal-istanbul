chrome.webRequest.onBeforeSendHeaders.addListener(
  requestHeadersListener,
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

function requestHeadersListener(
  details: chrome.webRequest.WebRequestHeadersDetails
): chrome.webRequest.BlockingResponse | void {
  // TODO:
}
