import { listProviders, getProvider, generate, hasNative } from "./providers/index.js";
import { getKey, setKey, hasKey, getBaseUrlRaw, setBaseUrl, DEFAULT_BASE } from "./providers/keys.js";
import { config } from "./providers/config.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ============================ 顶部工具大菜单 ============================ */
const toolMenuBtn = $("#toolMenuBtn");
const toolMega = $("#toolMega");
if (toolMenuBtn && toolMega) {
  toolMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = toolMega.classList.toggle("open");
    toolMega.setAttribute("aria-hidden", String(!open));
    toolMenuBtn.classList.toggle("open", open);
  });
  toolMega.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", () => {
    toolMega.classList.remove("open");
    toolMega.setAttribute("aria-hidden", "true");
    toolMenuBtn.classList.remove("open");
  });
}

/* ============================ 静态数据 ============================ */
const quickTemplates = [
  { type: "suite", title: "电商套图", img: "assets/templates/ecommerce-suite.jpg" },
  { type: "amazon", title: "亚马逊A+", img: "assets/templates/amazon-a-plus.jpg" },
  { type: "model", title: "生成模特图", img: "assets/templates/model-generation.jpg" },
  { type: "bg", title: "产品换背景", img: "assets/templates/product-background.jpg" },
  { type: "replace", title: "替换模特", img: "assets/templates/model-replace.jpg" },
];

const T = (s) => `assets/templates/${s}`;
const templates = [
  // 热门：精选混合
  { category: "热门", type: "suite", title: "电商套图", img: T("suite-collage.webp") },
  { category: "热门", type: "amazon", title: "亚马逊A+", img: T("amazon-a-plus.jpg") },
  { category: "热门", type: "model", title: "生成模特图", img: T("model-generation.jpg") },
  { category: "热门", type: "bg", title: "产品换背景", img: T("sofa-scene.webp") },
  { category: "热门", type: "main", title: "精华液主图", img: T("cosmetic-serum.webp") },
  { category: "热门", type: "suite", title: "运动鞋多角度", img: T("sneaker-suite.webp") },
  { category: "热门", type: "bg", title: "饮品场景图", img: T("beverage-scene.webp") },
  { category: "热门", type: "amazon", title: "节日促销图", img: T("festival.webp") },

  // 电商套图
  { category: "电商套图", type: "suite", title: "电商套图", img: T("suite-collage.webp") },
  { category: "电商套图", type: "suite", title: "耳机套图", img: T("headphone-suite.webp") },
  { category: "电商套图", type: "suite", title: "运动鞋套图", img: T("sneaker-suite.webp") },
  { category: "电商套图", type: "suite", title: "护肤套装套图", img: T("skincare-set.webp") },
  { category: "电商套图", type: "suite", title: "数码配件套图", img: T("digital-accessory.webp") },
  { category: "电商套图", type: "suite", title: "手表套图", img: T("watch.webp") },
  { category: "电商套图", type: "suite", title: "手提包套图", img: T("handbag.webp") },
  { category: "电商套图", type: "suite", title: "零食礼盒套图", img: T("snack-food.webp") },

  // 商品主图
  { category: "商品主图", type: "main", title: "白底主图", img: T("white-main.jpg") },
  { category: "商品主图", type: "main", title: "精华液主图", img: T("cosmetic-serum.webp") },
  { category: "商品主图", type: "main", title: "香水主图", img: T("perfume.webp") },
  { category: "商品主图", type: "main", title: "珠宝主图", img: T("jewelry.webp") },
  { category: "商品主图", type: "main", title: "保健品主图", img: T("supplement.webp") },
  { category: "商品主图", type: "main", title: "手表主图", img: T("watch.webp") },
  { category: "商品主图", type: "main", title: "智能音箱主图", img: T("smart-speaker.webp") },

  // 详情页
  { category: "详情页", type: "detail", title: "详情页视觉", img: T("detail-page.jpg") },
  { category: "详情页", type: "amazon", title: "亚马逊A+", img: T("amazon-a-plus.jpg") },
  { category: "详情页", type: "detail", title: "护肤详情页", img: T("skincare-scene.webp") },
  { category: "详情页", type: "detail", title: "咖啡机详情页", img: T("coffee-machine.webp") },
  { category: "详情页", type: "detail", title: "手表详情页", img: T("watch.webp") },

  // 场景图
  { category: "场景图", type: "bg", title: "沙发客厅场景", img: T("sofa-scene.webp") },
  { category: "场景图", type: "bg", title: "生活方式场景", img: T("lifestyle-scene.jpg") },
  { category: "场景图", type: "bg", title: "单椅家居场景", img: T("armchair-scene.webp") },
  { category: "场景图", type: "bg", title: "饮品场景图", img: T("beverage-scene.webp") },
  { category: "场景图", type: "bg", title: "咖啡机厨房场景", img: T("coffee-machine.webp") },
  { category: "场景图", type: "bg", title: "智能音箱场景", img: T("speaker-scene.webp") },
  { category: "场景图", type: "bg", title: "护肤场景图", img: T("skincare-scene.webp") },
  { category: "场景图", type: "bg", title: "香薰家居场景", img: T("home-decor.webp") },

  // 社媒
  { category: "社媒", type: "suite", title: "社媒平铺图", img: T("social-flatlay.webp") },
  { category: "社媒", type: "model", title: "模特展示图", img: T("model-black.webp") },
  { category: "社媒", type: "model", title: "连衣裙模特", img: T("dress-mannequin.webp") },
  { category: "社媒", type: "bg", title: "香薰种草图", img: T("home-decor.webp") },
  { category: "社媒", type: "suite", title: "珠宝种草图", img: T("jewelry.webp") },

  // 节日
  { category: "节日", type: "amazon", title: "节日促销图", img: T("festival.webp") },
  { category: "节日", type: "suite", title: "节日礼盒图", img: T("snack-food.webp") },
  { category: "节日", type: "suite", title: "香水节日礼", img: T("perfume.webp") },
  { category: "节日", type: "amazon", title: "美妆节日活动", img: T("social-flatlay.webp") },

  // 视频
  { category: "视频", type: "video", title: "商品视频", img: T("coffee-machine.webp") },
  { category: "视频", type: "video", title: "模特带货视频", img: T("model-black.webp") },
  { category: "视频", type: "video", title: "场景短片", img: T("sofa-scene.webp") },
  { category: "视频", type: "video", title: "种草短视频", img: T("social-flatlay.webp") },
];

