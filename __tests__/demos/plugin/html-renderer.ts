import { HTML } from '@antv/g';
import { Plugin as HTMLRenderingPlugin } from '@antv/g-plugin-html-renderer';
import { ExampleLayoutManager } from '../_helper/example-layout-manager';

export async function htmlRenderer(context) {
  const { canvas, renderer } = context;

  renderer.registerPlugin(new HTMLRenderingPlugin());

  await canvas.ready;

  // 增加区域高度以避免元素重叠
  const layoutManager = new ExampleLayoutManager(260, 200, 30, 2);

  const basicPosition = layoutManager.getNextPosition();
  const basicElement = new HTML({
    style: {
      x: basicPosition.x,
      y: basicPosition.y,
      width: 250,
      height: 80,
      innerHTML:
        '<div style="background: #4CAF50; padding: 10px; border-radius: 5px; color: white; text-align: center;">Basic HTML Element</div>',
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(basicElement);

  const styledPosition = layoutManager.getNextPosition();
  const styledElement = new HTML({
    style: {
      x: styledPosition.x,
      y: styledPosition.y,
      width: 250,
      height: 150,
      innerHTML: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 15px; color: white; font-family: Arial, sans-serif; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">Styled HTML Element</h3>
          <p style="margin: 0; font-size: 14px;">This demonstrates complex HTML with CSS styling rendered in the canvas.</p>
          <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 4px;">
            <span>✓ Gradient background</span><br/>
            <span>✓ Box shadow</span><br/>
            <span>✓ Rounded corners</span>
          </div>
        </div>
      `,
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(styledElement);

  // 使用 G 的动画系统来改变元素的位置
  const animatedPosition = layoutManager.getNextPosition();
  const animatedElement = new HTML({
    style: {
      x: animatedPosition.x,
      y: animatedPosition.y,
      width: 250,
      height: 100,
      innerHTML:
        '<div style="background: #E91E63; padding: 10px; border-radius: 5px; color: white; text-align: center;"><div>Animated Element</div><div>This element is animated using G\'s animation system</div></div>',
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(animatedElement);

  // 使用 G 的动画系统来改变元素的位置
  animatedElement.animate(
    [
      { x: animatedPosition.x, y: animatedPosition.y },
      { x: animatedPosition.x + 100, y: animatedPosition.y },
      { x: animatedPosition.x + 100, y: animatedPosition.y + 50 },
      { x: animatedPosition.x, y: animatedPosition.y + 50 },
      { x: animatedPosition.x, y: animatedPosition.y },
    ],
    {
      duration: 3000,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  );

  // 添加一个展示 G 事件系统和样式变化的示例
  const eventDrivenPosition = layoutManager.getNextPosition();
  const eventDrivenElement = new HTML({
    style: {
      x: eventDrivenPosition.x,
      y: eventDrivenPosition.y,
      width: 250,
      height: 100,
      innerHTML:
        '<div style="background: #9C27B0; padding: 10px; border-radius: 5px; color: white; text-align: center; transition: all 0.3s ease;"><div>Event-Driven Element</div><div>Hover over me to see G-style changes!</div></div>',
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(eventDrivenElement);

  // 使用 G 的事件系统来改变元素样式
  eventDrivenElement.addEventListener('mouseenter', () => {
    eventDrivenElement.style.width = 300;
    eventDrivenElement.style.height = 120;
    eventDrivenElement.style.cursor = 'pointer';

    // 修改内部HTML样式
    const element = eventDrivenElement.getDomElement();
    const divs = element.querySelectorAll('div');
    if (divs.length > 0) {
      divs[0].style.fontSize = '18px';
      divs[0].style.fontWeight = 'bold';
    }
  });

  eventDrivenElement.addEventListener('mouseleave', () => {
    eventDrivenElement.style.width = 250;
    eventDrivenElement.style.height = 100;

    // 恢复内部HTML样式
    const element = eventDrivenElement.getDomElement();
    const divs = element.querySelectorAll('div');
    if (divs.length > 0) {
      divs[0].style.fontSize = '';
      divs[0].style.fontWeight = '';
    }
  });

  const formPosition = layoutManager.getNextPosition();
  const formElement = new HTML({
    style: {
      x: formPosition.x,
      y: formPosition.y,
      width: 250,
      height: 120,
      innerHTML: `
        <div style="background: #00BCD4; padding: 15px; border-radius: 5px; color: white; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px;">Form Elements</h3>
          <div style="display: flex; gap: 10px;">
            <input type="text" placeholder="Enter text" style="flex: 1; padding: 5px; border: none; border-radius: 3px;" />
            <button style="background: white; color: #00BCD4; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer;">Submit</button>
          </div>
        </div>
      `,
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(formElement);

  // 添加一个用于验证 handleBoundsChanged 的示例
  const boundsChangePosition = layoutManager.getNextPosition();
  const boundsChangeElement = new HTML({
    style: {
      x: boundsChangePosition.x,
      y: boundsChangePosition.y,
      width: 200,
      height: 80,
      innerHTML:
        '<div style="background: #FF9800; padding: 10px; border-radius: 5px; color: white; text-align: center;"><div>Bounds Change Test</div><div id="size-info">Size: 200x80</div></div>',
      pointerEvents: 'auto',
    },
  });

  canvas.appendChild(boundsChangeElement);

  // 3秒后修改元素尺寸，触发 bounds changed 事件
  setTimeout(() => {
    boundsChangeElement.style.width = 300;
    boundsChangeElement.style.height = 120;

    // 更新显示的尺寸信息
    const element = boundsChangeElement.getDomElement();
    const sizeInfo = element.querySelector('#size-info');
    if (sizeInfo) {
      sizeInfo.textContent = 'Size: 300x120';
    }
  }, 3000);
}
