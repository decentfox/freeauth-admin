<template>
  <q-toggle
    :model-value="modelValue"
    left-label
    :label="toggleLabel"
    class="text-weight-bold"
    icon="verified_user"
    @update:model-value="
      (value: boolean) => {
        $emit('update:modelValue', value);
      }
    "
  />
  <q-item-label class="text-caption hint-label">
    {{ description }}
  </q-item-label>
  <div
    v-if="modelValue && (interval !== null || maxAttempts !== null)"
    class="row q-gutter-sm q-pt-xs"
  >
    <q-input
      v-if="interval !== null"
      :model-value="interval"
      type="number"
      dense
      filled
      suffix="分钟"
      style="max-width: 120px"
      hint="限定周期时间"
      @update:model-value="
        (value: string  | number | null) => {
          $emit('update:interval', parseInt(value as string) || 0);
        }
      "
    />
    <q-input
      v-if="maxAttempts != null"
      :model-value="maxAttempts"
      type="number"
      dense
      filled
      suffix="次"
      style="max-width: 120px"
      :hint="actionHint"
      @update:model-value="
        (value: string  | number | null) => {
          $emit('update:maxAttempts', parseInt(value as string) || 0);
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SecurityConfigItem',

  props: {
    /** 是否启用该安全项 */
    modelValue: {
      type: Boolean,
      default: false,
    },
    /** 安全项作用的周期 */
    interval: {
      type: Number,
      default: null,
    },
    /** 安全项作用周期内允许的操作次数 */
    maxAttempts: {
      type: Number,
      default: null,
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

  emits: ['update:modelValue', 'update:interval', 'update:maxAttempts'],

  setup() {
    return {};
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
