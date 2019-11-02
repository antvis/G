module.exports = {
  plugins: [
    {
      resolve: '@antv/gatsby-theme-antv',
      options: {
        GATrackingId: `UA-148148901-3`,
        primaryColor: '#1890ff',
        pathPrefix: '/g',
      },
    },
  ],
  siteMetadata: {
    title: 'G',
    description: 'A powerful rendering engine for AntV providing canvas and svg draw',
    githubUrl: 'https://github.com/antvis/g',
    navs: [
      {
        slug: 'docs/guide',
        title: {
          zh: '教程',
          en: 'Guide',
        },
        redirect: 'getting-started',
      },
      {
        slug: 'docs/api',
        title: {
          zh: '接口',
          en: 'API',
        },
        redirect: 'canvas',
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
    ],
  },
};
