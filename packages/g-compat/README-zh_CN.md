[English](./README.md) | 简体中文

提供部分兼容 G 4.0 的 API，例如：

```js
// 4.0 写法
circle.getCount();

// 等价于 DOM API
circle.childElementCount;
```

包名受 `@vue/compat` 启发：

https://v3-migration.vuejs.org/migration-build.html

### 待废弃 API

以下为 G 4.0 提供的 API，在新版中都可以找到对应的 DOM API 替代。

#### getCount

获取子节点数量：

```js
circle.getCount(); // [0]

// 等价于
circle.childElementCount; // [0]
```

#### getParent

获取父节点：

```js
circle.getParent();

// 等价于
circle.parentElement;
```

### getChildren

获取子节点列表：

```js
circle.getChildren();

// 等价于
circle.children;
```

### getFirst

获取第一个子节点：

```js
circle.getFirst();

// 等价于
circle.firstElementChild;
```

### getLast

获取最后一个子节点：

```js
circle.getLast();

// 等价于
circle.lastElementChild;
```

### getChildByIndex

按索引获取子节点：

```js
circle.getChildByIndex(index);

// 等价于
circle.children[index];
```

### add

添加子节点：

```js
parent.add(child);

// 等价于
parent.appendChild(child);
```

### setClip

设置裁剪图形：

```js
circle.setClip(clipPath);

// 等价于
circle.style.clipPath = clipPath;
```

### getClip

获取裁剪图形：

```js
circle.getClip();

// 等价于
circle.style.clipPath;
```

### set

在初始化配置中设置：

```js
circle.set('my-prop', 1);

// 等价于
circle.config['my-prop'] = 1;
```

### get

在初始化配置中获取：

```js
circle.get('my-prop');

// 等价于
circle.config['my-prop'];
```

### show

显示节点：

```js
circle.show();

// 等价于
circle.style.visibility = 'visible';
```

### hide

隐藏节点：

```js
circle.hide();

// 等价于
circle.style.visibility = 'hidden';
```

### moveTo / move

在世界坐标系下移动节点：

```js
circle.moveTo(x, y, z);
circle.move(x, y, z);

// 等价于
circle.setPosition(x, y, z);
```

### setZIndex

设置节点的 `zIndex`：

```js
circle.setZIndex(100);

// 等价于
circle.style.zIndex = 100;
```