const modalConfigs = {
  suite: { title: "电商套图", desc: "上传商品图片，智能生成主图、场景图及细节特写。支持自动提取产品主体，适配亚马逊等跨境平台规范。", field: "商品卖点", hint: "销售站点、区域", selects: ["亚马逊", "中国", "中文（简体）", "3:4"], options: ["白底主图", "搜索主图", "核心卖点图", "卖点图", "材质图", "场景展示图", "模特展示图"], detail: false },
  amazon: { title: "亚马逊A+", desc: "快速生成亚马逊 A+ 图文内容，包含品牌视觉、对比模块、场景模块和细节展示。", field: "商品卖点", hint: "销售站点、区域", selects: ["亚马逊", "美国", "英文", "970:600"], options: ["首屏主视觉", "核心卖点", "对比模块", "场景模块", "细节模块"], detail: true },
  detail: { title: "电商详情页", desc: "一键搞定电商详情页，智能生成主图、场景图及细节特写，适配亚马逊平台规范。", field: "商品卖点", hint: "销售站点、区域", selects: ["亚马逊", "中国", "英文", "970:600"], options: ["首屏主视觉", "核心卖点图", "场景氛围图", "细节特写图", "尺寸规格图", "对比图"], detail: true },
  model: { title: "生成模特图", desc: "上传服装或商品图，生成真人模特展示图，适合服饰、饰品和电商详情页。", field: "模特要求", hint: "模特、区域", selects: ["通用", "中国", "中文（简体）", "3:4"], options: ["半身模特", "全身模特", "棚拍风格", "生活场景"], detail: false },
  bg: { title: "产品换背景", desc: "保留商品主体，替换为专业电商场景背景，让商品图更自然。", field: "背景要求", hint: "场景、区域", selects: ["通用", "中国", "中文（简体）", "自动比例"], options: ["室内场景", "户外场景", "纯色背景", "高级棚拍"], detail: false },
  replace: { title: "商品替换", desc: "将图一中的商品更换为图二商品，保留原图构图和场景。", field: "替换要求", hint: "图片、区域", selects: ["通用", "中国", "中文（简体）", "自动比例"], options: ["商品替换", "保持构图", "保持光影", "保持背景"], detail: false },
  main: { title: "商品主图", desc: "上传商品图，生成符合平台规范的主图，支持白底、场景底与主体居中。", field: "商品卖点", hint: "平台、区域", selects: ["亚马逊", "美国", "英文", "1:1"], options: ["纯白底", "场景底", "主体居中", "含卖点文字", "多角度"], detail: false },
  video: { title: "商品视频", desc: "上传首帧或商品图，生成带货短视频，适合店铺上新与社媒投放。", field: "视频脚本", hint: "时长、区域", selects: ["通用", "中国", "中文（简体）", "9:16"], options: ["开箱展示", "卖点讲解", "场景演示", "模特带货"], detail: false },
};

