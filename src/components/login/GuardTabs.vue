<template>
  <q-tabs
    :model-value="modelValue"
    dense
    class="text-grey q-mt-lg"
    align="left"
    narrow-indicator
    :style="{
      width: options.length * 102 + 'px',
      color: !!color ? `${color} !important` : null,
    }"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <q-tab
      v-for="(mode, idx) in tabOptions"
      :key="idx"
      :name="mode.name"
      :label="mode.label"
    />
  </q-tabs>
  <q-separator color="grey-4" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import {
  AuthMode,
  AuthModeLabel,
  GuardMode,
  LoginMode,
  LoginModeLabel,
} from './type';

export default defineComponent({
  name: 'GuardTabs',

  props: {
    /** 当前选中的选项卡名称 */
    modelValue: {
      type: String as PropType<LoginMode | AuthMode>,
      default: null,
    },
    /** 选项卡类型：注册或登录 */
    guardMode: {
      type: String as PropType<GuardMode>,
      default: null,
    },
    /** 自定义界面主色 */
    color: {
      type: String,
      default: null,
    },
    options: {
      type: Array as PropType<AuthMode[] | LoginMode[]>,
      default: () => {
        return [];
      },
    },
  },

  emits: ['update:modelValue'],

  computed: {
    tabOptions() {
      if (this.guardMode === GuardMode.signup) {
        return this.options.map((mode) => ({
          name: mode,
          label: `${AuthModeLabel[mode as AuthMode]}注册`,
        }));
      } else {
        return this.options.map((mode) => ({
          name: mode,
          label: `${LoginModeLabel[mode as LoginMode]}登录`,
        }));
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
