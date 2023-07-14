<template>
  <q-form ref="form" class="q-px-md q-gutter-md">
    <pwd-field
      v-model="password"
      placeholder="请输入新密码"
      :rules="[(val: string) => val.length >= 6 || '请使用至少 6 位字符作为密码']"
      :error="formError.password"
    />
    <pwd-field
      v-model="repeatPassword"
      placeholder="请再次确认密码"
      :rules="[(val: string) => (!!val && val === password) || '两次输入密码不一致']"
    />
    <div class="flex flex-center">
      <q-btn
        unelevated
        :disabled="!canSubmit"
        :loading="submitting"
        label="确认"
        class="q-my-md full-width text-body1 primary-btn"
        :style="{ backgroundColor: `${color} !important` }"
        @click="submit"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapWritableState } from 'pinia';
import { QForm } from 'quasar';

import { authStore } from 'stores/auth-store';

import { AuthError } from './type';

export default defineComponent({
  name: 'ResetPwdForm',

  props: {
    /** 自定义界面主色 */
    color: {
      type: String,
      default: '#215ae5',
    },
  },

  setup() {
    return {
      password: ref<string>(''),
      repeatPassword: ref<string>(''),
      formError: ref<AuthError>({}),
      submitting: ref(false),
    };
  },

  computed: {
    ...mapWritableState(authStore, ['resetPwdRequired']),

    canSubmit(): boolean {
      return !!this.password && !!this.repeatPassword;
    },
  },

  methods: {
    async submit() {
      if (!(await (this.$refs.form as QForm).validate(true))) {
        return;
      }
      this.submitting = true;
      try {
        await this.$api.post('/change_pwd', { password: this.password });
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
