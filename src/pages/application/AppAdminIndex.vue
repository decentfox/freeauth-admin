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
  <page-wrapper page-title="应用管理">
    <div
      class="text-center q-pa-md flex flex-center"
      style="height: calc(100vh - 200px)"
    >
      <div>
        <div class="text-grey-9 q-mb-lg" style="font-size: 8vh">敬请期待</div>
        <q-btn flat class="primary-btn" to="/more" label="查看更多" />
      </div>
    </div>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppAdminIndex',
});
</script>
