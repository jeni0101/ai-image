// OpenAI 适配器：图像 gpt-image-1（同步返回 b64），视频 sora-2（异步，按需开启）。
import { ProviderError } from "./base.js";
import { hasNative, nativeRequest, mockImage, mockImages } from "./transport.js";

const DEFAULT_BASE = "https://api.openai.com/v1";

export default {
  id: "openai",
  label: "OpenAI",
  caps: { image: true, video: true },
  imageModels: ["gpt-image-1"],
  videoModels: ["sora-2"], // 视频需账号开通 Sora API
  sizes: ["1024x1024", "1024x1536", "1536x1024"],

  async generateImage({ prompt, refImages = [], size = "1024x1024", n = 1, model = "gpt-image-1", baseUrl }, key) {
    if (!hasNative() || !key) return { images: mockImages(prompt, "OpenAI", n), raw: { mock: true } };
    const base = baseUrl || DEFAULT_BASE;

    // 有参考图走 edits（multipart），否则走 generations
    const edit = refImages.length > 0;
    const { status, json } = await nativeRequest({
      provider: "openai",
      url: `${base}/images/${edit ? "edits" : "generations"}`,
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      // multipart 由 Rust 侧按 refImages 组装；JSON 直接透传
      json: edit ? null : { model, prompt, size, n },
      multipart: edit ? { model, prompt, size, n, image: refImages } : null,
    });
    if (status >= 400) throw new ProviderError("openai", json?.error?.message || `HTTP ${status}`, json);
    return { images: json.data.map((d) => d.b64_json ? `data:image/png;base64,${d.b64_json}` : d.url), raw: json };
  },

  async generateVideo({ prompt, size = "1280x720", model = "sora-2", baseUrl }, key) {
    if (!hasNative() || !key) return { videos: [], cover: mockImage(prompt, "OpenAI 视频"), raw: { mock: true } };
    const base = baseUrl || DEFAULT_BASE;
    const { status, json } = await nativeRequest({
      provider: "openai",
      url: `${base}/videos`,
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      json: { model, prompt, size },
      poll: { url: `${base}/videos/{id}`, idField: "id", doneWhen: "completed", resultField: "url" },
    });
    if (status >= 400) throw new ProviderError("openai", json?.error?.message || `HTTP ${status}`, json);
    return { videos: [json.url], raw: json };
  },
};
