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
        @click="submit"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

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
  },

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
      return (
        this.isPreview ||
        (!!this.account && !!this.password && this.policyChecked)
      );
    },
  },

  methods: {
    async submit() {
      if (this.isPreview) {
        return;
      }
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
