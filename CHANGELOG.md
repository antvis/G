# Change Log

## [1.0.0-alpha.19] - 2021-09-13

Here we write upgrading notes for brands. It's a team effort to make them as straightforward as possible.

### 新增特性

-   `removeAllEventListeners` 移除元素上所有事件监听器：
    ```js
    circle.removeAllEventListeners();
    // 或者
    circle.off(); // 兼容旧版 API
    ```
-   `getLineBoundingRects` 获取 Text 多行文本包围盒：
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
-   基础图形 HTML。
-   文档：
    -   内置对象文档：
        -   EventTarget
        -   Node
        -   Element
        -   Document
    -   事件系统文档，包含以下问题的说明或者解决方案：
        -   事件触发顺序。click 事件会在 pointerdown 和 pointerup 触发之后。
        -   在 Chrome 中禁止页面默认滚动行为。
        -   其他原生事件用法，例如双击、键盘、剪切板等。
    -   HTML 图形文档。

### 改动

-   构建 esm/cjs 选择 babel 模式，之前为 rollup，构建产物文件结构有较大变化。
-   拾取逻辑。点击画布空白处时，事件对象 target 为 Document。
-   参考 DOM API 重构了内部继承关系：
    -   Canvas -> EventTarget
    -   Document -> Node -> EventTarget
    -   DisplayObject -> Element -> Node -> EventTarget
-   Canvas 提供获取入口和场景图根节点方法：

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
