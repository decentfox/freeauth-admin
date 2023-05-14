<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-bg">
        <signup-and-login-frame
          v-model="currentGuardFrame"
          v-model:signup-mode="currentSignupMode"
          v-model:login-mode="currentLoginMode"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions, mapState } from 'pinia';

import { AuthMode, GuardMode, LoginMode } from 'components/login/type';
import { loginSettingsStore } from 'stores/login-settings-store';

export default defineComponent({
  name: 'LoginPage',

  setup() {
    return {
      currentGuardFrame: ref(GuardMode.signin),
      currentSignupMode: ref(AuthMode.mobile),
      currentLoginMode: ref(LoginMode.code),
    };
  },

  computed: {
    ...mapState(loginSettingsStore, [
      'loginSettings',
      'ready',
      'signupEnabled',
      'signinEnabled',
      'codeLoginEnabled',
      'pwdLoginEnabled',
    ]),
  },

  created() {
    this.loadLoginSettings();
  },

  methods: {
    ...mapActions(loginSettingsStore, ['loadSettings']),

    async loadLoginSettings() {
      await this.loadSettings();
      this.currentGuardFrame = this.signinEnabled
        ? GuardMode.signin
        : GuardMode.signup;
      this.currentSignupMode = this.loginSettings.signupModes?.includes(
        AuthMode.mobile
      )
        ? AuthMode.mobile
        : AuthMode.email;
      this.currentLoginMode = this.codeLoginEnabled
        ? LoginMode.code
        : LoginMode.password;
    },
  },
});
</script>
