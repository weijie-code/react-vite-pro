import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteMockServe } from 'vite-plugin-mock';
import vitePluginRequire from 'vite-plugin-require';
import { umiConfig, viteConfig } from '../viteConfig';

let config = { ...umiConfig, ...viteConfig };


// 生成router 字符串 因为动态路由vite直接写会报错！！！！！！！！！！！！！！！！
let routerConfig = config.routes;
const initRoute = (routers) => {
  routers.forEach(item => {
    if (item.component) {
      let atr = item.component.replace('@', '../src')
      item.component = `loadable(() => import('${atr}'))`
    }
    item?.routes?.length && initRoute(item?.routes)
  });
}
initRoute(routerConfig)
let routerStr = JSON.stringify(routerConfig)

routerStr = routerStr.replace(/"loadable/g, "loadable")
routerStr = routerStr.replace(/\)\)"/g, "))")

routerStr = `
let routerConfig =  ${routerStr}
`
// 生成router 字符串结束


const localEnabled = config.hasOwnProperty('mock') ? false : true;

const prodEnabled = !!process.env.USE_CHUNK_MOCK || false;

export default defineConfig({
  plugins: [
    {
      name: 'originjs:commonjs',
      apply: 'serve',
      transform(code, id) {
        let result = code;
        // 增加cssmodule  
        if (code.match(/import [a-z]+ from ".+\.less"/)) {
          result = code.replace(/(import [a-z]+ from ".+\.less)(")/, ($1, $2, $3) => {
            return `${$2}?module=true${$3}`;
          });
        }
        // 修改umi的useDispatch 没有上下文环境，这段代码可以根据自己项目情况，判断是否需要
        if (code.indexOf('useDispatch()') > -1) {
          result = `import { useDispatch as viteUseDispatch, useSelector as viteUseSelector } from 'react-redux' \n` + result;
          // 全局替换
          result = result.replace(/useSelector\(/g, "viteUseSelector(")
          result = result.replace(/useDispatch\(\)/g, "viteUseDispatch()")
        }
        // 修改umi的useDispatch 没有上下文环境，这段代码可以根据自己项目情况，判断是否需要
        // if (code.indexOf(`connect(`) > -1 && id.indexOf('.tsx') > -1) {
        //   result = `import { connect as viteconnect } from 'react-redux' \n` + result;
        //   // 全局替换
        //   result = result.replace(/connect\(/g, "viteconnect(")
        // }

        // 在main.tsx 中增加路由相关
        if (id.indexOf(`/vite-project/main.tsx`) > -1) {
          result = result.replace('let routerConfig = [];', routerStr);
        }
        return {
          code: result,
          map: null,
          warnings: null,
        };
      },
    },

    react(),
    // require插件
    vitePluginRequire({
      // @fileRegex RegExp
      // optional：default file processing rules are as follows
      // fileRegex:/(.jsx?|.tsx?|.vue)$/
    }),
    // mock数据插件
    viteMockServe({
      mockPath: './mock',
      localEnabled: localEnabled, // 开发打包开关
      prodEnabled: prodEnabled, // 生产打包开关
      // 这样可以控制关闭mock的时候不让mock打包到最终代码内
      injectCode: `
        import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();
      `,
      logger: false, //是否在控制台显示请求日志
      supportTs: true, //打开后，可以读取 ts 文件模块。 请注意，打开后将无法监视.js 文件
    }),
  ],
  define: {
    process: {
      env: {
        __IS_SERVER: null,
        isVite: true,
      },
    },
  },
  css: {
    // 解决cssmodule
    // @ts-ignore
    isModule(id) {
      if (id.indexOf('module=true') !== -1) {
        return true;
      }
    },
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#ff8420',
          'link-color': '#2DB7F5',
          'border-radius-base': '4px',
          'text-color': '#666',
          'font-size-base': '14px',
        },
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@@': path.resolve(__dirname, '../src/.umi'),
    },
  },
  // server:{
  //   hmr:{
  //     overlay: false
  //   }
  // }
});
