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
import axios, { AxiosInstance } from 'axios';
import { get } from 'lodash';
import { Loading, Notify } from 'quasar';
import { boot } from 'quasar/wrappers';

import { authStore } from 'stores/auth-store';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    successMsg?: string;
    showProgress?: boolean;
    hideProgress?: boolean;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: '/v1' });

export default boot(({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  api.interceptors.request.use((config) => {
    if (
      config.showProgress ||
      (!config.hideProgress &&
        config.method &&
        ['put', 'post', 'patch', 'delete'].includes(config.method))
    ) {
      Loading.show();
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      Loading.hide();
      if (response.config.successMsg) {
        Notify.create({
          type: 'positive',
          message: response.config.successMsg,
        });
      }
      return Promise.resolve(response);
    },
    (err) => {
      Loading.hide();
      const error = get(err.response, 'data.detail');
      let message = '请求失败';
      if (typeof error === 'string') {
        message = error;
      } else if (error) {
        message = error.message;
      }
      const errObj = new Error(err.response.status, {
        cause: get(error, 'errors'),
      });

      if (err.response.status === 401) {
        router.push('/login');
        return Promise.reject(errObj);
      }

      if (err.response.status === 403) {
        router.push('/');
        const auth = authStore();
        auth.fetchProfile();
        return Promise.reject(errObj);
      }

      Notify.create({
        type: 'negative',
        message: message,
      });
      return Promise.reject(errObj);
    }
  );
});

export { api };
