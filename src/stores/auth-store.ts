import { api } from 'boot/axios';
import { defineStore } from 'pinia';

import { User } from 'components/user/type';

export const authStore = defineStore('auth', {
  state: () => ({
    user: <User>{},
    authenticated: false,
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
      this.user = { id: '' };
      this.authenticated = false;
    },

    async fetchProfile() {
      const resp = await api.get('/me');
      this.user = resp.data.user;
      this.authenticated = true;
    },
  },
});
