/*
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
*/
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { LoadingBar, Notify } from 'quasar';
import { route } from 'quasar/wrappers';

import { appStore } from 'stores/app-store';
import { authStore } from 'stores/auth-store';

import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    LoadingBar.start();

    const auth = authStore();
    const requiredPerms = to.meta.requiredPerms;
    if (auth.authenticated && requiredPerms) {
      if (!auth.hasAnyPermission(requiredPerms)) {
        Notify.create({
          type: 'negative',
          message: '权限不足',
        });
        LoadingBar.stop();
        return '/';
      }
    }

    const app = appStore();
    if (to.meta.keepAlive && (!to.query.nonce || app.keepAliveDisabled)) {
      const nonce = new Date().getTime();
      const query = Object.assign({ nonce: nonce }, to.query);
      next({ path: to.path, query: query });
    } else {
      next();
    }
  });

  Router.afterEach(() => {
    LoadingBar.stop();

    const app = appStore();
    app.keepAliveDisabled = false;
  });

  return Router;
});
