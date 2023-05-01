import { Notify } from 'quasar';
import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $utils: {
      copyToClipboard: (text: string) => void;
    };
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$utils = {
    async copyToClipboard(text: string) {
      try {
        if (!navigator.clipboard) {
          Notify.create({
            message: '您的浏览器不支持复制到剪切板',
            color: 'negative',
            position: 'top',
            classes: 'text-caption',
            timeout: 1000,
          });
        } else {
          await navigator.clipboard.writeText(text);
          Notify.create({
            message: '复制成功',
            color: 'info',
            textColor: 'primary',
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
