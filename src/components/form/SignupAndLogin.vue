<template>
  <q-card bordered class="q-pa-md preview">
    <q-tab-panels
      ref="innerPanel"
      v-model="previewPanel"
      animated
      class="bg-white preview-panel"
    >
      <q-tab-panel name="signup">
        <div class="row items-center q-pt-sm">
          <q-img
            :src="imageUrl"
            spinner-color="white"
            class="q-mx-md img-wrapper"
            :class="{ 'bg-grey-2': !imageUrl }"
          />
          <div class="text-weight-bold text-h6 text-grey-10">
            {{ title || `自定义标题` }}
          </div>
        </div>
        <q-tabs
          v-model="signupTab"
          dense
          class="text-grey q-mt-lg"
          align="left"
          narrow-indicator
          style="width: 200px"
          :style="`color: ${color} !important`"
        >
          <q-tab v-if="signupOptions.mobile" name="mobile" label="手机号注册" />
          <q-tab v-if="signupOptions.email" name="email" label="邮箱注册" />
        </q-tabs>
        <q-separator color="grey-4" />
        <q-tab-panels
          v-if="signupOptions.email || signupOptions.mobile"
          ref="signup"
          v-model="signupTab"
          animated
          class="bg-white"
        >
          <!-- 注册框：手机号注册 -->
          <q-tab-panel name="mobile" class="q-pt-lg bg-white">
            <verification-code-form
              :is-preview="isPreview"
              :color="color"
              placeholder="请输入手机号码"
              submit-btn="注册"
            />
            <div class="flex flex-center">
              <q-btn
                flat
                unelevated
                color="primary"
                label="已有账号，点击前往登录"
                :style="`color: ${color} !important`"
                @click="switchTo('login')"
              />
            </div>
          </q-tab-panel>
          <!-- 注册框：邮箱注册 -->
          <q-tab-panel name="email" class="q-pt-lg bg-white">
            <verification-code-form
              :is-preview="isPreview"
              :color="color"
              placeholder="请输入邮箱地址"
              submit-btn="注册"
            />
            <div class="flex flex-center">
              <q-btn
                flat
                unelevated
                color="primary"
                label="已有账号，点击前往登录"
                :style="`color: ${color} !important`"
                @click="switchTo('login')"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>

      <q-tab-panel name="login">
        <div class="row items-center q-pt-sm">
          <q-img
            :src="imageUrl"
            spinner-color="white"
            class="q-mx-md img-wrapper"
            :class="{ 'bg-grey-2': !imageUrl }"
          />
          <div class="text-weight-bold text-h6 text-grey-10">
            {{ title || `自定义标题` }}
          </div>
        </div>
        <q-tabs
          v-model="loginTab"
          dense
          class="text-grey q-mt-lg"
          align="left"
          narrow-indicator
          style="width: 200px"
          :style="`color: ${color} !important`"
        >
          <q-tab v-if="codeLogin" name="code" label="验证码登录" />
          <q-tab v-if="pwdLogin" name="password" label="密码登录" />
        </q-tabs>
        <q-separator color="grey-4" />
        <q-tab-panels
          v-if="codeLogin || pwdLogin"
          ref="login"
          v-model="loginTab"
          animated
          class="bg-white"
        >
          <!-- 登录框：验证码登录 -->
          <q-tab-panel name="code" class="q-pt-lg bg-white">
            <verification-code-form
              :is-preview="isPreview"
              :color="color"
              :placeholder="codeLoginPlaceholder"
              submit-btn="登录"
            />
            <div class="flex flex-center">
              <q-btn
                flat
                unelevated
                color="primary"
                label="没有账号，点击前往注册"
                :style="`color: ${color} !important`"
                @click="switchTo('signup')"
              />
            </div>
          </q-tab-panel>
          <!-- 登录框：密码登录 -->
          <q-tab-panel name="password" class="q-pt-lg bg-white">
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
                  :style="`background-color: ${color} !important`"
                />
              </div>
            </q-form>
            <div class="flex flex-center">
              <q-btn
                flat
                unelevated
                color="primary"
                label="没有账号，点击前往注册"
                :style="`color: ${color} !important`"
                @click="switchTo('signup')"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>
    </q-tab-panels>
    <div v-if="withPolicy" class="absolute-bottom q-pa-lg q-mx-md">
      <div v-if="policy.link" class="row items-center">
        <q-checkbox v-model="policyChecked" size="32px" />
        <q-item-label class="ellipsis">
          <a
            :href="policy.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-grey-10"
          >
            {{ policy.text || `我已阅读并同意隐私协议与服务条款` }}
          </a>
        </q-item-label>
      </div>
      <div v-else class="ellipsis">
        <q-checkbox
          v-model="policyChecked"
          size="32px"
          class="text-grey-10"
          :label="policy.text || `我已阅读并同意隐私协议与服务条款`"
        />
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { QTabPanels } from 'quasar';

