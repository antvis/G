# g-image-exporter

提供一个通用的 Exporter 用于导出图片，它接受画布作为参数：

```js
import { Exporter } from 'g-image-exporter';

// pass canvas in
const exporter = new Exporter(canvas);

const dataURL = exporter.toDataURL(); // data:image/png;base64
```

根据不同渲染器选择不同导出图片的方法，例如 `g-canvas/webgl` 可以使用 toDataURL，`g-svg` 可以使用 [XMLSerializer](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLSerializer) 序列化。

注意 G 提供的 HTML 无法导出。
