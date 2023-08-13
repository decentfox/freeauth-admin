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
import { Notify } from 'quasar';

import { User } from 'components/user/type';

interface AuthError {
  reset_pwd_on_next_login?: string;
}

export const authStore = defineStore('auth', {
  state: () => ({
    currentUser: <User>{},
    authenticated: false,
    resetPwdRequired: false,
  }),

  getters: {},

  actions: {
    async signOut() {
      await api.post(
        '/sign_out',
        {},
        {
          hideProgress: true,
        }
      );
      this.currentUser = { id: '' };
      this.authenticated = false;
    },

    async fetchProfile() {
      try {
        const resp = await api.get('/me');
        this.currentUser = resp.data;
        this.authenticated = true;
        this.resetPwdRequired = false;
      } catch (e) {
        const err: AuthError = (e as Error).cause || {};
        if (err.reset_pwd_on_next_login) {
          this.resetPwdRequired = true;
          Notify.create({
            type: 'negative',
            message: err.reset_pwd_on_next_login,
          });
        }
      }
    },

    hasAnyPermission(permList: string[]) {
      return (
        this.currentUser.perms?.includes('*') ||
        permList.filter((p) => this.currentUser.perms?.includes(p)).length > 0
      );
    },
  },
});
