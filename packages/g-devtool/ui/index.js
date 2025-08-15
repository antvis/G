import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import Devtool from './components/Devtool';
import 'antd/dist/antd.css';

window.mount = (data = [], container, actions = {}) => {
  if (createRoot) {
    // React 18+
    const root = createRoot(container);
    root.render(<Devtool data={data} actions={actions} />);
  } else {
    // 兼容旧版本
    ReactDOM.render(<Devtool data={data} actions={actions} />, container);
  }
}