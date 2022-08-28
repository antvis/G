English | [简体中文](./README-zh_CN.md)

Provides partial G 4.0 compatible APIs, e.g.

```js
// 4.0
circle.getCount();

// Equivalent to DOM API
circle.childElementCount;
```

Package name inspired by `@vue/compat`.

https://v3-migration.vuejs.org/migration-build.html

### Deprecated API

The following APIs provided in G 4.0 can be replaced by the corresponding DOM APIs in the new version.

#### getCount

Get the number of child nodes.

```js
circle.getCount(); // [0]

// Equivalent to
circle.childElementCount; // [0]
```

#### getParent

Get the parent node.

```js
circle.getParent();

// Equivalent to
circle.parentElement;
```

### getChildren

Get the list of child nodes.

```js
circle.getChildren();

// Equivalent to
circle.children;
```

### getFirst

Get the first child node.

```js
circle.getFirst();

// Equivalent to
circle.firstElementChild;
```

### getLast

Get the last child node.

```js
circle.getLast();

// Equivalent to
circle.lastElementChild;
```

### getChildByIndex

Get child nodes by index.

```js
circle.getChildByIndex(index);

// Equivalent to
circle.children[index];
```

### add

Add child nodes.

```js
parent.add(child);

// Equivalent to
parent.appendChild(child);
```

### setClip

Set the cropped graphics.

```js
circle.setClip(clipPath);

// Equivalent to
circle.style.clipPath = clipPath;
```

### getClip

Get cropped graphics.

```js
circle.getClip();

// Equivalent to
circle.style.clipPath;
```

### set

Set in the initialization configuration.

```js
circle.set('my-prop', 1);

// Equivalent to
circle.config['my-prop'] = 1;
```

### get

Obtain in the initialization configuration.

```js
circle.get('my-prop');

// Equivalent to
circle.config['my-prop'];
```

### show

Show node.

```js
circle.show();

// Equivalent to
circle.style.visibility = 'visible';
```

### hide

Hide node.

```js
circle.hide();

// Equivalent to
circle.style.visibility = 'hidden';
```

### moveTo / move

Moving node in the world coordinate system.

```js
circle.moveTo(x, y, z);
circle.move(x, y, z);

// Equivalent to
circle.setPosition(x, y, z);
```

### setZIndex

Set the `zIndex` of node：

```js
circle.setZIndex(100);

// Equivalent to
circle.style.zIndex = 100;
```