import VerificationCodeForm from 'components/form/VerificationCodeForm.vue';

import {
  CodeLoginOptions,
  PwdLoginOptions,
  SignupAndLoginPolicy,
  SignupOptions,
} from './type';

export default defineComponent({
  name: 'SignupAndLogin',

  components: {
    VerificationCodeForm,
  },

  props: {
    /** 是否为配置过程的预览状态 */
    isPreview: {
      type: Boolean,
      default: false,
    },
    /** 自定义图标（logo) */
    imageUrl: {
      type: String,
      default: '#215ae5',
    },
    /** 自定义标题 */
    title: {
      type: String,
      default: '#215ae5',
    },
    /** 自定义界面主色 */
    color: {
      type: String,
      default: '#215ae5',
    },
    /** 是否开启登录注册协议 */
    withPolicy: {
      type: Boolean,
      default: false,
    },
    /** 协议勾选框文字及跳转链接 */
    policy: {
      type: Object as PropType<SignupAndLoginPolicy>,
      default: () => {
        return {};
      },
    },
    /** 支持注册的方式 */
    signupOptions: {
      type: Object as PropType<SignupOptions>,
      default: () => {
        return {};
      },
    },
    /** 注册后是否强制修改用户名及密码 */
    /** TODO */
    initialization: {
      type: Boolean,
      default: false,
    },
    /** 支持验证码登录的方式 */
    codeLoginOptions: {
      type: Object as PropType<CodeLoginOptions>,
      default: () => {
        return {};
      },
    },
    /** 支持密码登录的方式 */
    pwdLoginOptions: {
      type: Object as PropType<PwdLoginOptions>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['panelChanged'],

  setup() {
    return {
      // Preview
      previewPanel: ref('signup'),
      signupTab: ref('mobile'),
      loginTab: ref('code'),

      // Password Login
      passwordForm: ref({
        identity: ref(''),
        password: ref(''),
      }),
      showPwd: ref(false),
      policyChecked: ref(false),
    };
  },

  computed: {
    codeLoginPlaceholder() {
      let hint = [];
      if (this.codeLoginOptions.mobile) {
        hint.push('手机号');
      }
      if (this.codeLoginOptions.email) {
        hint.push('邮箱');
      }
      return '请输入' + hint.join('或');
    },

    pwdLoginPlaceholder() {
      let hint = [];
      if (this.pwdLoginOptions.mobile) {
        hint.push('手机号');
      }
      if (this.pwdLoginOptions.email) {
        hint.push('邮箱');
      }
      if (this.pwdLoginOptions.username) {
        hint.push('用户名');
      }
      return '请输入' + hint.join('或');
    },

    codeLogin() {
      return this.codeLoginOptions.email || this.codeLoginOptions.mobile;
    },

    pwdLogin() {
      return (
        this.pwdLoginOptions.email ||
        this.pwdLoginOptions.mobile ||
        this.pwdLoginOptions.username
      );
    },
  },

  methods: {
    switchTo(panelName: string, emit = true) {
      (this.$refs.innerPanel as QTabPanels).goTo(panelName);
      if (this.isPreview && emit) {
        this.$emit('panelChanged', panelName);
      }
    },

    switchSignupMethodTo(methodName: string) {
      (this.$refs.signup as QTabPanels).goTo(methodName);
    },

    switchLoginMethodTo(methodName: string) {
      (this.$refs.login as QTabPanels).goTo(methodName);
    },
  },
});
</script>

<style lang="scss">
.preview {
  width: 380px;
  background-color: white;

  .img-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 3px;
  }

  .preview-panel {
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
