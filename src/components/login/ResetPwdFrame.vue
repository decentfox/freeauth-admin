<!--
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
-->
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
