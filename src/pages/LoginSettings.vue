<template>
  <q-page class="full-width q-pa-md">
    <q-splitter
      v-model="splitterModel"
      class="q-py-sm"
      disable
      style="height: calc(100vh - 82px)"
    >
      <template #before>
        <div class="q-pa-md">
          <q-list>
            <q-expansion-item
              group="somegroup"
              icon="display_settings"
              label="基础配置"
              default-opened
              hide-expand-icon
              header-class="text-black-white text-weight-bold text-body1"
            >
              <q-separator />
              <q-card class="q-pa-md">
                <q-card-section class="q-gutter-sm">
                  <q-item-label class="q-pb-sm text-weight-bold">
                    登录注册框样式
                  </q-item-label>
                  <div>
                    <q-item-label class="text-caption hint-label">
                      自定义图标（logo）
                    </q-item-label>
                    <div class="row items-center">
                      <q-img
                        :src="imageUrl"
                        spinner-color="white"
                        class="img-wrapper bg-secondary"
                      />
                      <q-btn
                        unelevated
                        class="secondary-btn q-ml-md"
                        @click="uploadImage"
                      >
                        <q-icon size="18px" name="upload_file" />上传图标
                      </q-btn>
                      <q-file
                        ref="file"
                        v-model="logo"
                        style="display: none"
                        @update:model-value="handleUpload"
                      />
                    </div>
                  </div>
                  <div>
                    <q-item-label class="text-caption hint-label">
                      自定义标题
                    </q-item-label>
                    <q-input
                      v-model="title"
                      filled
                      dense
                      placeholder="请填写登录注册框标题"
                      hide-bottom-space
                    />
                  </div>
                  <div>
                    <q-item-label class="text-caption hint-label">
                      自定义界面主色
                    </q-item-label>
                    <q-input v-model="color" filled dense>
                      <template #append>
                        <q-icon
                          name="colorize"
                          size="20px"
                          class="cursor-pointer"
                        >
                          <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-color v-model="color" default-value="#215ae5" />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </q-card-section>
                <q-card-section class="q-gutter-sm">
                  <q-toggle
                    v-model="withPolicy"
                    left-label
                    label="开启登录注册协议"
                    class="text-weight-bold"
                  />
                  <div v-if="withPolicy">
                    <q-item-label class="text-caption hint-label">
                      协议勾选框文字
                    </q-item-label>
                    <q-input
                      v-model="policy.text"
                      filled
                      dense
                      placeholder="例如：我已阅读并同意隐私协议与服务条款"
                      hide-bottom-space
                    />
                  </div>
                  <div v-if="withPolicy">
                    <q-item-label class="text-caption hint-label">
                      协议跳转链接
                    </q-item-label>
                    <q-input
                      v-model="policy.link"
                      filled
                      dense
                      placeholder="https://"
                      hide-bottom-space
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-separator />

            <q-expansion-item
              v-model="signupExpanded"
              group="somegroup"
              icon="settings_accessibility"
              label="注册配置"
              hide-expand-icon
              header-class="text-black-white text-weight-bold text-body1"
              @update:model-value="switchPreviewPanel"
            >
              <q-separator />
              <q-card class="q-pa-md">
                <q-card-section>
                  <q-item-label class="q-pb-sm text-weight-bold">
                    选择注册方式
                  </q-item-label>
                  <q-checkbox
                    v-model="signupOptions.mobile"
                    dense
                    size="32px"
                    label="支持手机号和验证码注册"
                    class="full-width q-mt-sm"
                    @update:model-value="switchSignupMethod('mobile')"
                  />
                  <q-checkbox
                    v-model="signupOptions.email"
                    dense
                    size="32px"
                    label="支持邮箱和验证码注册"
                    class="full-width q-mt-sm"
                    @update:model-value="switchSignupMethod('email')"
                  />
                </q-card-section>
                <q-card-section
                  v-if="signupOptions.mobile || signupOptions.email"
                >
                  <security-config-item
                    :value="codeSignupFailureLimit"
                    toggle-label="注册验证码尝试次数"
                    description="验证码有效限定周期内，允许用户试错次数，超出则需重新获取"
                    action-hint="允许试错次数"
                  />
                </q-card-section>
                <q-card-section
                  v-if="signupOptions.mobile || signupOptions.email"
                >
                  <security-config-item
                    :value="signupCodeLimit"
                    toggle-label="注册验证码发送限制"
                    description="同一个手机或邮箱，在限定周期内可获取的注册验证码次数"
                    action-hint="可获取验证码次数"
                  />
                </q-card-section>

                <q-separator inset spaced="md" />

                <q-card-section>
                  <security-config-item
                    :value="signupResetPassword"
                    toggle-label="注册后设置用户名密码"
                    description="开启后，用户注册后会被要求修改默认分配的用户名及密码"
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-separator />

            <q-expansion-item
              v-model="loginExpanded"
              group="somegroup"
              icon="password"
              label="登录配置"
              hide-expand-icon
              header-class="text-black-white text-weight-bold text-body1"
              @update:model-value="switchPreviewPanel"
            >
              <q-separator />
              <q-card class="q-pa-md">
                <q-card-section>
                  <q-item-label class="q-pb-sm text-weight-bold">
                    选择验证码登录方式
                  </q-item-label>
                  <q-checkbox
                    v-model="codeLoginOptions.mobile"
                    dense
                    size="32px"
                    label="支持手机号和验证码登录"
                    class="full-width q-mt-sm"
                    @update:model-value="switchLoginMethod('code')"
                  />
                  <q-checkbox
                    v-model="codeLoginOptions.email"
                    dense
                    size="32px"
                    label="支持邮箱和验证码登录"
                    class="full-width q-mt-sm"
                    @update:model-value="switchLoginMethod('code')"
                  />
                </q-card-section>
                <q-card-section v-if="codeLogin">
                  <security-config-item
                    :value="codeLoginFailureLimit"
                    toggle-label="登录验证码尝试次数"
                    description="验证码有效限定周期内，允许用户试错次数，超出则需重新获取"
                    action-hint="允许试错次数"
                  />
                </q-card-section>
                <q-card-section v-if="codeLogin">
                  <security-config-item
                    :value="loginCodeLimit"
                    toggle-label="登录验证码发送限制"
                    description="同一个手机或邮箱，在限定周期内可获取的登录验证码次数"
                    action-hint="可获取验证码次数"
                  />
                </q-card-section>

                <q-separator inset spaced="md" />

                <q-card-section>
                  <q-item-label class="q-pb-sm text-weight-bold">
                    选择密码登录方式
                  </q-item-label>
                  <q-checkbox
                    v-model="pwdLoginOptions.mobile"
                    dense
                    size="32px"
                    label="支持手机号和密码登录"
                    class="full-width q-mt-sm"
                    @update:model-value="switchLoginMethod('password')"
                  />
                  <q-checkbox
                    v-model="pwdLoginOptions.email"
                    dense
                    size="32px"
                    label="支持邮箱和密码登录"
                    class="full-width q-mt-sm"
                    @update:model-value="switchLoginMethod('password')"
                  />
                  <q-checkbox
                    v-model="pwdLoginOptions.username"
                    dense
                    size="32px"
                    label="支持用户名和密码登录"
                    class="full-width q-mt-sm"
                    @update:model-value="switchLoginMethod('password')"
                  />
                </q-card-section>
                <q-card-section v-if="pwdLogin">
                  <security-config-item
                    :value="pwdLoginFailureLimit"
                    toggle-label="登录密码尝试次数"
                    description="限定周期内允许用户试错次数，超出后当日不再允许登录"
                    action-hint="允许试错次数"
                  />
                </q-card-section>

                <q-separator inset spaced="md" />

                <q-card-section>
                  <security-config-item
                    :value="autoLogout"
                    toggle-label="cookie 过期时间"
                    description="用户登录状态的有效时间，过期后用户需要重新登录"
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-separator />
          </q-list>
        </div>
      </template>
      <template #after>
        <div class="q-mx-xl q-my-md">
          <signup-and-login-frame
            ref="preview"
            is-preview
            :image-url="imageUrl"
            :title="title"
            :color="color"
            :with-policy="withPolicy"
            :policy="policy"
            :signup-options="signupOptions"
            :code-login-options="codeLoginOptions"
            :pwd-login-options="pwdLoginOptions"
            @panel-changed="expandSettings"
          />
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QFile } from 'quasar';
import SecurityConfigItem from 'src/components/login/SecurityConfigItem.vue';
import SignupAndLoginFrame from 'src/components/login/SignupAndLoginFrame.vue';

