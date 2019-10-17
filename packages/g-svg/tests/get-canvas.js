import Canvas from '../src/canvas';

export default function getCanvas(container) {
  const div = document.createElement('div');
  div.id = container;
  // clear body content for testing getBoundingClientRect()
  while (document.body.hasChildNodes()) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(div);

  return new Canvas({
    container,
    width: 1000,
    height: 1000,
  });
}
