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
import { Notify } from 'quasar';
import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $utils: {
      copyToClipboard: (text: string | undefined) => void;
    };
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$utils = {
    async copyToClipboard(text: string | undefined) {
      try {
        if (!navigator.clipboard) {
          Notify.create({
            message: '您的浏览器不支持复制到剪切板',
            color: 'negative',
            position: 'top',
            classes: 'text-caption',
            timeout: 1000,
          });
        } else if (!text) {
          Notify.create({
            message: '复制内容为空',
            color: 'negative',
            position: 'top',
            classes: 'text-caption',
            timeout: 1000,
          });
        } else {
          await navigator.clipboard.writeText(text);
          Notify.create({
            message: '复制成功',
            color: 'grey-8',
            position: 'top',
            classes: 'text-caption',
            timeout: 1000,
          });
        }
      } catch (e) {
        throw e;
      }
    },
  };
});
