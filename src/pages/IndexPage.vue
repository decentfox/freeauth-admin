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
  <page-wrapper page-title="首页">
    <q-item-label class="q-pa-sm">
      您好，{{ currentUser.name }}（用户名：{{
        currentUser.username
      }}），欢迎使用 FreeAuth！<br /><br />
      请您在使用前，先与本系统的管理员确认您所需的权限是否已完成配置。
    </q-item-label>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { authStore } from 'stores/auth-store';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    return {};
  },

  computed: {
    ...mapState(authStore, ['currentUser']),
  },
});
</script>
