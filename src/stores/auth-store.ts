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