/* 比例 → 尺寸映射；质量 / 数量预设 */
const RATIOS = [
  { label: "1:1", size: "1024x1024" },
  { label: "3:4", size: "768x1024" },
  { label: "4:3", size: "1024x768" },
  { label: "16:9", size: "1280x720" },
  { label: "9:16", size: "720x1280" },
];
const QUALITIES = ["标准", "草稿", "高清"];
const COUNTS = [1, 2, 4];

/* ============================ 应用状态 ============================ */
const state = {
  category: "热门",
  mode: "image",
  provider: localStorage.getItem("aiimg.provider") || "openai",
  model: "",
  ratio: RATIOS[0].size,
  quality: "标准",
  count: 2,
  refImages: [],     // [{name, dataUrl}]
  purposes: null,    // 套图用途数组
};

/* ============================ 历史记录（真实保存） ============================ */
const HISTORY_KEY = "aiimg.history.v1";
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const saveHistory = (list) => localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));

function pushHistory(entry) {
  const list = loadHistory();
  list.unshift(entry);
  saveHistory(list);
  renderHistory();
}

function renderHistory() {
  const box = $("#historyList");
  const list = loadHistory();
  box.innerHTML = "";
  if (!list.length) {
    box.innerHTML = `<p class="history-empty">还没有生成记录</p>`;
    return;
  }
  list.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "history-item";
    btn.type = "button";
    const when = new Date(item.time).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    btn.innerHTML = `<strong>${escapeHtml(item.prompt.slice(0, 18))}</strong><span>${item.providerLabel} · ${item.kind === "video" ? "视频" : "图像"} · ${when}</span>`;
    btn.addEventListener("click", () => restoreHistory(item));
    box.append(btn);
  });
}

function restoreHistory(item) {
  $("#promptInput").value = item.prompt;
  renderResults(item.kind, item.providerLabel, item.results, { prompt: item.prompt, restored: true });
}

/* ============================ 卡片 / 模板渲染 ============================ */
function cardTemplate(item) {
  return `<button type="button"><div class="template-cover"><img src="${item.img}" alt="${item.title}" loading="lazy"></div><h3>${item.title}</h3></button>`;
}

function renderQuick() {
  const grid = $("#quickGrid");
  grid.innerHTML = "";
  quickTemplates.forEach((item) => {
    const card = document.createElement("article");
    card.className = "quick-card";
    card.innerHTML = cardTemplate(item);
    card.querySelector("button").addEventListener("click", () => openModal(item.type));
    grid.append(card);
  });
}

function renderTabs() {
  const cats = ["热门", "电商套图", "商品主图", "详情页", "场景图", "社媒", "节日", "视频"];
  const tabs = $("#categoryTabs");
  tabs.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = cat === state.category ? "active" : "";
    btn.textContent = cat;
    btn.addEventListener("click", () => { state.category = cat; renderTabs(); renderGallery(); });
    tabs.append(btn);
  });
}

function renderGallery() {
  const grid = $("#templateGrid");
  grid.innerHTML = "";
  templates.filter((item) => item.category === state.category).forEach((item) => {
    const card = document.createElement("article");
    card.className = "template-card";
    card.innerHTML = cardTemplate(item);
    card.querySelector("button").addEventListener("click", () => openModal(item.type));
    grid.append(card);
  });
}

/* ============================ 自定义下拉组件（统一 UI） ============================ */
function closeAllDropdowns(except) {
  $$(".dd.open").forEach((d) => { if (d !== except) d.classList.remove("open"); });
}
document.addEventListener("click", () => closeAllDropdowns());

