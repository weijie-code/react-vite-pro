import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'antd/dist/antd.css';
import { umiConfig, viteConfig } from '../viteConfig';
import dva from 'dva';
import { createBrowserHistory } from 'history';
import { HashRouter, Route, BrowserRouter, Switch } from 'react-router-dom';
import loadable from '@loadable/component'


// 引入所有model  
const allModel = import.meta.globEager('../src/models/*.ts');

// 不使用不会引入，导致动态导入失败
const loada = loadable(() => { })
let routerConfig = [];
// 渲染路由方法，递归渲染子路由
const renderRoute = (router: any) => {
  if (!router) return
  return router.map((item: any) => {
    const child = renderRoute(item?.routes)
    let Element = item.component
    return <Route
      key={item.path}
      path={`${item.path.replace('./', '/*').replace('/', '/*')}`}
      component={() => (
        <Element>{child}</Element>
      )}

    ></Route>
  });
};

// 默认使用dva，可以根据自己项目需求自行改造
// 创建 dva 实例
const app = dva({
  history: createBrowserHistory(),
});
// 注册 model
Object.keys(allModel).forEach((key) => {
  allModel[key]?.default && app.model(allModel[key].default);
});

const router = (
  <BrowserRouter>
    <Switch>
      {renderRoute(routerConfig)}
    </Switch>
  </BrowserRouter>
);
app.router(() => router);

// 渲染
ReactDOM.render(
  <div>
    {
      <Provider store={app.start()().props.store}>
        {/* {<Main></Main>} */}
        {router}
      </Provider>
    }
  </div>,
  document.getElementById('root'),
);
