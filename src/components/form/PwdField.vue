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
  <q-input
    :model-value="modelValue"
    dense
    filled
    :placeholder="placeholder"
    :type="!showPwd ? 'password' : 'text'"
    hide-bottom-space
    bg-color="grey-2"
    :rules="rules"
    :error="!!error"
    :error-message="error"
    @update:model-value="
      (value: string  | number | null) => {
        $emit('update:modelValue', value);
      }
    "
  >
    <template #prepend>
      <q-icon name="lock_outline" color="grey-7" />
    </template>
    <template #append>
      <q-icon
        :name="showPwd ? 'visibility' : 'visibility_off'"
        size="20px"
        color="grey-7"
        class="cursor-pointer"
        @click="showPwd = !showPwd"
      />
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ValidationRule } from 'quasar';

export default defineComponent({
  name: 'ResetPwdForm',

  props: {
    modelValue: {
      type: String,
      default: null,
    },
    /** 默认提示文字 */
    placeholder: {
      type: String,
      default: '请输入密码',
    },
    /** 密码错误信息 */
    error: {
      type: String,
      default: null,
    },
    /** 验证规则 */
    rules: {
      type: Array as PropType<ValidationRule[]>,
      default: () => [],
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      showPwd: ref(false),
    };
  },
});
</script>

<style lang="scss" scoped></style>