function createDropdown(mount, { options, value, onChange, align = "left" }) {
  if (!mount) return;
  mount.classList.add("dd");
  mount.innerHTML = "";
  const labelOf = (v) => options.find((o) => o.value === v)?.label ?? v;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dd-btn";
  btn.innerHTML = `<span>${labelOf(value)}</span>`;
  const menu = document.createElement("div");
  menu.className = "dd-menu" + (align === "right" ? " right" : "");
  options.forEach((o) => {
    const it = document.createElement("div");
    it.className = "dd-opt" + (o.value === value ? " sel" : "");
    it.textContent = o.label;
    it.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.querySelector("span").textContent = o.label;
      menu.querySelectorAll(".dd-opt").forEach((x) => x.classList.remove("sel"));
      it.classList.add("sel");
      mount.classList.remove("open");
      onChange?.(o.value);
    });
    menu.append(it);
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !mount.classList.contains("open");
    closeAllDropdowns(mount);
    mount.classList.toggle("open", willOpen);
  });
  menu.addEventListener("click", (e) => e.stopPropagation());
  mount.append(btn, menu);
}

/* ============================ 生成参数控件（接活） ============================ */
function populateParamControls() {
  const provider = getProvider(state.provider);
  createDropdown($("#providerDD"), {
    options: listProviders().map((p) => ({ value: p.id, label: p.label })),
    value: state.provider,
    onChange: (v) => { state.provider = v; localStorage.setItem("aiimg.provider", v); populateParamControls(); },
  });
  // 模型不暴露给用户，按服务商+模式默认取第一个
  const models = (state.mode === "video" ? provider.videoModels : provider.imageModels) || [];
  if (!models.includes(state.model)) state.model = models[0] || "";
  createDropdown($("#ratioDD"), { options: RATIOS.map((r) => ({ value: r.size, label: r.label })), value: state.ratio, onChange: (v) => { state.ratio = v; } });
  createDropdown($("#qualityDD"), { options: QUALITIES.map((q) => ({ value: q, label: q })), value: state.quality, onChange: (v) => { state.quality = v; } });
  $("#countVal").textContent = String(state.count);
  const ks = $("#keyState");
  ks.textContent = hasKey(state.provider) ? "" : "⚠ 未配置密钥";
  ks.classList.toggle("warn", !hasKey(state.provider));
}

$$("#countStep button").forEach((b) => b.addEventListener("click", () => {
  const i = COUNTS.indexOf(state.count);
  const next = i + Number(b.dataset.d);
  if (next >= 0 && next < COUNTS.length) { state.count = COUNTS[next]; $("#countVal").textContent = String(state.count); }
}));

/* ============================ 参考图上传 ============================ */
const MAX_REFS = 5;
const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function handleFiles(fileList) {
  const files = Array.from(fileList || []);
  for (const file of files) {
    if (state.refImages.length >= MAX_REFS) { toast(`最多上传 ${MAX_REFS} 张参考图`); break; }
    if (!ALLOWED.includes(file.type)) { toast(`${file.name}：仅支持 JPG/PNG/WEBP`); continue; }
    if (file.size > MAX_SIZE) { toast(`${file.name}：超过 20MB`); continue; }
    const reader = new FileReader();
    reader.onload = () => { state.refImages.push({ name: file.name, dataUrl: reader.result }); renderRefStrip(); };
    reader.readAsDataURL(file);
  }
}

function renderRefStrip() {
  const strip = $("#refStrip");
  strip.innerHTML = "";
  strip.hidden = state.refImages.length === 0;
  state.refImages.forEach((ref, i) => {
    const chip = document.createElement("div");
    chip.className = "ref-chip" + (i === 0 ? " primary" : "");
    chip.innerHTML = `<img src="${ref.dataUrl}" alt="${escapeHtml(ref.name)}"><button type="button" title="移除">×</button>${i === 0 ? '<em>主图</em>' : ""}`;
    chip.querySelector("button").addEventListener("click", () => { state.refImages.splice(i, 1); renderRefStrip(); });
    strip.append(chip);
  });
}

