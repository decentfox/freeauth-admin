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
              v-model="signupSettings"
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
                <q-card-section>
                  <q-toggle
                    v-model="initialization"
                    left-label
                    label="修改默认用户名密码"
                    class="text-weight-bold"
                  />
                  <q-item-label class="text-caption hint-label">
                    开启后，用户注册后会被要求修改用户名及密码
                  </q-item-label>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-separator />

            <q-expansion-item
              v-model="loginSettings"
              group="somegroup"
              icon="password"
              label="登录配置"
              hide-expand-icon
              header-class="text-black-white text-weight-bold text-body1"
              @update:model-value="switchPreviewPanel"
            >
              <q-separator />
              <q-card class="q-pa-md">
                <q-card-section class="q-gutter-sm">
                  <q-item-label class="q-pb-sm text-weight-bold">
                    选择登录方式
                  </q-item-label>

                  <div>
                    <q-item-label class="text-caption hint-label">
                      验证码登录
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
                  </div>
                  <div>
                    <q-item-label class="text-caption hint-label q-pt-sm">
                      密码登录
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
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-separator />
          </q-list>
        </div>
      </template>
      <template #after>
        <div class="q-mx-xl q-my-md">
          <signup-and-login
            ref="preview"
            is-preview
            :image-url="imageUrl"
            :title="title"
            :color="color"
            :with-policy="withPolicy"
            :policy="policy"
            :signup-options="signupOptions"
            :initialization="initialization"
            :code-login-options="codeLoginOptions"
            :pwd-login-options="pwdLoginOptions"
          />
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QFile } from 'quasar';

import SignupAndLogin from 'components/form/SignupAndLogin.vue';
import {
  CodeLoginOptions,
  PwdLoginOptions,
  SignupAndLoginComponent,
  SignupAndLoginPolicy,
  SignupOptions,
} from 'components/form/type';

export default defineComponent({
  name: 'IndexPage',

  components: {
    SignupAndLogin,
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
      initialization: ref(false),
      signupSettings: ref(false),

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
      loginSettings: ref(false),
    };
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
      if (this.loginSettings) {
        (this.$refs.preview as SignupAndLoginComponent).switchTo('login-panel');
      }
      if (this.signupSettings) {
        (this.$refs.preview as SignupAndLoginComponent).switchTo(
          'signup-panel'
        );
      }
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
      const codeLogin =
        this.codeLoginOptions.email || this.codeLoginOptions.mobile;
      const pwdlogin =
        this.pwdLoginOptions.email ||
        this.pwdLoginOptions.mobile ||
        this.pwdLoginOptions.username;

      if (!codeLogin && !pwdlogin) return;

      setTimeout(() => {
        (this.$refs.preview as SignupAndLoginComponent).switchLoginMethodTo(
          target === 'code' && codeLogin ? 'code' : 'password'
        );
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
