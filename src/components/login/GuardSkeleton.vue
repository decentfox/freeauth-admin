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
  <div class="q-pa-md frame-panel">
    <div class="row items-center q-pt-sm">
      <q-skeleton class="q-mr-md img-wrapper" />
      <q-item-section>
        <q-skeleton />
      </q-item-section>
    </div>
    <div class="flex q-gutter-md q-mt-lg">
      <q-skeleton height="24px" width="70px" square />
      <q-skeleton height="24px" width="70px" square />
    </div>
    <div class="q-gutter-md q-pt-lg">
      <q-skeleton height="40px" />
      <q-skeleton height="40px" />
    </div>
    <q-item-section class="q-pt-lg flex">
      <q-skeleton height="40px" square />
    </q-item-section>
    <div class="q-pt-md flex flex-center">
      <q-skeleton width="60%" type="text" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GuardSkeleton',
});
</script>
