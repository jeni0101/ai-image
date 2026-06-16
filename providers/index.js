// 适配层注册表 + 统一入口。业务代码只用这里：
//   import { listProviders, generate } from "./providers/index.js";
//   const res = await generate("image", "openai", { prompt, size });
import openai from "./openai.js";
import aliyun from "./aliyun.js";
import volcengine from "./volcengine.js";
import { getKey, getBaseUrl } from "./keys.js";
import { hasNative } from "./transport.js";

const REGISTRY = { openai, aliyun, volcengine };

export function listProviders(kind /* "image" | "video" | undefined */) {
  return Object.values(REGISTRY).filter((p) => !kind || p.caps[kind]);
}

export function getProvider(id) {
  return REGISTRY[id] || null;
}

export { hasNative };

// 统一生成入口
export async function generate(kind, providerId, params) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error(`未知 provider: ${providerId}`);
  if (!provider.caps[kind]) throw new Error(`${provider.label} 不支持${kind === "video" ? "视频" : "图像"}生成`);
  const cred = getKey(providerId);
  const p = { ...params, baseUrl: getBaseUrl(providerId) };
  if (kind === "video") return provider.generateVideo(p, cred);
  return provider.generateImage(p, cred);
}
