# dsh-boot-splash · 白鲸化黑启动动画

给 DeepSeek Harness 做的一段启动动画：白蓝鲸鱼单独居中，随着加载进度由下往上**黑化**，
加载完成的一瞬间完全变黑；随后左移，在身后"拉出" `| deepseek HARNESS` 字标，收尾回弹后交给应用界面。

![boot splash](preview/boot-splash.gif)

English notes: [README.md](README.md)。

## 时间轴（总 7.6 秒，一条确定性时间线）

| 时间 | 动作 |
| --- | --- |
| 0.0 s | 蓝鲸从一团蓝光里凝聚出现，脚下一圈柔和的接触阴影，轻微呼吸 |
| 1.1 s | 墨水潮水从底部涌起淹没鲸身，**潮线本身就是进度**，边缘有一道白色液面高光 |
| 3.5 s | 鲸鱼完全变黑；光晕轻轻"呼"一口气，粒子从潮线甩出后散尽 |
| 3.6 s | 一道高光扫过黑色鲸身 |
| 3.7 s | 鲸鱼左移：先倾斜（3° 侧倾）、身后拉出一条发丝般的尾迹线和两层残影，末段收缩成字标大小 |
| 4.3 s | `deepseek` 逐个字母从鲸鱼身后被"拉出"，落位时由虚转实 |
| 5.1 s | 黑色胶囊从字标末端滑出，逐步露出 `HARNESS` |
| 5.6 s | 整体落位，1.3% 回弹 + 缓慢呼吸；一条极淡的签名线在下方展开又消散 |
| 6.5 s | 一道高光扫过成品字标 |
| 6.9 s | 整层淡出（1.2% 缓慢放大），把窗口交给应用 |

任意位置点击可跳过。配色严格限制在黑 / 白 / 灰 / 蓝：除了 `#2f6bff`、`#8db8ff` 和蓝色光晕，
其余全是灰阶。

**这一版去掉了外圈加载环**：进度不再靠一个环形指示器，而是让墨水潮线、白色液面高光、
光晕蓄能和从潮线甩出的粒子一起承担"正在加载"的读法。同时补了几层排版级的细节——
极淡的胶片颗粒、四角渐隐、鲸鱼底下的接触阴影、移动时的尾迹线、落位时的签名线——
让白底不再像一张空页。

## 用的是真字标

没有任何文字排版：鲸鱼 mark、`deepseek` 字标、黑色胶囊和 `HARNESS` 字形全部是应用自带的官方矢量，
由 [`dev/build-logo-data.mjs`](dev/build-logo-data.mjs) 从 asar 里的 `favicon.svg` + `welcome-brand.svg`
抽成 [`dev/logo-data.js`](dev/logo-data.js)。所以最后一帧与侧栏品牌行是逐像素一致的。

## 安装

```bash
dsh plugin add dsh-boot-splash
```

或直接装本地目录：

```bash
dsh plugin add /path/to/dsh-boot-splash
```

装完重启一次应用（或 `dsh web` 进程）：下次启动就会播放，播完自动让位给正常界面。
每次页面加载只播一次，时间线结束组件自身卸载。

## 结构

三份可读源码，`build.mjs` 把它们拼成发布物：

* `src/scene.css` — 场景样式（光晕、暗角、颗粒、接触阴影、尾迹线、签名线、字标排布）。
* `src/scene.html` — 场景标记（英雄鲸鱼的 SVG 结构、粒子层、成品字标）。
* `src/timeline.js` — 唯一的时间线：`mountSplash(host, logo, opts)`，内部一个纯函数 `render(t)`
  画出整部片子，所以任何一帧都能冻结/拖动。
* `client.js` — 由 `build.mjs` 生成；React 组件注册在 `shell.overlay`（整窗悬浮层）槽位上，
  卸载走 `ctx.effect` 清理。
* `src/splash.js` — 生成物，只给 `dev/boot.html` 预览同一份代码用。
* `lib/index.js` — 故意空实现的 host 半边，只为了让 loader 挂载 fiber、让 client bundle 进入页面。
* `dev/` — 制作工具：`boot.html`（`?t=1200` 冻结任意一帧）、`shot.mjs`（走 CDP 的确定性逐帧截图）、
  `frames.py`（拼 contact sheet）、`integration.html`（用极简 `__ModuleLoader__` / React 桩直接跑
  **发布用**的 `client.js`）、`make-gif.mjs` + `gif.py`（生成本 README 的 GIF）。

```bash
node build.mjs             # 改完三份 src/ 源码后重新生成 src/splash.js + client.js
node dev/serve.mjs .       # http://127.0.0.1:8899/dev/boot.html?t=2600
node dev/make-gif.mjs      # 76 帧 @10fps -> python dev/gif.py -> preview/boot-splash.gif
```

## 说明

* 动画画在 `shell.overlay` 上，不替换应用根节点、不进侧栏、不读其他插件的 DOM，也不会被滚动容器裁切。
* 纯装饰：没有 host 侧行为、没有设置命名空间、不联网。
* 品牌矢量是 DeepSeek 的官方图形，仅作为这段同人启动动画的一部分随包分发；插件代码本身是 MIT。

MIT © liushuchang-2012
