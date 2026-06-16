// 统一传输层：真实请求必须走原生（Tauri/Rust）层，
// 浏览器里因 CORS 和 key 暴露问题无法直连这些 API，所以无原生层时回退到 mock，
// 仅用于在桌面壳落地前跑通 UI 流程。等 Tauri 接入后，把 invoke 接到 Rust 即可通真。

function tauriInvoke() {
  if (typeof window === "undefined" || !window.__TAURI__) return null;
  // Tauri v2: window.__TAURI__.core.invoke；兼容 v1 的 window.__TAURI__.invoke
  return window.__TAURI__.core?.invoke || window.__TAURI__.invoke || null;
}

export const hasNative = () => tauriInvoke() !== null;

// 通过原生层发一个 HTTP 请求，返回 { status, json }。
// provider 适配器只构造请求，签名/鉴权细节在 Rust 侧补全（如火山引擎 SigV4）。
export async function nativeRequest(req) {
  const invoke = tauriInvoke();
  if (!invoke) throw new Error("NO_NATIVE");
  return invoke("provider_request", { req });
}

// 生成一张带提示词文字的占位图（自包含 SVG data URL），无 key / 无原生层时用。浅色，与全站一致。
export function mockImage(prompt, label) {
  const text = (prompt || "示例生成").slice(0, 16);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3f4fb"/><stop offset="1" stop-color="#eef0ff"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <rect x="18" y="18" width="476" height="476" rx="20" fill="#ffffff" stroke="#e9ebf2" stroke-width="2"/>
    <circle cx="256" cy="196" r="44" fill="#eef0ff"/>
    <path d="M236 200l14 14 26-30" fill="none" stroke="#5555ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="256" y="286" fill="#5555ff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">${label}</text>
    <text x="256" y="320" fill="#9aa0b4" font-family="sans-serif" font-size="18" text-anchor="middle">${text}</text>
    <text x="256" y="356" fill="#c2c7d6" font-family="sans-serif" font-size="14" text-anchor="middle">占位演示 · 配置密钥后出真图</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// 按数量返回多张占位图（mock 也要尊重 n）
export function mockImages(prompt, label, n = 1) {
  return Array.from({ length: Math.max(1, n) }, () => mockImage(prompt, label));
}
