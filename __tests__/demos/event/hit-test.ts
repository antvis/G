import { Canvas, Circle, Rect, Group, Text } from '@antv/g';
import { ExampleLayoutManager } from '../_helper/example-layout-manager';

/**
 * Hit test examples demonstrating element picking functionality
 * @param context - Canvas context
 */
export async function hitTest(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  // Set canvas background color
  canvas.getRoot().style.background = '#f0f0f0';

  // Create layout manager
  const layoutManager = new ExampleLayoutManager(200, 150, 30, 2);

  // Example 1: Simple element picking
  const pos1 = layoutManager.getNextPosition();
  const regionDim1 = layoutManager.getRegionDimensions();

  const title1 = new Text({
    style: {
      x: pos1.x,
      y: pos1.y + 15,
      text: '1. Simple Element Picking',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title1);

  const circle1 = new Circle({
    style: {
      cx: pos1.x + regionDim1.width / 2,
      cy: pos1.y + regionDim1.height / 2,
      r: 40,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle1);

  const label1 = new Text({
    style: {
      x: pos1.x + regionDim1.width / 2,
      y: pos1.y + regionDim1.height - 15,
      text: 'Hover to change color',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label1);

  circle1.addEventListener('mouseenter', () => {
    circle1.attr('fill', 'blue');
  });

  circle1.addEventListener('mouseleave', () => {
    circle1.attr('fill', 'red');
  });

  // Example 2: Overlapping elements picking order
  const pos2 = layoutManager.getNextPosition();
  const regionDim2 = layoutManager.getRegionDimensions();

  const title2 = new Text({
    style: {
      x: pos2.x,
      y: pos2.y + 15,
      text: '2. Overlapping Elements Order',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title2);

  const circle2 = new Circle({
    style: {
      cx: pos2.x + regionDim2.width / 2 - 15,
      cy: pos2.y + regionDim2.height / 2,
      r: 40,
      fill: 'green',
      cursor: 'pointer',
    },
  });

  const circle3 = new Circle({
    style: {
      cx: pos2.x + regionDim2.width / 2 + 15,
      cy: pos2.y + regionDim2.height / 2,
      r: 40,
      fill: 'yellow',
      cursor: 'pointer',
    },
  });

  canvas.appendChild(circle2);
  canvas.appendChild(circle3); // Last added is on top

  const label2 = new Text({
    style: {
      x: pos2.x + regionDim2.width / 2,
      y: pos2.y + regionDim2.height - 15,
      text: 'Yellow on top (last added)',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label2);

  circle2.addEventListener('mouseenter', () => {
    circle2.attr('fill', 'lightgreen');
  });

  circle2.addEventListener('mouseleave', () => {
    circle2.attr('fill', 'green');
  });

  circle3.addEventListener('mouseenter', () => {
    circle3.attr('fill', 'gold');
  });

  circle3.addEventListener('mouseleave', () => {
    circle3.attr('fill', 'yellow');
  });

  // Example 3: Using zIndex to control picking order
  const pos3 = layoutManager.getNextPosition();
  const regionDim3 = layoutManager.getRegionDimensions();

  const title3 = new Text({
    style: {
      x: pos3.x,
      y: pos3.y + 15,
      text: '3. zIndex Control Order',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title3);

  const rect1 = new Rect({
    style: {
      x: pos3.x + regionDim3.width / 2 - 50,
      y: pos3.y + regionDim3.height / 2 - 35,
      width: 70,
      height: 70,
      fill: 'orange',
      zIndex: 2, // Higher zIndex value should be on top
      cursor: 'pointer',
    },
  });

  const rect2 = new Rect({
    style: {
      x: pos3.x + regionDim3.width / 2 - 35,
      y: pos3.y + regionDim3.height / 2 - 20,
      width: 70,
      height: 70,
      fill: 'purple',
      zIndex: 1,
      cursor: 'pointer',
    },
  });

  canvas.appendChild(rect1);
  canvas.appendChild(rect2);

  const label3 = new Text({
    style: {
      x: pos3.x + regionDim3.width / 2,
      y: pos3.y + regionDim3.height - 15,
      text: 'Orange on top (zIndex=2)',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label3);

  rect1.addEventListener('mouseenter', () => {
    rect1.attr('fill', 'orangered');
  });

  rect1.addEventListener('mouseleave', () => {
    rect1.attr('fill', 'orange');
  });

  rect2.addEventListener('mouseenter', () => {
    rect2.attr('fill', 'violet');
  });

  rect2.addEventListener('mouseleave', () => {
    rect2.attr('fill', 'purple');
  });

  // Example 4: pointer-events property effect
  const pos4 = layoutManager.getNextPosition();
  const regionDim4 = layoutManager.getRegionDimensions();

  const title4 = new Text({
    style: {
      x: pos4.x,
      y: pos4.y + 15,
      text: '4. pointer-events Effect',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title4);

  const circle4 = new Circle({
    style: {
      cx: pos4.x + regionDim4.width / 2 - 20,
      cy: pos4.y + regionDim4.height / 2,
      r: 40,
      fill: 'pink',
      pointerEvents: 'none', // Does not respond to mouse events
      cursor: 'pointer',
    },
  });

  const circle5 = new Circle({
    style: {
      cx: pos4.x + regionDim4.width / 2 + 20,
      cy: pos4.y + regionDim4.height / 2,
      r: 40,
      fill: 'cyan',
      pointerEvents: 'visible', // Responds to mouse events
      cursor: 'pointer',
    },
  });

  canvas.appendChild(circle4);
  canvas.appendChild(circle5);

  const label4 = new Text({
    style: {
      x: pos4.x + regionDim4.width / 2,
      y: pos4.y + regionDim4.height - 15,
      text: 'Pink (no events) Cyan (has events)',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label4);

  // Pink circle does not respond to mouse events, so no hover effect
  circle5.addEventListener('mouseenter', () => {
    circle5.attr('fill', 'lightblue');
  });

  circle5.addEventListener('mouseleave', () => {
    circle5.attr('fill', 'cyan');
  });

  // Example 5: Nested elements picking
  const pos5 = layoutManager.getNextPosition();
  const regionDim5 = layoutManager.getRegionDimensions();

  const title5 = new Text({
    style: {
      x: pos5.x,
      y: pos5.y + 15,
      text: '5. Nested Elements Picking',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title5);

  const group = new Group();
  const circle6 = new Circle({
    style: {
      cx: pos5.x + regionDim5.width / 2,
      cy: pos5.y + regionDim5.height / 2,
      r: 40,
      fill: 'brown',
      cursor: 'pointer',
    },
  });

  group.appendChild(circle6);
  canvas.appendChild(group);

  const label5 = new Text({
    style: {
      x: pos5.x + regionDim5.width / 2,
      y: pos5.y + regionDim5.height - 15,
      text: 'Circle in nested group',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label5);

  circle6.addEventListener('mouseenter', () => {
    circle6.attr('fill', 'saddlebrown');
  });

  circle6.addEventListener('mouseleave', () => {
    circle6.attr('fill', 'brown');
  });

  group.addEventListener('mouseenter', () => {
    console.log('Group hovered');
  });

  // Example 6: Visibility property effect
  const pos6 = layoutManager.getNextPosition();
  const regionDim6 = layoutManager.getRegionDimensions();

  const title6 = new Text({
    style: {
      x: pos6.x,
      y: pos6.y + 15,
      text: '6. Visibility Effect',
      fontSize: 14,
      fill: '#333',
      fontWeight: 'bold',
    },
  });
  canvas.appendChild(title6);

  const circle7 = new Circle({
    style: {
      cx: pos6.x + regionDim6.width / 2 - 20,
      cy: pos6.y + regionDim6.height / 2,
      r: 40,
      fill: 'red',
      visibility: 'visible', // Visible element responds to mouse events
      cursor: 'pointer',
    },
  });

  const circle8 = new Circle({
    style: {
      cx: pos6.x + regionDim6.width / 2 + 20,
      cy: pos6.y + regionDim6.height / 2,
      r: 40,
      fill: 'blue',
      visibility: 'hidden', // Hidden element does not respond to mouse events
      cursor: 'pointer',
    },
  });

  canvas.appendChild(circle7);
  canvas.appendChild(circle8);

  const label6 = new Text({
    style: {
      x: pos6.x + regionDim6.width / 2,
      y: pos6.y + regionDim6.height - 15,
      text: 'Red (visible) Blue (hidden)',
      fontSize: 12,
      fill: '#333',
      textAlign: 'center',
    },
  });
  canvas.appendChild(label6);

  // Visible circle responds to mouse events
  circle7.addEventListener('mouseenter', () => {
    circle7.attr('fill', 'orange');
  });

  circle7.addEventListener('mouseleave', () => {
    circle7.attr('fill', 'red');
  });

  // Hidden circle has event listeners but they won't be triggered
  // This demonstrates that hidden elements are not picked during hit testing
  circle8.addEventListener('mouseenter', () => {
    circle8.attr('fill', 'lightblue');
    console.log('This should not be logged - hidden element');
  });

  circle8.addEventListener('mouseleave', () => {
    circle8.attr('fill', 'blue');
    console.log('This should not be logged - hidden element');
  });

  console.log('Hit test examples loaded');
  console.log('Hover over different elements to see picking effects');
}
