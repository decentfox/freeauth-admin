import { api } from 'boot/axios';
import { defineStore } from 'pinia';

import { LoginSetting } from 'components/login/type';

export const loginSettingsStore = defineStore('login-settings', {
  state: () => ({
    ready: false,
    loginSettings: <LoginSetting>{},
  }),

  getters: {
    signupEnabled(): boolean {
      return !!this.loginSettings.signupModes?.length;
    },

    signinEnabled(): boolean {
      return this.codeLoginEnabled || this.pwdLoginEnabled;
    },

    codeLoginEnabled(): boolean {
      return !!this.loginSettings.codeSigninModes?.length;
    },

    pwdLoginEnabled(): boolean {
      return !!this.loginSettings.pwdSigninModes?.length;
    },
  },

  actions: {
    async loadSettings() {
      const resp = await api.get('/login_settings');
      this.loginSettings = resp.data;
      this.ready = true;
    },

    async saveSettings() {
      const resp = await api.put('/login_settings', this.loginSettings);
      this.loginSettings = resp.data;
    },
  },
});
