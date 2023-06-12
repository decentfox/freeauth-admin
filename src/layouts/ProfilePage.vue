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
    <q-tab-panels :model-value="tabValue" animated keep-alive>
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
