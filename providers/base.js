// 适配层公共规范：统一入参 / 出参 / 错误，业务代码只认这套格式，不关心底层是哪家。

// 统一入参 GenerateParams:
//   { prompt, refImages?: string[], size?: "1024x1024", n?: number, model?: string }
// 统一出参 GenerateResult:
//   { images: string[], cost?: number, raw?: any }   // images 为 url 或 data:base64
//   视频:  { videos: string[], cover?: string, raw?: any }

export class ProviderError extends Error {
  constructor(provider, message, raw) {
    super(`[${provider}] ${message}`);
    this.provider = provider;
    this.raw = raw;
  }
}

// 把 "1024x1024" 解析为 { width, height }
export function parseSize(size) {
  const [w, h] = String(size || "1024x1024").split("x").map((n) => parseInt(n, 10));
  return { width: w || 1024, height: h || 1024 };
}

// 各家比例字符串可能不同，这里做一层常用映射兜底
export const COMMON_SIZES = ["1024x1024", "768x1024", "1024x768", "1024x1536", "1536x1024"];
