// 通义万相（阿里 DashScope）适配器：图像/视频均为异步任务——提交拿 task_id，再轮询。
// 提交: POST https://dashscope.aliyuncs.com/api/v1/services/aigc/.../  头部 X-DashScope-Async: enable
// 轮询: GET  https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}
// 注意：具体 model 串以阿里云控制台为准，下方为常用值，接通后按账号可用模型核对。
import { ProviderError } from "./base.js";
import { hasNative, nativeRequest, mockImage, mockImages } from "./transport.js";

const DEFAULT_BASE = "https://dashscope.aliyuncs.com/api/v1";

export default {
  id: "aliyun",
  label: "通义万相",
  caps: { image: true, video: true },
  imageModels: ["wan2.2-t2i-flash", "wan2.2-t2i-plus", "wanx2.1-t2i-turbo"],
  videoModels: ["wan2.2-t2v-plus", "wanx2.1-t2v-turbo"],
  sizes: ["1024x1024", "768x1024", "1024x768", "1280x720", "720x1280"],

  async generateImage({ prompt, size = "1024*1024", n = 1, model = "wan2.2-t2i-flash", baseUrl }, key) {
    if (!hasNative() || !key) return { images: mockImages(prompt, "通义万相", n), raw: { mock: true } };
    const base = baseUrl || DEFAULT_BASE;
    const { status, json } = await nativeRequest({
      provider: "aliyun",
      url: `${base}/services/aigc/text2image/image-synthesis`,
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "X-DashScope-Async": "enable" },
      json: { model, input: { prompt }, parameters: { size: size.replace("x", "*"), n } },
      poll: { url: `${base}/tasks/{id}`, idPath: "output.task_id", doneWhen: "SUCCEEDED", statusPath: "output.task_status", resultPath: "output.results" },
    });
    if (status >= 400) throw new ProviderError("aliyun", json?.message || `HTTP ${status}`, json);
    const results = json?.output?.results || [];
    return { images: results.map((r) => r.url), raw: json };
  },

  async generateVideo({ prompt, size = "1280*720", model = "wan2.2-t2v-plus", baseUrl }, key) {
    if (!hasNative() || !key) return { videos: [], cover: mockImage(prompt, "万相视频"), raw: { mock: true } };
    const base = baseUrl || DEFAULT_BASE;
    const { status, json } = await nativeRequest({
      provider: "aliyun",
      url: `${base}/services/aigc/video-generation/video-synthesis`,
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "X-DashScope-Async": "enable" },
      json: { model, input: { prompt }, parameters: { size: size.replace("x", "*") } },
      poll: { url: `${base}/tasks/{id}`, idPath: "output.task_id", doneWhen: "SUCCEEDED", statusPath: "output.task_status", resultPath: "output.video_url" },
    });
    if (status >= 400) throw new ProviderError("aliyun", json?.message || `HTTP ${status}`, json);
    return { videos: [json?.output?.video_url].filter(Boolean), raw: json };
  },
};
