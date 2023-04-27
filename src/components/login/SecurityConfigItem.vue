<template>
  <q-toggle
    v-model="limit.status"
    left-label
    :label="toggleLabel"
    class="text-weight-bold"
    icon="verified_user"
  />
  <q-item-label class="text-caption hint-label">
    {{ description }}
  </q-item-label>
  <div
    v-if="limit.status && (limit.duration || limit.times)"
    class="row q-gutter-sm q-pt-xs"
  >
    <q-input
      v-if="limit.duration"
      v-model.number="limit.duration"
      type="number"
      dense
      filled
      suffix="分钟"
      style="max-width: 120px"
      hint="限定周期时间"
    />
    <q-input
      v-if="limit.times"
      v-model.number="limit.times"
      type="number"
      dense
      filled
      suffix="次"
      style="max-width: 120px"
      :hint="actionHint"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { SecurityConfig } from './type';

export default defineComponent({
  name: 'SecurityConfigItem',

  props: {
    /** 安全设置项的数值 */
    value: {
      type: Object as PropType<SecurityConfig>,
      default: () => {
        return {};
      },
    },
    /** 安全设置项的名称 */
    toggleLabel: {
      type: String,
      default: '',
    },
    /** 安全设置项的描述 */
    description: {
      type: String,
      default: '',
    },
    /** 可操作次数的说明 */
    actionHint: {
      type: String,
      default: '',
    },
  },

  emits: ['input'],

  setup() {
    return {};
  },

  computed: {
    limit: {
      get() {
        return this.value;
      },
      set(val: number) {
        this.$emit('input', val);
      },
    },
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
