// Prefix for all element to use

const DEFAULT_TAG_PREFIX = 'g';

// init global params in window

if (!window.__G_TAG_MAP__) {
  window.__G_TAG_MAP__ = new Map();
}

// define a element in browser

export const registerGWebComponent = (
  name: string,
  Component: CustomElementConstructor,
) => {
  const map = window.__G_TAG_MAP__;
  map.set(name, Component);
  customElements.define(`${DEFAULT_TAG_PREFIX}-${name}`, Component);
};

export const cleanGWebComponent = (name: string) => {
  customElements.define(name, HTMLElement);
};
