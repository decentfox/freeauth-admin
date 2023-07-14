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
      :error="!!formError.account"
      :error-message="formError.account"
    >
      <template #prepend>
        <q-icon name="perm_identity" color="grey-7" />
      </template>
    </q-input>
    <pwd-field
      v-model="password"
      :disable="isPreview"
      :error="formError.password"
    />
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

import {
  AuthError,
  AuthMode,
  AuthModeLabel,
  GuardMode,
  GuardModeLabel,
} from './type';

export default defineComponent({
  name: 'PwdAuthForm',

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
    /** 支持的账号类型：手机号、邮箱或用户名，可同时支持多种类型 */
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
      password: ref<string>(''),
      formError: ref<AuthError>({}),

      showPwd: ref(false),
      submitting: ref(false),

      GuardModeLabel,
    };
  },

  computed: {
    accountPlaceholder(): string {
      const modes = [AuthMode.mobile, AuthMode.email, AuthMode.username]
        .filter((mode) => this.authModes.includes(mode))
        .map((mode) => AuthModeLabel[mode]);
      return `请输入${modes.join('或')}`;
    },

    canSubmit(): boolean {
      return this.isPreview || (!!this.account && !!this.password);
    },
  },

  methods: {
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
            } else if (type == 'read') {
              window.open(this.agreementLink);
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
          `/${this.guardMode === GuardMode.signup ? 'sign_up' : 'sign_in'}`,
          { account: this.account, password: this.password }
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
