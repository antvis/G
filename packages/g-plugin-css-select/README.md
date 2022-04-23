# @antv/g-plugin-css-select

Use CSS Selector when doing query in scene graph.

For example, if we construct a such scene:

```
solarSystem<Group>
   |    |
   |   sun<Circle name='sun' />
   |
 earthOrbit<Group>
   |    |
   |  earth<Circle>
   |
 moonOrbit<Group>
      |
     moon<Circle r='25' />
```

Then we can use these DOM API retrieving elements:

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```
