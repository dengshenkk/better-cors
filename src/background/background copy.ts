// 首先移除 throw error，这会阻止后续代码执行
console.log("[Background] 文件被加载");

let isEnabled = true;


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Background Message received:", message);

  if (message.type === "toggleCORS") {
    isEnabled = message.enabled;
    console.log("[Background] CORS状态已更新为:", isEnabled);
    sendResponse({ success: true, enabled: isEnabled });
  }

  if (message.type === "ping") {
    console.log("[Background] 收到ping");
    sendResponse({ pong: true });
  }

  return true; // 指示异步响应
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    console.log("[Background] 拦截到请求:", details.url.substring(0, 100));
    console.log("Request Headers:", details);
    console.log("[CORS Bypass] Intercepted request:", details.url);

    // 检查是否为预检请求（OPTIONS 方法），并修改请求头
    if (details.method === "OPTIONS") {
      details.requestHeaders.push({
        name: "Access-Control-Request-Method",
        value: "GET, POST, OPTIONS"
      });
    }

    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] }, // 监听所有URL，或指定特定的URL匹配模式
  ["blocking", "requestHeaders", "extraHeaders"] // 使用 extraHeaders 确保处理跨域检查
);

// 处理请求头
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    console.log("[Background] 拦截到请求:", details.url.substring(0, 100));
    console.log('details', details)

    // if (true) {
    //   return { responseHeaders: details.responseHeaders };
    // }

    let headers = details.responseHeaders || [];

    // 移除所有现有的CORS相关头
    headers = headers.filter((header) => {
      const name = header.name.toLowerCase();
      return ![
        "access-control-allow-origin",
        "access-control-allow-methods",
        "access-control-allow-headers",
        "access-control-allow-credentials",
      ].includes(name);
    });

    // 添加新的CORS头
    const corsHeaders = [
      // { name: "x-power-by", value: "dengshen1111" },
      { name: "Access-Control-Allow-Origin", value: '*' }, // 使用 * 允许所有源
      // {
      //   name: "Access-Control-Allow-Methods",
      //   value: "GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH",
      // },
      // { name: "Access-Control-Allow-Headers", value: "*" },
      // { name: "Access-Control-Allow-Credentials", value: "true" },
    ];

    // // // 如果请求头中有 Origin，则使用具体的 Origin 而不是 *
    // const originHeader = details.requestHeaders?.find(
    //   (h) => h.name.toLowerCase() === "origin"
    // );

    // console.log('originHeader', originHeader)

    // if (originHeader && originHeader.value) {
    //   corsHeaders[0].value = originHeader.value; // 使用实际的 Origin
    // }

    headers.push(...corsHeaders);

    console.log("[Background] 已修改响应222头", headers);
    return { responseHeaders: [{ name: "Access-Control-Allow-Origin", value: '*' }] };
  },
  {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"], // 只处理 XHR/fetch 请求
  },
  ["blocking", "responseHeaders", "extraHeaders"] // 添加 requestHeaders 权限
);

console.log("[Background] Service Worker 已启动");
