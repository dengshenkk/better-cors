import { ref } from "vue";
const isEnabled = ref(false);

chrome.storage.local.get(["corsEnabled"], function (res) {
  isEnabled.value = res.corsEnabled;
  updateIcon()
  if (isEnabled.value) {
    enableCORS();
  } else {
    disableCORS();
  }
});
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Background Message received:", message);

  if (message.type === "toggleCORS") {
    isEnabled.value = message.enabled;
    updateIcon()
    if (isEnabled.value) {
      enableCORS();
    } else {
      disableCORS();
    }
    sendResponse({ success: true, enabled: isEnabled.value });
  }
  return true; // 指示异步响应
});

function disableCORS() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
  });
}
function enableCORS() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "Access-Control-Allow-Origin",
              operation: "set",
              value: "*",
            },
            {
              header: "Access-Control-Allow-Headers",
              operation: "set",
              value: "*",
            },
            {
              header: "Access-Control-Allow-Methods",
              operation: "set",
              value: "GET, POST, PUT, DELETE, OPTIONS",
            },
            { header: "test", operation: "set", value: "requestHeaders" },
          ],
          responseHeaders: [
            { header: "Content-Security-Policy", operation: "set", value: "" },
            {
              header: "Access-Control-Allow-Origin",
              operation: "set",
              value: "*",
            },
            {
              header: "Access-Control-Allow-Headers",
              operation: "set",
              value: "*",
            },
            {
              header: "Access-Control-Allow-Methods",
              operation: "set",
              value: "GET, POST, PUT, DELETE, OPTIONS",
            },
            { header: "test", operation: "set", value: "responseHeaders" },
          ],
        },
        condition: {
          urlFilter: "*",
          resourceTypes: [
            "csp_report",
            "font",
            "image",
            "main_frame",
            "media",
            "object",
            "other",
            "ping",
            "script",
            "stylesheet",
            "sub_frame",
            "webbundle",
            "websocket",
            "webtransport",
            "xmlhttprequest",
          ],
        },
      },
    ],
  });
}


// 更新图标
function updateIcon() {
  const iconPath = isEnabled.value ? "active.png" : "inactive.png";
  chrome.action.setIcon({ path: iconPath });
}