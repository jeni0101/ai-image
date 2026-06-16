# AI 图片工具 · 演示版（Demo）

面向电商场景的 **AI 图片生成工具交互演示**：模板化场景一键产图（电商套图、商品主图、详情页、场景图、社媒、节日、商品视频），多家图像 API 可插拔适配，用户自带 key。

> 这是**纯前端演示版**：展示完整的界面与交互流程，生成结果为**占位图**。配置自己的 API key 后可在支持的环境直连服务商。

## ✨ 特性

- **多服务商可插拔**：OpenAI gpt-image / 通义万相 / 即梦（火山引擎），图像 + 视频，新增一家只加一个适配器文件。
- **中转友好**：每家可填 Base URL，支持第三方中转端点。
- **模板灵感库**：8 大分类、50+ 模板卡片，点击即配置生成。
- **套图多图**：一次任务出多张带用途标签的图（白底主图/卖点图/场景图…）。
- **生成历史 / 参考图上传 / 统一下拉 UI**。

## 🧱 技术栈

原生 HTML / CSS / JavaScript（无框架、无构建步骤），ES Modules。

## 🚀 运行

```bash
python3 scripts/serve.py 8123      # 本地静态服务（带禁缓存头）
# 浏览器打开 http://localhost:8123
```
或任意静态服务器 / 直接用支持 ES Module 的方式托管（需经 http(s)，不能 file://）。

配置 key：点右上「⚙ 模型与密钥」，分别填各服务商的 API Key 与可选 Base URL（中转）。

## 📁 结构

```
index.html app.js styles.css   前端主体
providers/   适配层(openai/aliyun/volcengine) + 注册表 + 传输/密钥
assets/templates/   模板封面（webp/jpg，已压缩）
scripts/serve.py    本地静态服务
```

## 📄 许可

[MIT](LICENSE) © 2026 jeni0101
