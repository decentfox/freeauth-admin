<template>
  <q-form class="q-gutter-md">
    <q-input
      v-model="account"
      dense
      filled
      :placeholder="accountPlaceholder"
      hide-bottom-space
      bg-color="grey-2"
      :disable="isPreview"
      :error="!!formError.account || !!formError.code_type"
      :error-message="formError.account || formError.code_type"
    >
      <template #prepend>
        <q-icon name="perm_identity" color="grey-7" />
      </template>
    </q-input>
    <q-input
      v-model="code"
      dense
      filled
      placeholder="请输入 6 位验证码"
      hide-bottom-space
      minlength="6"
      bg-color="grey-2"
      :disable="isPreview"
      :error="!!formError.code"
      :error-message="formError.code"
    >
      <template #prepend>
        <q-icon name="lock_outline" color="grey-7" />
      </template>
      <template #append>
        <q-btn
          :disabled="!canSendCode"
          :loading="sendingCode"
          dense
          flat
          class="q-pa-sm text-weight-bold text-body2 text-grey-8"
          @click="sendAuthCode"
        >
          {{ codeSeconds ? '重新发送 (' + codeSeconds + ')' : '获取验证码' }}
        </q-btn>
      </template>
    </q-input>
    <div class="flex flex-center">
      <q-btn
        unelevated
        :disabled="!canSubmit"
        :loading="submitting"
        :label="GuardModeLabel[guardMode]"
        class="q-my-sm full-width text-body1 primary-btn"
        :style="{ backgroundColor: `${color} !important` }"
        @click="presubmit"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import ConfirmDialog from '../dialog/ConfirmDialog.vue';

import { AuthError, AuthMode, GuardMode, GuardModeLabel } from './type';

export default defineComponent({
  name: 'CodeAuthForm',

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
    /** 表单类型：注册或登录 */
    guardMode: {
      type: String as PropType<GuardMode>,
      default: null,
    },
    /** 支持的账号类型：手机号码或邮箱，可同时支持两种类型 */
    authModes: {
      type: Array as PropType<AuthMode[]>,
      default: () => [],
    },
    /** 是否勾选了隐私协议 */
    policyChecked: {
      type: Boolean,
      default: true,
    },
    agreementTitle: {
      type: String,
      default: '隐私协议与服务条款',
    },
    agreementLink: {
      type: String,
      default: '/',
    },
  },

  emits: ['agreePolicy'],

  setup() {
    return {
      account: ref<string | null>(null),
      code: ref<string | null>(null),
      formError: ref<AuthError>({}),

      timer: ref<ReturnType<typeof setTimeout> | null>(null),
      codeSeconds: ref(0),
      sendingCode: ref(false),
      submitting: ref(false),

      GuardModeLabel,
    };
  },

  computed: {
    accountPlaceholder(): string {
      const modes = [AuthMode.mobile, AuthMode.email]
        .filter((mode) => this.authModes.includes(mode))
        .map((mode) => (mode === AuthMode.mobile ? '手机号码' : '邮箱地址'));
      return `请输入${modes.join('或')}`;
    },

    canSendCode(): boolean {
      return !!this.account && this.codeSeconds === 0;
    },

    canSubmit(): boolean {
      return this.isPreview || (!!this.account && !!this.code);
    },

    codeType(): string | null {
      return this.guardMode === GuardMode.signup
        ? this.authModes.includes(AuthMode.mobile)
          ? 'SMS'
          : 'Email'
        : null;
    },
  },

  unmounted() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },

  methods: {
    async sendAuthCode() {
      this.sendingCode = true;
      try {
        await this.$api.post(
          `/${
            this.guardMode === GuardMode.signup ? 'sign_up' : 'sign_in'
          }/code`,
          { account: this.account, code_type: this.codeType },
          {
            successMsg: '验证码已发送',
          }
        );
        this.codeSeconds = 60;
        this.formError = {};
        this.coolDown();
      } catch (e) {
        this.formError = (e as Error).cause || {};
      } finally {
        this.sendingCode = false;
      }
    },

    coolDown() {
      this.timer = setTimeout(() => {
        if (this.codeSeconds > 0) {
          this.codeSeconds = this.codeSeconds - 1;
          this.coolDown();
        } else {
          this.timer = null;
        }
      }, 1000);
    },

    presubmit() {
      if (this.isPreview) {
        return;
      }
      if (!this.policyChecked) {
        this.$q
          .dialog({
            component: ConfirmDialog,
            componentProps: {
              title: '使用须知',
              content: `为保障您的权益，请先阅读《<a href='${this.agreementLink}' target='_blank' rel='noopener noreferrer' class='text-grey-10'>${this.agreementTitle}</a>》。`,
              buttons: [
                { label: '取消', class: 'secondary-btn' },
                {
                  label: '已阅读并同意',
                  actionType: 'agree',
                  class: 'accent-btn',
                },
              ],
            },
          })
          .onOk(async ({ type }) => {
            if (type === 'agree') {
              this.$emit('agreePolicy');
              this.submit();
            }
          });
      } else {
        this.submit();
      }
    },

    async submit() {
      this.submitting = true;
      try {
        await this.$api.post(
          `/${
            this.guardMode === GuardMode.signup ? 'sign_up' : 'sign_in'
          }/verify`,
          { account: this.account, code_type: this.codeType, code: this.code }
        );
        this.formError = {};
        this.$router.replace('/');
      } catch (e) {
        this.formError = (e as Error).cause || {};
      } finally {
        this.submitting = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
