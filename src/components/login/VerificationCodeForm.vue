<template>
  <q-form class="q-gutter-md">
    <q-input
      v-model="codeForm.identity"
      dense
      filled
      :placeholder="placeholder"
      hide-bottom-space
      bg-color="grey-2"
      :disable="isPreview"
    >
      <template #prepend>
        <q-icon name="perm_identity" color="grey-7" />
      </template>
    </q-input>
    <q-input
      v-model="codeForm.code"
      dense
      filled
      placeholder="请输入 6 位验证码"
      hide-bottom-space
      minlength="6"
      bg-color="grey-2"
      :disable="isPreview"
    >
      <template #prepend>
        <q-icon name="lock_outline" color="grey-7" />
      </template>
      <template #append>
        <q-btn
          dense
          flat
          class="q-pa-sm text-weight-bold text-body2 text-grey-8"
        >
          获取验证码
        </q-btn>
      </template>
    </q-input>
    <div class="error-msg"></div>
    <div class="flex flex-center">
      <q-btn
        unelevated
        :label="submitBtn"
        class="q-my-sm full-width text-body1 primary-btn"
        :style="`background-color: ${color} !important`"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'VerificationCodeForm',

  props: {
    /** 是否为配置过程的预览状态 */
    isPreview: {
      type: Boolean,
      default: false,
    },
    /** 自定义界面主色 */
    color: {
      type: String,
      default: '#215ae5',
    },
    /** 验证码接收对象录入框提示文案 */
    placeholder: {
      type: String,
      default: '提交',
    },
    /** 表单提交按钮文案 */
    submitBtn: {
      type: String,
      default: '提交',
    },
  },

  setup() {
    return {
      codeForm: ref({
        identity: ref(''),
        code: ref(''),
      }),
    };
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
