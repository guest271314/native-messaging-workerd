self.addEventListener("install", (event) => {
  console.log(event);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log(event);
  event.waitUntil(self.clients.claim());
});

self.port = null;

self.preflight = 0;

self.name = chrome.runtime.getManifest().short_name;

chrome.debugger.onDetach.addListener(
  (source, reason) => console.log(source, reason),
);

chrome.debugger.onEvent.addListener(async ({ tabId }, message, params) => {
  // Handle 3 Fetch.requestPaused events
  // GET/PUT, OPTIONS, GET/PUT
  try {
    if (
      message === "Fetch.requestPaused" &&
      params.request.url.startsWith("http://localhost:8081")
    ) {
      console.log(tabId, message, params);
      if (self.preflight === 0) {
        self.port = chrome.runtime.connectNative(globalThis.name);
        self.port.onMessage.addListener((message) => {
          console.log({ message });
        });
        self.port.onDisconnect.addListener(() => {
          console.log(chrome.runtime.lastError);
        });
        // Allow 100 milliseconds for workerd to start up
        await new Promise((r) => setTimeout(r, 100));
      }
      ++self.preflight;
      if (self.preflight === 3) {
        self.preflight = 0;
        self.port.disconnect();
        self.port = null;
      }
    }
    const request = await chrome.debugger.sendCommand(
      { tabId },
      "Fetch.continueRequest",
      {
        requestId: params.requestId,
      },
    );
  } catch (e) {
    console.log(e, chrome.runtime.lastError);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const targets = (await chrome.debugger.getTargets()).filter(
    ({ attached, type }) => {
      return attached && type === "page";
    },
  );
  console.log(targets);
  for (const { tabId, url } of targets) {
    try {
      if (tabId) {
        await chrome.debugger.attach({ tabId }, "1.3");
        await chrome.debugger.sendCommand({ tabId }, "Fetch.enable", {
          patterns: [{
            requestStage: "Request",
            urlPattern: "*",
          }],
        });
      }
    } catch (e) {
      console.log(e, url);
    }
  }
});
