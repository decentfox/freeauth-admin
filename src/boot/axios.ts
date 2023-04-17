import axios, { AxiosInstance } from 'axios';
import { Loading, Notify } from 'quasar';
import { boot } from 'quasar/wrappers';

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
const api = axios.create({ baseURL: '/api' });

export default boot(({ app }) => {
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

      if (response.data.success === false) {
        return Promise.reject(response);
      }

      return response;
    },
    (err) => {
      Loading.hide();
      return Promise.reject(err.response);
    }
  );
});

export { api };
