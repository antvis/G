import { defineConfig } from 'dumi';
import { version } from '../packages/g/package.json';

export default defineConfig({
  locales: [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
  ],
  title: 'G',
  favicons: [
    'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*7svFR6wkPMoAAAAAAAAAAAAADmJ7AQ/original',
  ], // 网站 favicon
  themeConfig: {
    title: 'G',
    description: 'A flexible rendering engine for visualization.',
    defaultLanguage: 'zh', // 默认语言
    isAntVSite: false, // 是否是 AntV 的大官网
    footerTheme: 'light', // 白色 底部主题
    versions: {
      // 历史版本以及切换下拉菜单
      [version]: 'https://g.antv.antgroup.com',
      '4.x': 'https://g.antv.vision/',
    },
    siteUrl: 'https://g.antv.antgroup.com',
    githubUrl: 'https://github.com/antvis/g',
    detail: {
      engine: {
        zh: 'G',
        en: 'G',
      },
      title: {
        zh: 'G·一个灵活的可视化渲染引擎',
        en: 'G·A flexible rendering engine for visualization.',
      },
      description: {
        zh: '为上层提供稳定一致的渲染和通用计算能力',
        en: 'G is dedicated to provide consistent and high performance 2D / 3D graphics rendering capabilities for upper layer products.',
      },
      image:
        'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*OlhnTbTFWooAAAAAAAAAAAAADmJ7AQ/original',
      imageStyle: {
        marginLeft: '70px',
        marginTop: '75px',
      },
      buttons: [
        {
          text: {
            zh: '开始使用',
            en: 'Getting Started',
          },
          link: `/guide/getting-started`,
        },
        {
          text: {
            zh: '更多示例',
            en: 'Examples',
          },
          link: `/examples/`,
          type: 'primary',
        },
      ],
    },
    navs: [
      {
        slug: 'docs/guide',
        title: {
          zh: '教程',
          en: 'Tutorials',
        },
      },
      {
        slug: 'docs/api',
        title: {
          zh: 'API',
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
      // {
      //   slug: 'docs/inside-g',
      //   title: {
      //     zh: '开发文档',
      //     en: 'Inside G',
      //   },
      // },
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
        order: 1,
      },
      {
        slug: 'api/camera',
        title: {
          zh: '相机',
          en: 'Camera',
        },
        order: 2,
      },
      {
        slug: 'api/event',
        title: {
          zh: '事件',
          en: 'Event',
        },
        order: 3,
      },
      {
        slug: 'api/animation',
        title: {
          zh: '动画',
          en: 'Animation',
        },
        order: 4,
      },
      {
        slug: 'api/basic',
        title: {
          zh: '基础图形',
          en: 'Basic Shapes',
        },
        order: 5,
      },
      {
        slug: 'api/css',
        title: {
          zh: '样式系统',
          en: 'Style System',
        },
        order: 7,
      },
      {
        slug: 'api/3d',
        title: {
          zh: '三维世界',
          en: '3D',
        },
        order: 8,
      },
      {
        slug: 'api/builtin-objects',
        title: {
          zh: '内置对象',
          en: 'Built-in Objects',
        },
        order: 9,
      },
      {
        slug: 'api/gpgpu',
        title: {
          zh: 'GPGPU',
          en: 'GPGPU',
        },
        order: 10,
      },
      {
        slug: 'api/declarative',
        title: {
          zh: '声明式用法',
          en: 'Declarative programming',
        },
        order: 11,
      },
      {
        slug: 'api/devtools',
        title: {
          zh: '开发调试工具',
          en: 'Devtools',
        },
        order: 12,
      },
    ],
    examples: [
      {
        slug: 'canvas',
        title: {
          zh: '画布',
          en: 'Canvas',
        },
      },
      {
        slug: 'camera',
        title: {
          zh: '相机',
          en: 'Camera',
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
        slug: 'scenegraph',
        title: {
          zh: '场景图',
          en: 'Scene Graph',
        },
      },
      {
        slug: 'plugins',
        title: {
          zh: '插件',
          en: 'Plugins',
        },
      },
      {
        slug: 'gpgpu',
        title: {
          zh: 'GPGPU',
          en: 'GPGPU',
        },
      },
      {
        slug: '3d',
        title: {
          zh: '3D',
          en: '3D',
        },
      },
      {
        slug: 'ecosystem',
        title: {
          zh: '生态',
          en: 'Ecosystem',
        },
      },
      {
        slug: 'perf',
        title: {
          zh: '性能',
          en: 'Performance',
        },
      },
      {
        slug: 'guide',
        title: {
          zh: '教程',
          en: 'Guide',
        },
      },
    ],
    news: [
      {
        type: {
          zh: '论坛',
          en: 'Forum',
        },
        title: {
          zh: 'AntV 芒种日 图新物：GraphInsight 发布',
          en: 'AntV Seeds Day Graph New: GraphInsight Released',
        },
        date: '2022.06.06',
        link: 'https://github.com/antvis/GraphInsight',
      },
      {
        type: {
          zh: '论坛',
          en: 'Forum',
        },
        title: {
          zh: 'SEE Conf 2022 支付宝体验科技大会',
          en: 'SEE Conf 2022 Alipay Experience Technology Conference',
        },
        date: '2022.01.08',
        link: 'https://seeconf.antfin.com/',
      },
    ],
    companies: [
      {
        name: '阿里云',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*V_xMRIvw2iwAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '支付宝',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*lYDrRZvcvD4AAAAAAAAAAABkARQnAQ',
      },
      {
        name: '天猫',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*BQrxRK6oemMAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '淘宝网',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*1l8-TqUr7UcAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '网上银行',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*ZAKFQJ5Bz4MAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '京东',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*yh-HRr3hCpgAAAAAAAAAAABkARQnAQ',
      },
      {
        name: 'yunos',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*_js7SaNosUwAAAAAAAAAAABkARQnAQ',
      },
      {
        name: '菜鸟',
        img: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*TgV-RZDODJIAAAAAAAAAAABkARQnAQ',
      },
    ],
    cases: [
      // {
      //   logo: 'https://gw.alipayobjects.com/mdn/rms_d314dd/afts/img/A*Uh1MSpdcj-kAAAAAAAAAAABkARQnAQ',
      //   title: {
      //     zh: '图表实验室',
      //     en: 'Advanced Features',
      //   },
      //   description: {
      //     zh: '来这里尝试一下我们正在开发中的高级图表功能',
      //     en: 'We are now working on some advanced and powerful chart features.',
      //   },
      //   link: `/examples/plugin/multi-view`,
      //   image:
      //     'https://gw.alipayobjects.com/mdn/rms_d314dd/afts/img/A*SXLtRaVPGvMAAAAAAAAAAABkARQnAQ',
      //   isAppLogo: true,
      // },
    ],
    features: [
      {
        icon: 'https://gw.alipayobjects.com/zos/basement_prod/eae0ee4e-acbf-4486-88eb-ea17f441a0d5.svg',
        title: {
          zh: '易用的 API',
          en: 'Easy-to-use API',
        },
        description: {
          zh: '其中图形、事件系统兼容 DOM Element & Event API，动画系统兼容 Web Animations API。可以以极低的成本适配 Web 端已有的生态例如 D3、Hammer.js 手势库等。',
          en: 'The graphics and event system is compatible with DOM Element & Event API, and the animation system is compatible with Web Animations API, which can be adapted to the existing ecosystem of Web side such as D3, Hammer.js gesture library, etc. at a very low cost.',
        },
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/basement_prod/7269ccc5-fbe2-4e55-85d1-17c05917e8b0.svg',
        title: {
          zh: '适配 Web 端多种渲染环境',
          en: 'Support multiple rendering environments',
        },
        description: {
          zh: '支持 Canvas2D / SVG / CanvasKit / WebGL / WebGPU 以及运行时切换，并支持服务端渲染。',
          en: 'Support Canvas2D / SVG / WebGL / WebGPU / CanvasKit and runtime switching, and also server-side rendering.',
        },
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/basement_prod/d77e48ed-4e4c-43f5-bd83-329e12c28c16.svg',
        title: {
          zh: '丰富的插件集',
          en: 'A rich set of plug-ins',
        },
        description: {
          zh: '可扩展的插件机制以及丰富的插件集',
          en: 'Extensible plug-in mechanism and rich set of plug-ins.',
        },
      },
    ],
    playground: {
      extraLib: '',
      // container: '<div id="container"><div id="container1"></div><div id="container2"></div></div>', // 定义演示的渲染节点，默认 <div id="container" />
      devDependencies: {
        typescript: 'latest',
      },
    },
    docsearchOptions: {
      apiKey: 'c0fb0f71e3b70638cf4756bf128a42e6',
      indexName: 'antv_g',
    },
    announcement: {
      zh: '',
      en: '',
    },
  },
  alias: {
    '@': __dirname,
  },
  copy: ['static'],
  jsMinifier: 'terser',
  mfsu: false,
  analytics: {
    // google analytics 的 key (GA 4)
    // ga_v2: 'G-abcdefg',
    // 若你在使用 GA v1 旧版本，请使用 `ga` 来配置
    ga_v2: 'G-3L8SSDC4X6',
    // 百度统计的 key
    // baidu: 'baidu_tongji_key',
  },
});
