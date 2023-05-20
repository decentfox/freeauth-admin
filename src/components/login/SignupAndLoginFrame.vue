<template>
  <q-card bordered class="q-pa-md guard-frame">
    <guard-skeleton v-if="!ready" />
    <q-tab-panels
      v-else
      ref="panel"
      :model-value="modelValue"
      animated
      class="bg-white frame-panel"
    >
      <q-tab-panel :name="GuardMode.signup">
        <guard-header />
        <template v-if="signupEnabled">
          <guard-tabs
            :model-value="signupMode"
            :guard-mode="GuardMode.signup"
            :color="loginSettings.guardPrimaryColor"
            :options="loginSettings.signupModes"
            @update:model-value="(val) => $emit('update:signupMode', val)"
          />
          <q-tab-panels :model-value="signupMode" animated class="bg-white">
            <!-- 注册框：手机号或邮箱注册 -->
            <q-tab-panel
              v-for="(mode, idx) in [AuthMode.mobile, AuthMode.email]"
              :key="idx"
              :name="mode"
              class="q-pt-lg bg-white"
            >
              <code-auth-form
                :is-preview="isPreview"
                :color="loginSettings.guardPrimaryColor"
                :auth-modes="[mode]"
                :guard-mode="GuardMode.signup"
                :policy-checked="
                  loginSettings.agreementEnabled ? policyChecked : true
                "
              />
              <div v-if="signinEnabled" class="flex flex-center">
                <q-btn
                  flat
                  unelevated
                  color="primary"
                  label="已有账号，点击前往登录"
                  :style="{
                    color: `${loginSettings.guardPrimaryColor} !important`,
                  }"
                  @click="$emit('update:modelValue', GuardMode.signin)"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </template>
        <q-item-label v-else class="flex flex-center q-mt-xl text-grey-6">
          系统尚未启用任何注册方式
        </q-item-label>
      </q-tab-panel>

      <q-tab-panel :name="GuardMode.signin">
        <guard-header />
        <template v-if="signinEnabled">
          <guard-tabs
            :model-value="loginMode"
            :guard-mode="GuardMode.signin"
            :color="loginSettings.guardPrimaryColor"
            :options="loginModeOptions"
            @update:model-value="(val) => $emit('update:loginMode', val)"
          />
          <q-tab-panels :model-value="loginMode" animated class="bg-white">
            <!-- 登录框：验证码或密码登录 -->
            <q-tab-panel
              v-for="(mode, idx) in [LoginMode.code, LoginMode.password]"
              :key="idx"
              :name="mode"
              class="q-pt-lg bg-white"
            >
              <code-auth-form
                v-if="mode === LoginMode.code"
                :is-preview="isPreview"
                :color="loginSettings.guardPrimaryColor"
                :auth-modes="loginSettings.codeSigninModes"
                :guard-mode="GuardMode.signin"
                :policy-checked="
                  loginSettings.agreementEnabled ? policyChecked : true
                "
              />
              <pwd-auth-form
                v-else
                :is-preview="isPreview"
                :color="loginSettings.guardPrimaryColor"
                :auth-modes="loginSettings.pwdSigninModes"
                :guard-mode="GuardMode.signin"
                :policy-checked="
                  loginSettings.agreementEnabled ? policyChecked : true
                "
              />
              <div v-if="signinEnabled" class="flex flex-center">
                <q-btn
                  flat
                  unelevated
                  color="primary"
                  label="没有账号，点击前往注册"
                  :style="{
                    color: `${loginSettings.guardPrimaryColor} !important`,
                  }"
                  @click="$emit('update:modelValue', GuardMode.signup)"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </template>
        <q-item-label v-else class="flex flex-center q-mt-xl text-grey-6">
          系统尚未启用任何登录方式
        </q-item-label>
      </q-tab-panel>
    </q-tab-panels>

    <div
      v-if="loginSettings.agreementEnabled"
      class="absolute-bottom flex flex-center q-pa-lg q-mx-md text-grey-10"
    >
      <q-checkbox v-model="policyChecked" size="32px">
        <q-item-label class="ellipsis">
          <a
            v-if="loginSettings.agreementLink"
            :href="loginSettings.agreementLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-grey-10"
          >
            {{ agreementTitle }}
          </a>
          <template v-else>{{ agreementTitle }}</template>
        </q-item-label>
      </q-checkbox>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { mapState } from 'pinia';

import { loginSettingsStore } from 'stores/login-settings-store';

import {
  AuthMode,
  AuthModeLabel,
  GuardMode,
  LoginMode,
  LoginModeLabel,
} from './type';

export default defineComponent({
  name: 'SignupAndLoginFrame',

  props: {
    /** 是否为配置过程的预览状态 */
    isPreview: {
      type: Boolean,
      default: false,
    },
    /** 当前选中的表单类型：注册或登录 */
    modelValue: {
      type: String as PropType<GuardMode>,
      default: GuardMode.signin,
    },
    /** 当前选中的注册方式：手机号或邮箱 */
    signupMode: {
      type: String as PropType<AuthMode>,
      default: AuthMode.mobile,
    },
    /** 当前选中的登录方式：验证码或密码 */
    loginMode: {
      type: String as PropType<LoginMode>,
      default: LoginMode.code,
    },
  },

  emits: ['update:modelValue', 'update:signupMode', 'update:loginMode'],

  setup() {
    return {
      policyChecked: ref(false),

      AuthMode,
      AuthModeLabel,
      GuardMode,
      LoginMode,
      LoginModeLabel,
    };
  },

  computed: {
    ...mapState(loginSettingsStore, [
      'loginSettings',
      'ready',
      'signupEnabled',
      'signinEnabled',
      'codeLoginEnabled',
      'pwdLoginEnabled',
    ]),

    agreementTitle() {
      return (
        this.loginSettings.agreementTitle || '我已阅读并同意隐私协议与服务条款'
      );
    },

    loginModeOptions() {
      let options = [];
      if (this.codeLoginEnabled) {
        options.push(LoginMode.code);
      }
      if (this.pwdLoginEnabled) {
        options.push(LoginMode.password);
      }
      return options;
    },
  },
});
</script>

<style lang="scss">
.guard-frame {
  width: 380px;
  background-color: white;

  .img-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 3px;
  }

  .frame-panel {
    min-height: 500px;
  }

  .q-tab--inactive {
    color: $grey-6;
  }

  .q-field__native {
    color: $grey-10 !important;
  }
}
</style>
