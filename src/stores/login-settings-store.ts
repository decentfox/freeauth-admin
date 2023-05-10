import { api } from 'boot/axios';
import { defineStore } from 'pinia';

import { LoginSetting } from 'components/login/type';

export const loginSettingsStore = defineStore('login-settings', {
  state: () => ({
    loginSettings: <LoginSetting>{},
  }),

  getters: {},

  actions: {
    async loadSettings() {
      const resp = await api.get('/login_settings');
      this.loginSettings = resp.data;
    },

    async saveSettings() {
      const resp = await api.put('/login_settings', this.loginSettings);
      this.loginSettings = resp.data;
    },
  },
});
