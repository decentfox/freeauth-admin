<template>
  <q-card bordered class="q-pa-lg guard-frame">
    <guard-header description="为了保证账户安全，请设置您的新密码。" />
    <div class="q-pt-lg bg-white">
      <reset-pwd-form :color="loginSettings.guardPrimaryColor" />
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { loginSettingsStore } from 'stores/login-settings-store';

export default defineComponent({
  name: 'ResetPwdFrame',

  setup() {
    return {};
  },

  computed: {
    ...mapState(loginSettingsStore, ['loginSettings']),
  },
});
</script>

<style lang="scss" scoped></style>