import {
  CodeLoginOptions,
  PwdLoginOptions,
  SecurityConfig,
  SignupAndLoginComponent,
  SignupAndLoginPolicy,
  SignupOptions,
} from 'components/login/type';

export default defineComponent({
  name: 'IndexPage',

  components: {
    SecurityConfigItem,
    SignupAndLoginFrame,
  },

  setup() {
    return {
      splitterModel: 40,

      // Basic Settings
      logo: ref(null),
      imageUrl: ref(''),
      title: ref(''),
      color: ref('#215ae5'),
      withPolicy: ref(false),
      policy: ref<SignupAndLoginPolicy>({
        text: '',
        link: '',
      }),

      // Signup Settings
      signupOptions: ref<SignupOptions>({
        mobile: true,
        email: false,
      }),
      signupExpanded: ref(false),

      // Login Settings
      codeLoginOptions: ref<CodeLoginOptions>({
        mobile: true,
        email: false,
      }),
      pwdLoginOptions: ref<PwdLoginOptions>({
        email: false,
        mobile: false,
        username: false,
      }),
      loginExpanded: ref(false),

      // Security Settings
      signupCodeLimit: ref(<SecurityConfig>{
        status: false,
        duration: 60,
        times: 5,
      }),
      codeSignupFailureLimit: ref(<SecurityConfig>{
        status: false,
        duration: 10,
        times: 3,
      }),
      signupResetPassword: ref(<SecurityConfig>{
        status: false,
      }),
      loginCodeLimit: ref(<SecurityConfig>{
        status: false,
        duration: 60,
        times: 5,
      }),
      codeLoginFailureLimit: ref(<SecurityConfig>{
        status: false,
        duration: 10,
        times: 3,
      }),
      pwdLoginFailureLimit: ref(<SecurityConfig>{
        status: false,
        duration: 1440,
        times: 5,
      }),
      autoLogout: ref(<SecurityConfig>{
        status: false,
        duration: 1440,
      }),
    };
  },

  computed: {
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
    handleUpload() {
      if (this.logo) {
        this.imageUrl = URL.createObjectURL(this.logo);
      }
    },

    uploadImage() {
      (this.$refs.file as QFile).pickFiles();
    },

    switchPreviewPanel() {
      if (this.loginExpanded) {
        (this.$refs.preview as SignupAndLoginComponent).switchTo(
          'login',
          false
        );
      }
      if (this.signupExpanded) {
        (this.$refs.preview as SignupAndLoginComponent).switchTo(
          'signup',
          false
        );
      }
    },

    expandSettings(panelName: string) {
      this.signupExpanded = panelName === 'signup';
      this.loginExpanded = panelName === 'login';
    },

    switchSignupMethod(target: string) {
      const theOtherOne = target === 'mobile' ? 'email' : 'mobile';
      setTimeout(() => {
        if (this.signupOptions[target as keyof SignupOptions]) {
          (this.$refs.preview as SignupAndLoginComponent).switchSignupMethodTo(
            target
          );
        } else if (this.signupOptions[theOtherOne as keyof SignupOptions]) {
          (this.$refs.preview as SignupAndLoginComponent).switchSignupMethodTo(
            theOtherOne
          );
        }
      }, 20);
    },

    switchLoginMethod(target: string) {
      if (!this.codeLogin && !this.pwdLogin) return;
      setTimeout(() => {
        if (target === 'code') {
          (this.$refs.preview as SignupAndLoginComponent).switchLoginMethodTo(
            this.codeLogin ? 'code' : 'password'
          );
        } else {
          (this.$refs.preview as SignupAndLoginComponent).switchLoginMethodTo(
            this.pwdLogin ? 'password' : 'code'
          );
        }
      }, 20);
    },
  },
});
</script>

<style lang="scss" scoped>
.img-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 3px;
}
</style>
