// 每家 provider 的 key 各存各的。
// 现在用 localStorage（仅原型阶段）；接 Tauri 后改存系统钥匙串（keyring crate），
// 接口保持不变，只换内部实现。火山引擎是 AK/SK 两段，存为 { accessKey, secretKey }。

import { config } from "./config.js";
const LS_KEY = "aiimg.keys.v1";
const LS_BASE = "aiimg.baseurls.v1";

// ===== 安全存储（PROD：系统钥匙串）=====
// secure 模式下 key 存进操作系统钥匙串（经 Tauri 命令）；启动时载入内存缓存，
// 使下面同步的 getKey() 无需改动调用处。DEV/DEMO 仍走 localStorage。
function tauriInvoke() {
  if (typeof window === "undefined" || !window.__TAURI__) return null;
  return window.__TAURI__.core?.invoke || window.__TAURI__.invoke || null;
}
function secureMode() { return config.secureKeys && !!tauriInvoke(); }
const secureCache = {}; // providerId -> string | {accessKey,secretKey} | null

// 启动时从钥匙串载入（仅 secure 模式；其余为 no-op）
export async function loadKeys() {
  if (!secureMode()) return;
  const inv = tauriInvoke();
  for (const id of Object.keys(DEFAULT_BASE)) {
    try {
      const raw = await inv("key_get", { account: "key:" + id });
      secureCache[id] = raw ? JSON.parse(raw) : null;
    } catch { secureCache[id] = null; }
  }
}

// 各家官方默认 base url；用户填了中转就覆盖
export const DEFAULT_BASE = {
  openai: "https://api.openai.com/v1",
  aliyun: "https://dashscope.aliyuncs.com/api/v1",
  volcengine: "https://visual.volcengineapi.com",
};

function loadBase() {
  try { return JSON.parse(localStorage.getItem(LS_BASE) || "{}"); } catch { return {}; }
}
// 生效值（含默认）
export function getBaseUrl(providerId) {
  return loadBase()[providerId] || DEFAULT_BASE[providerId] || "";
}
// 用户自定义的原始值（未填则空，用于回显输入框）
export function getBaseUrlRaw(providerId) {
  return loadBase()[providerId] || "";
}
export function setBaseUrl(providerId, url) {
  const all = loadBase();
  const v = (url || "").trim();
  if (v && v !== DEFAULT_BASE[providerId]) all[providerId] = v.replace(/\/+$/, "");
  else delete all[providerId];
  localStorage.setItem(LS_BASE, JSON.stringify(all));
}

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
}
function save(all) { localStorage.setItem(LS_KEY, JSON.stringify(all)); }

// 普通 key 返回字符串；pair 类型返回 { accessKey, secretKey }
export function getKey(providerId) {
  if (secureMode()) return secureCache[providerId] ?? null;
  return load()[providerId] || null;
}

function isEmpty(value) {
  if (!value) return true;
  return typeof value === "string" ? value.length === 0 : !(value.accessKey && value.secretKey);
}

export function setKey(providerId, value) {
  if (secureMode()) {
    secureCache[providerId] = value;
    const inv = tauriInvoke();
    if (isEmpty(value)) inv("key_delete", { account: "key:" + providerId }).catch(() => {});
    else inv("key_set", { account: "key:" + providerId, secret: JSON.stringify(value) }).catch(() => {});
    return;
  }
  const all = load();
  all[providerId] = value;
  save(all);
}

export function clearKey(providerId) {
  if (secureMode()) {
    secureCache[providerId] = null;
    tauriInvoke()("key_delete", { account: "key:" + providerId }).catch(() => {});
    return;
  }
  const all = load();
  delete all[providerId];
  save(all);
}

export function hasKey(providerId) {
  const v = getKey(providerId);
  if (!v) return false;
  return typeof v === "string" ? v.length > 0 : Boolean(v.accessKey && v.secretKey);
}
