# dsh-boot-splash · 白鲸化黑启动动画

给 DeepSeek Harness 做的一段启动动画：白蓝鲸鱼单独居中，随着加载进度由下往上**黑化**，
加载完成的一瞬间完全变黑；随后左移，在身后"拉出" `| deepseek HARNESS` 字标，收尾回弹后交给应用界面。

![boot splash](preview/boot-splash.gif)

English notes: [README.md](README.md)。

## 时间轴（总 7.6 秒，一条确定性时间线）

| 时间 | 动作 |
| --- | --- |
| 0.0 s | 蓝鲸从一团蓝色光晕里凝聚出现，轻微呼吸 |
| 0.7 s | 细细的加载圆环淡入并开始生长 |
| 1.1 s | 墨水潮水从底部涌起淹没鲸身，环的头部与水位严格同步 |
| 3.6 s | 鲸鱼完全变黑，圆环闭合，一圈声呐涟漪扩散消散 |
| 3.8 s | 鲸鱼左移，身后留下两层残影，同时收缩成字标大小 |
| 4.4 s | `deepseek` 逐个字母从鲸鱼身后被"拉出" |
| 5.1 s | 黑色胶囊从字标末端滑出，逐步露出 `HARNESS` |
| 5.6 s | 整体落位，1.3% 回弹 + 缓慢呼吸 |
| 6.5 s | 一道高光扫过成品字标 |
| 6.9 s | 整层淡出，把窗口交给应用 |

任意位置点击可跳过。配色严格限制在黑 / 白 / 灰 / 蓝：除了 `#2f6bff`、`#8db8ff` 和蓝色光晕，
其余全是灰阶。

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

* `src/splash.js` — 整个动画：一段样式、一段标记、一个纯函数 `render(t)` 时间线。无框架、
  运行时无构建、不碰自己子树以外的任何 DOM。
* `client.js` — 由 `build.mjs` 从 `src/splash.js` + `dev/logo-data.js` 生成；React 组件注册在
  `shell.overlay`（整窗悬浮层）槽位上，卸载走 `ctx.effect` 清理。
* `lib/index.js` — 故意空实现的 host 半边，只为了让 loader 挂载 fiber、让 client bundle 进入页面。
* `dev/` — 制作工具：`boot.html`（`?t=1200` 冻结任意一帧）、`shot.mjs`（走 CDP 的确定性逐帧截图）、
  `frames.py`（拼 contact sheet）、`integration.html`（用极简 `__ModuleLoader__` / React 桩直接跑
  **发布用**的 `client.js`）、`make-gif.mjs` + `gif.py`（生成本 README 的 GIF）。

```bash
node build.mjs             # 改完 src/splash.js 后重新生成 client.js
node dev/serve.mjs .       # http://127.0.0.1:8899/dev/boot.html?t=2600
node dev/make-gif.mjs      # 78 帧 -> python dev/gif.py -> preview/boot-splash.gif
```

## 说明

* 动画画在 `shell.overlay` 上，不替换应用根节点、不进侧栏、不读其他插件的 DOM，也不会被滚动容器裁切。
* 纯装饰：没有 host 侧行为、没有设置命名空间、不联网。
* 品牌矢量是 DeepSeek 的官方图形，仅作为这段同人启动动画的一部分随包分发；插件代码本身是 MIT。

MIT © liushuchang-2012