$("#imageInput").addEventListener("change", (e) => { handleFiles(e.target.files); e.target.value = ""; });
$("#modalImageInput").addEventListener("change", (e) => { handleFiles(e.target.files); e.target.value = ""; });
// 拖拽与粘贴
const promptBox = $(".prompt-box");
promptBox.addEventListener("dragover", (e) => { e.preventDefault(); promptBox.classList.add("dragover"); });
promptBox.addEventListener("dragleave", () => promptBox.classList.remove("dragover"));
promptBox.addEventListener("drop", (e) => { e.preventDefault(); promptBox.classList.remove("dragover"); handleFiles(e.dataTransfer.files); });
document.addEventListener("paste", (e) => { if (e.clipboardData?.files?.length) handleFiles(e.clipboardData.files); });

/* ============================ 输入校验 ============================ */
function validatePrompt(prompt) {
  const text = (prompt || "").trim();
  if (!text) return "请输入提示词";
  const hasCJK = /[一-龥]/.test(text);
  const min = hasCJK ? 4 : 8;
  if (text.length < min) return `提示词至少 ${min} 个${hasCJK ? "中文" : "英文"}字符`;
  return null;
}

/* ============================ 生成主流程 ============================ */
async function runGenerate(prompt, opts = {}) {
  prompt = (prompt || "").trim();
  const err = validatePrompt(prompt);
  if (err) { toast(err); $("#promptInput").focus(); return; }

  const kind = state.mode === "video" ? "video" : "image";
  const provider = getProvider(state.provider);
  // PROD 不允许占位 mock：无密钥或非桌面端直接拦截，必须真实出图
  if (!config.allowMock && (!hasNative() || !hasKey(state.provider))) {
    toast(!hasNative() ? "正式版需在桌面端运行" : "请先在「模型与密钥」中配置 " + provider.label + " 的密钥");
    return;
  }
  const purposes = opts.purposes && opts.purposes.length ? opts.purposes : null;
  const section = $("#resultSection");
  const strip = $("#resultStrip");
  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#resultMeta").textContent = `· ${provider.label} · ${kind === "video" ? "视频" : "图像"} · ${state.quality}` +
    (purposes ? ` · 套图 ${purposes.length} 张` : ` · ${state.count} 张`) +
    (hasNative() ? "" : "（浏览器为占位演示，桌面端通真）");
  strip.innerHTML = `<div class="result-loading"><span class="spinner"></span> 生成中…</div>`;

  const baseParams = {
    size: state.ratio,
    model: state.model || undefined,
    quality: state.quality,
    refImages: state.refImages.map((r) => r.dataUrl),
  };

  try {
    let results = []; // [{src, tag}]
    if (purposes) {
      // 套图：每个用途各生成一张并打标签
      for (const purpose of purposes) {
        const res = await generate(kind, state.provider, { ...baseParams, n: 1, prompt: `${purpose}：${prompt}` });
        const src = (kind === "video" ? res.videos?.[0] || res.cover : res.images?.[0]);
        if (src) results.push({ src, tag: purpose, video: kind === "video" && res.videos?.length });
      }
    } else {
      const res = await generate(kind, state.provider, { ...baseParams, n: state.count, prompt });
      const list = kind === "video" ? (res.videos.length ? res.videos : [res.cover]) : res.images;
      results = list.filter(Boolean).map((src) => ({ src, tag: ratioLabel(state.ratio), video: kind === "video" && res.videos.length }));
    }

    renderResults(kind, provider.label, results, { prompt, purposes });
    pushHistory({
      id: Date.now(), time: Date.now(), kind, prompt,
      providerLabel: provider.label, provider: state.provider,
      params: { ...baseParams, refImages: undefined, refCount: state.refImages.length, count: state.count },
      purposes, results,
    });
  } catch (e) {
    strip.innerHTML = `<div class="result-error">生成失败：${escapeHtml(e.message)} <button type="button" id="retryBtn">重试</button></div>`;
    $("#retryBtn")?.addEventListener("click", () => runGenerate(prompt, opts));
  }
}

function ratioLabel(size) { return RATIOS.find((r) => r.size === size)?.label || size; }

