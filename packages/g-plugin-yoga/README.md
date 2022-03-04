# @antv/g-plugin-yoga

支持 [Yoga](https://yogalayout.com/) 排版引擎，使用 yoga-layout-prebuilt

参考以下实现：

-   https://github.com/pmndrs/react-three-flex/
-   https://github.com/fireveined/pixi-flex-layout/

# 安装方式

创建插件并在渲染器中注册：

```js
import { Plugin as PluginYoga } from '@antv/g-plugin-yoga';
renderer.registerPlugin(new PluginYoga());
```

# 使用方式

声明一个使用 flex 布局的 Rect

```js
const container = new Rect({
    style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 500,
        height: 300,
    },
});

container.appendChild(child1);
container.appendChild(child2);
```
