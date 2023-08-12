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