function renderResults(kind, providerLabel, results, ctx = {}) {
  const section = $("#resultSection");
  const strip = $("#resultStrip");
  section.hidden = false;
  $("#resultMeta").textContent = `· ${providerLabel} · ${kind === "video" ? "视频" : "图像"}` + (ctx.restored ? "（历史记录）" : "");
  strip.innerHTML = "";
  results.forEach((item, i) => {
    const fig = document.createElement("div");
    fig.className = "result-item";
    const media = item.video ? `<video src="${item.src}" controls></video>` : `<img src="${item.src}" alt="生成结果">`;
    fig.innerHTML = `${media}
      <span class="result-tag">${escapeHtml(item.tag || "")}</span>
      <div class="result-actions">
        <button type="button" data-act="download" title="下载">⤓</button>
        <button type="button" data-act="copy" title="复制提示词">⧉</button>
        <button type="button" data-act="regen" title="再次生成">↻</button>
      </div>`;
    fig.querySelector('[data-act="download"]').addEventListener("click", () => downloadOne(item.src, kind, i));
    fig.querySelector('[data-act="copy"]').addEventListener("click", () => { navigator.clipboard?.writeText(ctx.prompt || ""); toast("提示词已复制"); });
    fig.querySelector('[data-act="regen"]').addEventListener("click", () => runGenerate(ctx.prompt || $("#promptInput").value, { purposes: ctx.purposes }));
    strip.append(fig);
  });
  // 批量下载
  const bar = document.createElement("div");
  bar.className = "result-toolbar";
  bar.innerHTML = `<button type="button" id="downloadAll">⤓ 整包下载（${results.length}）</button>`;
  bar.querySelector("#downloadAll").addEventListener("click", () => results.forEach((it, i) => setTimeout(() => downloadOne(it.src, kind, i), i * 250)));
  strip.append(bar);
}

function downloadOne(src, kind, i) {
  const a = document.createElement("a");
  a.href = src;
  const ext = kind === "video" ? "mp4" : (src.startsWith("data:image/svg") ? "svg" : "png");
  const date = new Date().toISOString().slice(0, 10);
  a.download = `aiimg_${date}_${i + 1}.${ext}`;
  document.body.append(a); a.click(); a.remove();
}

/* ============================ 功能弹窗（套图） ============================ */
let modalSelected = new Set();

function openModal(type) {
  const config = modalConfigs[type] || modalConfigs.suite;
  state.modalType = type;
  modalSelected = new Set();
  $("#modalTitle").textContent = config.title;
  $("#modalDesc").textContent = config.desc;
  $("#modalFieldTitle").textContent = config.field;
  $("#settingHint").textContent = config.hint;
  $("#modalTextarea").placeholder = config.field === "商品卖点"
    ? "建议包含：1.产品名称 2.核心卖点 3.适用人群 4.期望场景 5.具体参数。也可点「AI帮写」一键生成。"
    : "描述您想要的效果：风格、场景、主体、光线和限制条件。";
  const platformOpts = ["淘宝天猫1688", "亚马逊", "TikTok Shop", "独立站", "中国", "美国", "中文（简体）", "英文", "1:1", "3:4", "4:3", "16:9", "9:16", "970:600"];
  $("#modalSelects").innerHTML = config.selects.map((_, i) => `<div class="dd" id="msel-${i}"></div>`).join("");
  config.selects.forEach((value, i) => {
    const opts = [value, ...platformOpts.filter((v) => v !== value)].map((v) => ({ value: v, label: v }));
    createDropdown($(`#msel-${i}`), { options: opts, value });
  });
  $("#modalOptions").innerHTML = config.options.map((item) => `<button type="button" data-opt="${item}">${item}</button>`).join("") + '<button class="add-option" type="button">＋</button>';
  $$("#modalOptions button[data-opt]").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.opt;
    if (modalSelected.has(v)) { modalSelected.delete(v); b.classList.remove("on"); }
    else { modalSelected.add(v); b.classList.add("on"); }
    updateSelectedCount();
  }));
  updateSelectedCount();
  $("#modalCard").classList.toggle("detail-layout", config.detail);
  $("#rightHint").textContent = config.detail ? "上传商品，轻松做出专业爆款详情设计" : "上传商品，轻松做出专业电商设计";
  renderRefStrip();
  $("#functionPopup").classList.add("open");
}

function updateSelectedCount() {
  $("#selectedCount").textContent = modalSelected.size ? `已选${modalSelected.size}张` : "请选择套图类型";
}

