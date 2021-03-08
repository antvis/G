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
          zh: '使用文档',
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
        slug: 'examples',
        title: {
          zh: '示例',
          en: 'Examples',
        },
      },
    ],
    docs: [
      {
        slug: 'guide/render',
        title: {
          zh: '渲染',
          en: 'Render',
        },
        order: 2,
      },
      {
        slug: 'guide/hit',
        title: {
          zh: '拾取',
          en: 'Hit',
        },
        order: 3,
      },
      {
        slug: 'guide/event',
        title: {
          zh: '事件',
          en: 'Event',
        },
        order: 4,
      },
      {
        slug: 'guide/animation',
        title: {
          zh: '动画',
          en: 'Animation',
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
        slug: 'api/group',
        title: {
          zh: 'Group 图形分组',
          en: 'Group',
        },
        order: 2,
      },
      {
        slug: 'api/shape',
        title: {
          zh: 'Shape 图形',
          en: 'Shape',
        },
        order: 3,
      },
    ],
    examples: [
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
    ],
    docsearchOptions: {
      apiKey: 'c0fb0f71e3b70638cf4756bf128a42e6',
      indexName: 'antv_g',
    },
    // playground: {
    //   // container: '<div style="justify-content: center;position: relative" id="wrapper"/>',
    //   playgroundDidMount: `(function(history){
    //     var pushState = history.pushState;
    //     history.pushState = function(state) {
    //       window.clean && window.clean();
    //       return pushState.apply(history, arguments);
    //     };
    //   })(window.history);`,
    //   playgroundWillUnmount: 'window.clean && window.clean();',
    //   dependencies: {
    //     '@antv/g-canvas': 'latest',
    //     '@antv/g-webgl': 'latest',
    //   },
    // },
  },
};
