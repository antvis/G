# Change Log

## [1.0.0-alpha.20] - 2021-09-13

- @antv/g-canvas@1.0.0-alpha.21
- @antv/g-components@1.0.0-alpha.20
- @antv/g-ecs@1.0.0-alpha.7
- @antv/g-math@1.0.0-alpha.5
- @antv/g-plugin-3d@1.0.0-alpha.21
- @antv/g-plugin-canvas-picker@1.0.0-alpha.15
- @antv/g-plugin-canvas-renderer@1.0.0-alpha.21
- @antv/g-plugin-control@1.0.0-alpha.20
- @antv/g-plugin-css-select@1.0.0-alpha.20
- @antv/g-plugin-dom-interaction@1.0.0-alpha.21
- @antv/g-plugin-html-renderer@1.0.0-alpha.4
- @antv/g-plugin-svg-picker@1.0.0-alpha.21
- @antv/g-plugin-svg-renderer@1.0.0-alpha.21
- @antv/g-plugin-webgl-renderer@1.0.0-alpha.21
- @antv/g-svg@1.0.0-alpha.21
- @antv/g-webgl@1.0.0-alpha.21
- @antv/g@1.0.0-alpha.20

### 新增特性

-   `removeAllEventListeners` 移除元素上所有事件监听器：https://g-next.antv.vision/zh/docs/api/event#removealleventlisteners
    ```js
    circle.removeAllEventListeners();
    // 或者
    circle.off(); // 兼容旧版 API
    ```
-   `getLineBoundingRects` 获取 Text 多行文本包围盒：https://g-next.antv.vision/zh/docs/api/basic/text#getlineboundingrects-rectangle
    ```js
    text.getLineBoundingRects(); // Rectangle[]
    ```
-   节点查询
    -   `getRootNode` 返回当前节点的根节点
    -   `find` 查询满足条件的第一个子节点
    -   `findAll` 查询满足条件的所有子节点列表
    ```js
    // 以下写法等价
    solarSystem.querySelector('[name=sun]');
    solarSystem.find((element) => element.name === 'sun');
    ```
-   节点操作
    -   `append` 在当前节点的子节点列表末尾批量添加一组节点
    -   `prepend` 在当前节点的子节点列表头部批量添加一组节点
    -   `after` 在当前节点之后批量添加一些兄弟节点
    -   `before` 在当前节点之前批量添加一些兄弟节点
    -   `replaceChild` 用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点
    -   `replaceWith` 在父节点的子节点列表中，用传入的节点列表替换该节点
    -   `replaceChildren` 替换该节点的所有子节点。不传参数时则会清空该节点的所有子节点
-   基础图形 HTML。https://g-next.antv.vision/zh/docs/api/basic/html
-   文档：
    -   内置对象文档：
        -   EventTarget https://g-next.antv.vision/zh/docs/api/builtin-objects/event-target
        -   Node https://g-next.antv.vision/zh/docs/api/builtin-objects/node
        -   Element https://g-next.antv.vision/zh/docs/api/builtin-objects/element
        -   Document https://g-next.antv.vision/zh/docs/api/builtin-objects/document
    -   事件系统文档，包含以下问题的说明或者解决方案：
        -   事件触发顺序。click 事件会在 pointerdown 和 pointerup 触发之后。https://g-next.antv.vision/zh/docs/api/event#%E4%BA%8B%E4%BB%B6%E8%A7%A6%E5%8F%91%E9%A1%BA%E5%BA%8F
        -   在 Chrome 中禁止页面默认滚动行为。https://g-next.antv.vision/zh/docs/api/event#%E5%9C%A8-chrome-%E4%B8%AD%E7%A6%81%E6%AD%A2%E9%A1%B5%E9%9D%A2%E9%BB%98%E8%AE%A4%E6%BB%9A%E5%8A%A8%E8%A1%8C%E4%B8%BA
        -   其他原生事件用法，例如双击、键盘、剪切板等。https://g-next.antv.vision/zh/docs/api/event#%E5%85%B6%E4%BB%96%E4%BA%8B%E4%BB%B6

### 改动

-   构建 esm/cjs 选择 babel 模式，之前为 rollup，构建产物文件结构有较大变化。
-   拾取逻辑。点击画布空白处时，事件对象 target 为 Document。
-   参考 DOM API 重构了内部继承关系：
    -   Canvas -> EventTarget
    -   Document -> Node -> EventTarget
    -   DisplayObject -> Element -> Node -> EventTarget
-   Canvas 提供获取入口和场景图根节点方法：https://g-next.antv.vision/zh/docs/api/canvas#%E5%85%A5%E5%8F%A3%E4%B8%8E%E6%A0%B9%E8%8A%82%E7%82%B9

    ```js
    canvas.document; // 入口
    canvas.document.documentElement; // 场景图根节点
    // 或者
    canvas.getRoot(); // 场景图根节点

    // 向场景图根节点中添加节点
    canvas.appendChild(circle);
    // 或者
    canvas.document.documentElement.appendChild(circle);
    ```

### Bug 修复

-   g-svg 渲染节点时丢失变换矩阵问题。该问题是由删除节点之后排序时未及时更新导致。
-   g-canvas 残影问题 https://codesandbox.io/s/exciting-pike-z7lt8?file=/index.js 在设置 z 坐标大于 500 时出现。目前内置的默认正交相机在世界坐标系位置为 `[width / 2, height / 2, 500]`，视点为 `[width / 2, height / 2, 0]`。因此 z > 500 代表图形出现在了相机之后，内置的剔除插件会将其剔除，因此正确的展示效果为该图形不可见。

### 其他已知问题

-   视口坐标系与世界坐标系、Client 坐标系的转换方法。
-   HTML 图形事件响应有问题。
-   文本阴影待实现。
-   path-util 转曲遗留问题：https://github.com/antvis/util/issues/68
-   g-webgl Line/Path/Polygon/Polyline 待实现。
-   father 选用 babel 编译 cjs 时在 @antv/g-plugin-webgl-renderer 中报错
