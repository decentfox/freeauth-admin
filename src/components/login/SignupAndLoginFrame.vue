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
            v-if="(loginSettings.signupModes?.length || 0) > 1"
            :model-value="signupMode"
            :guard-mode="GuardMode.signup"
            :color="loginSettings.guardPrimaryColor"
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
              <verification-code-form
                :is-preview="isPreview"
                :color="loginSettings.guardPrimaryColor"
                :placeholder="`请输入${
                  mode === AuthMode.mobile ? '手机号码' : '邮箱地址'
                }`"
                submit-btn="注册"
              />
              <div v-if="signinEnabled" class="flex flex-center">
                <q-btn
                  flat
                  unelevated
                  color="primary"
                  label="已有账号，点击前往登录"
                  :style="`color: ${loginSettings.guardPrimaryColor} !important`"
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
            v-if="codeLoginEnabled && pwdLoginEnabled"
            :model-value="loginMode"
            :guard-mode="GuardMode.signin"
            :color="loginSettings.guardPrimaryColor"
            @update:model-value="(val) => $emit('update:loginMode', val)"
          />
          <q-tab-panels :model-value="loginMode" animated class="bg-white">
            <!-- 登录框：验证码登录 -->
            <q-tab-panel :name="LoginMode.code" class="q-pt-lg bg-white">
              <verification-code-form
                :is-preview="isPreview"
                :color="loginSettings.guardPrimaryColor"
                :placeholder="codeLoginPlaceholder"
                submit-btn="登录"
              />
              <div v-if="signupEnabled" class="flex flex-center">
                <q-btn
                  flat
                  unelevated
                  color="primary"
                  label="没有账号，点击前往注册"
                  :style="`color: ${loginSettings.guardPrimaryColor} !important`"
                  @click="$emit('update:modelValue', GuardMode.signup)"
                />
              </div>
            </q-tab-panel>
            <!-- 登录框：密码登录 -->
            <q-tab-panel :name="LoginMode.password" class="q-pt-lg bg-white">
              <q-form class="q-gutter-md">
                <q-input
                  v-model="passwordForm.identity"
                  dense
                  filled
                  :placeholder="pwdLoginPlaceholder"
                  hide-bottom-space
                  bg-color="grey-2"
                  :disable="isPreview"
                >
                  <template #prepend>
                    <q-icon name="perm_identity" color="grey-7" />
                  </template>
                </q-input>
                <q-input
                  v-model="passwordForm.password"
                  dense
                  filled
                  placeholder="请输入密码"
                  :type="!showPwd ? 'password' : 'text'"
                  hide-bottom-space
                  minlength="6"
                  bg-color="grey-2"
                  :disable="isPreview"
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
                <div class="error-msg"></div>
                <div class="flex flex-center">
                  <q-btn
                    unelevated
                    label="登录"
                    class="q-my-sm full-width text-body1 primary-btn"
                    :style="`background-color: ${loginSettings.guardPrimaryColor} !important`"
                  />
                </div>
              </q-form>
              <div v-if="signupEnabled" class="flex flex-center">
                <q-btn
                  flat
                  unelevated
                  color="primary"
                  label="没有账号，点击前往注册"
                  :style="`color: ${loginSettings.guardPrimaryColor} !important`"
                  @click="$emit('update:modelValue', GuardMode.signup)"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </template>
        <q-item-label
          v-else-if="ready"
          class="flex flex-center q-mt-xl text-grey-6"
        >
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
      // Password Login
      passwordForm: ref({
        identity: ref(''),
        password: ref(''),
      }),
      showPwd: ref(false),
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

    codeLoginPlaceholder() {
      return `请输入${this.loginSettings.codeSigninModes
        ?.map((mode) => AuthModeLabel[mode])
        .join('或')}`;
    },

    pwdLoginPlaceholder() {
      return `请输入${this.loginSettings.pwdSigninModes
        ?.map((mode) => AuthModeLabel[mode])
        .join('或')}`;
    },

    agreementTitle() {
      return (
        this.loginSettings.agreementTitle || '我已阅读并同意隐私协议与服务条款'
      );
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
