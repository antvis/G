module.exports = {
  plugins: [
    {
      resolve: '@antv/gatsby-theme-antv',
      options: {
        GATrackingId: `UA-148148901-3`,
      },
    },
    'gatsby-plugin-workerize-loader',
  ],
  siteMetadata: {
    title: 'G',
    description: 'A powerful rendering engine for AntV.',
    siteUrl: 'https://g.antv.vision',
    githubUrl: 'https://github.com/antvis/g',
    navs: [
      {
        slug: 'docs/guide',
        title: {
          zh: '教程',
          en: 'Guide',
        },
      },
      {
        slug: 'docs/api',
        title: {
          zh: 'API 文档',
          en: 'API',
        },
      },
      {
        slug: 'examples/shape#circle',
        title: {
          zh: '示例',
          en: 'Examples',
        },
      },
      {
        slug: 'docs/plugins',
        title: {
          zh: '插件',
          en: 'Plugins',
        },
      },
      {
        slug: 'docs/inside-g',
        title: {
          zh: '开发文档',
          en: 'Inside G',
        },
      },
    ],
    docs: [
      {
        slug: 'guide/diving-deeper',
        title: {
          zh: '进阶内容',
          en: 'Diving Deeper',
        },
        order: 4,
      },
      {
        slug: 'guide/advanced-topics',
        title: {
          zh: '高级话题',
          en: 'Advanced Topics',
        },
        order: 5,
      },
      // API
      {
        slug: 'api/general',
        title: {
          zh: '通用',
          en: 'General',
        },
        order: 0,
      },
      {
        slug: 'api/canvas',
        title: {
          zh: '画布',
          en: 'Canvas',
        },
        order: 0,
      },
      {
        slug: 'api/renderer',
        title: {
          zh: '渲染器',
          en: 'Renderer',
        },
        order: 0,
      },
      {
        slug: 'api/basic',
        title: {
          zh: '基础图形',
          en: 'Basic Shapes',
        },
        order: 1,
      },
      {
        slug: 'api/advanced',
        title: {
          zh: '高级图形',
          en: 'Advanced Shapes',
        },
        order: 2,
      },
      {
        slug: 'api/css',
        title: {
          zh: '样式系统',
          en: 'Style System',
        },
      },
      {
        slug: 'api/3d',
        title: {
          zh: '三维世界',
          en: '3D',
        },
        order: 3,
      },
      {
        slug: 'api/builtin-objects',
        title: {
          zh: '内置对象',
          en: 'Built-in Objects',
        },
        order: 3,
      },
      {
        slug: 'api/gpgpu',
        title: {
          zh: 'GPGPU',
          en: 'GPGPU',
        },
        order: 4,
      },
      {
        slug: 'api/declarative',
        title: {
          zh: '声明式用法',
          en: 'Declarative programming',
        },
        order: 4,
      },
      {
        slug: 'api/devtools',
        title: {
          zh: '开发调试工具',
          en: 'Devtools',
        },
        order: 5,
      },
      {
        slug: 'api/inside-g',
        title: {
          zh: 'Inside G',
          en: 'Inside G',
        },
        order: 4,
      },
      // 插件
      {
        slug: 'plugins',
        title: {
          zh: '插件',
          en: 'Plugins',
        },
      },
    ],
    examples: [
      {
        slug: 'scenegraph',
        title: {
          zh: '场景图',
          en: 'Scene Graph',
        },
      },
      {
        slug: 'shape',
        title: {
          zh: '基本图形',
          en: 'Shape',
        },
      },
      {
        slug: 'style',
        title: {
          zh: '样式系统',
          en: 'Style System',
        },
      },
      {
        slug: 'event',
        title: {
          zh: '事件系统',
          en: 'Event System',
        },
      },
      {
        slug: 'animation',
        title: {
          zh: '动画',
          en: 'Animation',
        },
      },
      {
        slug: 'perf',
        title: {
          zh: '性能',
          en: 'Performance',
        },
      },
    ],
    docsearchOptions: {
      versionV3: false,
      apiKey: 'c0fb0f71e3b70638cf4756bf128a42e6',
      indexName: 'antv_g',
    },
  },
};
