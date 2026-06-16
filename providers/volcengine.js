// 即梦（火山引擎 Volcengine 视觉）适配器：图像/视频。
// 重要：火山引擎用 SigV4 签名（AccessKeyId + SecretAccessKey），浏览器里无法安全签名，
// 必须在 Rust 侧完成签名。因此这里只声明 Action 与业务参数，签名交给原生层。
// 视频生成（即梦 AIGC）为异步：先 Submit 拿 task_id，再 Result 轮询。
import { ProviderError } from "./base.js";
import { hasNative, nativeRequest, mockImage, mockImages } from "./transport.js";

const DEFAULT_HOST = "https://visual.volcengineapi.com";

export default {
  id: "volcengine",
  label: "即梦（火山引擎）",
  caps: { image: true, video: true },
  // model/req_key 串以火山引擎视觉控制台开通的为准，接通后核对。
  imageModels: ["high_aes_general_v30l", "high_aes_general_v21_L"],
  videoModels: ["jimeng_vgfm_t2v_l20"],
  sizes: ["1024x1024", "768x1024", "1024x768"],
  // 火山引擎凭证是 AK/SK 两段，key 管理需特殊处理（见 keys.js 的 pair 类型）
  keyType: "pair",

  async generateImage({ prompt, size = "1024x1024", model = "high_aes_general_v30l", n = 1, baseUrl }, cred) {
    if (!hasNative() || !cred?.accessKey) return { images: mockImages(prompt, "即梦", n), raw: { mock: true } };
    const host = baseUrl || DEFAULT_HOST;
    const [width, height] = size.split("x").map(Number);
    const { status, json } = await nativeRequest({
      provider: "volcengine",
      sign: { service: "cv", region: "cn-north-1", accessKey: cred.accessKey, secretKey: cred.secretKey },
      url: `${host}?Action=CVProcess&Version=2022-08-31`,
      method: "POST",
      json: { req_key: model, prompt, width, height },
    });
    if (status >= 400) throw new ProviderError("volcengine", json?.message || `HTTP ${status}`, json);
    const imgs = json?.data?.binary_data_base64 || [];
    return { images: imgs.map((b) => `data:image/png;base64,${b}`), raw: json };
  },

  async generateVideo({ prompt, model = "jimeng_vgfm_t2v_l20", baseUrl }, cred) {
    if (!hasNative() || !cred?.accessKey) return { videos: [], cover: mockImage(prompt, "即梦视频"), raw: { mock: true } };
    const host = baseUrl || DEFAULT_HOST;
    const { status, json } = await nativeRequest({
      provider: "volcengine",
      sign: { service: "cv", region: "cn-north-1", accessKey: cred.accessKey, secretKey: cred.secretKey },
      url: `${host}?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`,
      method: "POST",
      json: { req_key: model, prompt },
      poll: { action: "CVSync2AsyncGetResult", idPath: "data.task_id", doneWhen: "done", resultPath: "data.video_url" },
    });
    if (status >= 400) throw new ProviderError("volcengine", json?.message || `HTTP ${status}`, json);
    return { videos: [json?.data?.video_url].filter(Boolean), raw: json };
  },
};
