<template>
  <q-page class="full-width q-pa-md">
    <q-btn unelevated dense class="no-hover-btn hint-label" @click="goBack">
      <q-icon size="18px" name="arrow_back_ios_new" />返回
    </q-btn>
    <q-toolbar class="q-my-xs">
      <slot name="toolbar-left">
        <q-chip
          square
          size="12px"
          :label="status ? '正常' : '禁用'"
          class="text-weight-bold q-pa-sm q-mr-md"
          :class="!status ? 'chip-status-on' : 'chip-status-off'"
        />
        <div class="text-h6">{{ name }}</div>
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
        @update:model-value="(value) => $emit('update:tabValue', value)"
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
    <q-tab-panels :model-value="tabValue" animated>
      <slot name="panels"></slot>
    </q-tab-panels>
    <slot name="dialog"></slot>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ProfileTab } from './type';

export default defineComponent({
  name: 'ProfilePage',

  components: {},

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

  setup() {
    return {};
  },

  methods: {
    goBack() {
      this.$router.back();
    },
  },
});
</script>
