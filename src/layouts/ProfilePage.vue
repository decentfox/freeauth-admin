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
  <page-wrapper can-go-back>
    <q-toolbar class="q-my-xs">
      <slot name="toolbar-left">
        <boolean-chip :value="status" true-label="正常" false-label="禁用" />
        <div class="text-h6 q-ml-md">{{ name }}</div>
      </slot>
      <q-space />
      <slot name="toolbar-right"></slot>
    </q-toolbar>
    <slot name="tab-bar">
      <q-tabs
        :model-value="tabValue"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        @update:model-value="(value: string) => $emit('update:tabValue', value)"
      >
        <q-tab
          v-for="(tab, idx) in tabs"
          :key="idx"
          :name="tab.name"
          :label="tab.label"
        />
      </q-tabs>
    </slot>
    <q-separator inset />
    <q-tab-panels
      :model-value="tabValue"
      animated
      keep-alive
      class="scroll q-pa-none"
      style="height: calc(100vh - 250px)"
    >
      <slot name="panels"></slot>
    </q-tab-panels>
    <slot name="dialog"></slot>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ProfileTab } from './type';

export default defineComponent({
  name: 'ProfilePage',

  props: {
    status: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      default: '',
    },
    tabValue: {
      type: String,
      default: '',
    },
    tabs: {
      type: Array as PropType<ProfileTab[]>,
      default: null,
    },
  },

  emits: ['update:tabValue'],
});
</script>