/* ============================ 快捷入口与按钮 ============================ */
$$(".shortcut-row button").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.template)));
$$(".mode-rail button").forEach((button) => button.addEventListener("click", () => {
  $$(".mode-rail button").forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
  state.mode = button.dataset.mode;
  populateParamControls();
}));
$("#settingsBtn").addEventListener("click", () => openModal("suite"));
$("#sendBtn").addEventListener("click", () => runGenerate($("#promptInput").value));
$("#promptInput").addEventListener("keydown", (e) => { if (e.key === "Enter") runGenerate($("#promptInput").value); });
$("#closePopup").addEventListener("click", () => $("#functionPopup").classList.remove("open"));
$("#modalCreateBtn").addEventListener("click", () => {
  $("#functionPopup").classList.remove("open");
  const prompt = $("#modalTextarea").value.trim() || $("#modalDesc").textContent;
  runGenerate(prompt, { purposes: Array.from(modalSelected) });
});
$("#aiWriteBtn").addEventListener("click", () => {
  $("#modalTextarea").value = "产品名称：便携式咖啡研磨机\n核心卖点：便携、低噪、研磨均匀\n适用人群：咖啡爱好者、办公室用户、露营人群\n期望场景：厨房、办公室、户外露营";
  toast("已生成示例卖点，请核对后再生成");
});

/* ============================ 设置：默认服务商 + 各家密钥 ============================ */
let pendingProvider = state.provider;
function renderSettings() {
  pendingProvider = state.provider;
  createDropdown($("#defaultProviderDD"), {
    options: listProviders().map((p) => ({ value: p.id, label: p.label })),
    value: state.provider,
    onChange: (v) => { pendingProvider = v; },
  });
  $("#settingsKeys").innerHTML = listProviders().map((p) => {
    const cred = getKey(p.id);
    const baseRow = `<input data-f="baseurl" placeholder="Base URL（中转/自定义，留空用官方 ${DEFAULT_BASE[p.id] || ""}）" value="${getBaseUrlRaw(p.id)}">`;
    if (p.keyType === "pair") {
      return `<div class="key-block" data-id="${p.id}" data-type="pair">
        <label>${p.label} <i class="${hasKey(p.id) ? "ok" : ""}"></i></label>
        <input data-f="accessKey" placeholder="AccessKeyId" value="${cred?.accessKey || ""}">
        <input data-f="secretKey" type="password" placeholder="SecretAccessKey" value="${cred?.secretKey || ""}">
        ${baseRow}
      </div>`;
    }
    return `<div class="key-block" data-id="${p.id}">
      <label>${p.label} <i class="${hasKey(p.id) ? "ok" : ""}"></i></label>
      <input data-f="key" type="password" placeholder="API Key" value="${cred || ""}">
      ${baseRow}
    </div>`;
  }).join("");
}

$("#openSettings").addEventListener("click", () => { renderSettings(); $("#settingsMask").classList.add("open"); });
$("#closeSettings").addEventListener("click", () => $("#settingsMask").classList.remove("open"));
$("#settingsMask").addEventListener("click", (e) => { if (e.target.id === "settingsMask") $("#settingsMask").classList.remove("open"); });
$("#saveSettings").addEventListener("click", () => {
  state.provider = pendingProvider;
  localStorage.setItem("aiimg.provider", state.provider);
  $$("#settingsKeys .key-block").forEach((block) => {
    const id = block.dataset.id;
    if (block.dataset.type === "pair") {
      setKey(id, { accessKey: block.querySelector('[data-f="accessKey"]').value.trim(), secretKey: block.querySelector('[data-f="secretKey"]').value.trim() });
    } else {
      setKey(id, block.querySelector('[data-f="key"]').value.trim());
    }
    setBaseUrl(id, block.querySelector('[data-f="baseurl"]').value);
  });
  $("#settingsMask").classList.remove("open");
  populateParamControls();
  toast("已保存");
});

/* ============================ 轻量 toast ============================ */
let toastTimer;
function toast(msg) {
  let el = $("#toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; document.body.append(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/* ============================ 新对话：清空当前输入 ============================ */
$(".new-session").addEventListener("click", () => {
  $("#promptInput").value = "";
  state.refImages = [];
  renderRefStrip();
  $("#resultSection").hidden = true;
  $("#promptInput").focus();
});

/* ============================ 初始化 ============================ */
populateParamControls();
renderHistory();
renderQuick();
renderTabs();
renderGallery();
renderRefStrip();
