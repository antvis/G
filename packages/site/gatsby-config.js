module.exports = {
  plugins: [
    {
      resolve: '@antv/gatsby-theme-antv',
      options: {
        GATrackingId: `UA-148148901-3`,
      },
    },
  ],
  siteMetadata: {
    title: 'G',
    description: 'A powerful rendering engine for AntV providing canvas and svg draw',
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
        slug: 'docs/api/basic',
        title: {
          zh: 'API 文档',
          en: 'API',
        },
      },
      {
        slug: 'examples',
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
          zh: 'Canavs 画布',
          en: 'Canavs',
        },
        order: 1,
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
        slug: 'api/builtin-objects',
        title: {
          zh: '内置对象',
          en: 'Built-in Objects',
        },
        order: 3,
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
        slug: 'event',
        title: {
          zh: '事件',
          en: 'Event',
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
      apiKey: 'c0fb0f71e3b70638cf4756bf128a42e6',
      indexName: 'antv_g',
    },
  },
};
