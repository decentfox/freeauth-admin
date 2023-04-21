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
                      v-model="policyText"
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
                      v-model="policyLink"
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
                    @update:model-value="switchSignupMethod"
                  />
                  <q-checkbox
                    v-model="signupOptions.email"
                    dense
                    size="32px"
                    label="支持邮箱和验证码注册"
                    class="full-width q-mt-sm"
                    @update:model-value="switchSignupMethod"
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
                      @update:model-value="switchLoginMethod"
                    />
                    <q-checkbox
                      v-model="codeLoginOptions.email"
                      dense
                      size="32px"
                      label="支持邮箱和验证码登录"
                      class="full-width q-mt-sm"
                      @update:model-value="switchLoginMethod"
                    />
                  </div>
                  <div>
                    <q-item-label class="text-caption hint-label q-pt-sm">
                      密码登录
                    </q-item-label>
                    <q-checkbox
                      v-model="pwdLoginOptions.username"
                      dense
                      size="32px"
                      label="支持手机号和密码登录"
                      class="full-width q-mt-sm"
                      @update:model-value="switchLoginMethod"
                    />
                    <q-checkbox
                      v-model="pwdLoginOptions.email"
                      dense
                      size="32px"
                      label="支持邮箱和密码登录"
                      class="full-width q-mt-sm"
                      @update:model-value="switchLoginMethod"
                    />
                    <q-checkbox
                      v-model="pwdLoginOptions.mobile"
                      dense
                      size="32px"
                      label="支持用户名和密码登录"
                      class="full-width q-mt-sm"
                      @update:model-value="switchLoginMethod"
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
        <q-card bordered class="q-mx-xl q-my-md q-pa-md preview">
          <q-tab-panels
            ref="preview"
            v-model="previewPanel"
            animated
            class="bg-white preview-panel"
          >
            <q-tab-panel name="signup-panel">
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
                <q-tab
                  v-if="signupOptions.mobile"
                  name="mobile"
                  label="手机号注册"
                />
                <q-tab
                  v-if="signupOptions.email"
                  name="email"
                  label="邮箱注册"
                />
              </q-tabs>
              <q-separator color="grey-4" />
              <q-tab-panels
                ref="signup"
                v-model="signupTab"
                animated
                class="bg-white"
              >
                <!-- 注册框：手机号注册 -->
                <q-tab-panel
                  v-if="signupOptions.mobile"
                  name="mobile"
                  class="q-pt-lg bg-white"
                >
                  <verification-code-form
                    is-preview
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
                      @click="loginSettings = true"
                    />
                  </div>
                </q-tab-panel>
                <!-- 注册框：邮箱注册 -->
                <q-tab-panel
                  v-if="signupOptions.email"
                  name="email"
                  class="q-pt-lg bg-white"
                >
                  <verification-code-form
                    is-preview
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
                      @click="loginSettings = true"
                    />
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-tab-panel>

            <q-tab-panel name="login-panel">
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
                <q-tab
                  v-if="codeLoginOptions.email || codeLoginOptions.mobile"
                  name="code"
                  label="验证码登录"
                />
                <q-tab
                  v-if="
                    pwdLoginOptions.email ||
                    pwdLoginOptions.mobile ||
                    pwdLoginOptions.username
                  "
                  name="password"
                  label="密码登录"
                />
              </q-tabs>
              <q-separator color="grey-4" />
              <q-tab-panels
                ref="login"
                v-model="loginTab"
                animated
                class="bg-white"
              >
                <!-- 登录框：验证码登录 -->
                <q-tab-panel
                  v-if="codeLoginOptions.email || codeLoginOptions.mobile"
                  name="code"
                  class="q-pt-lg bg-white"
                >
                  <verification-code-form
                    is-preview
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
                      @click="signupSettings = true"
                    />
                  </div>
                </q-tab-panel>
                <!-- 登录框：密码登录 -->
                <q-tab-panel
                  v-if="
                    pwdLoginOptions.email ||
                    pwdLoginOptions.mobile ||
                    pwdLoginOptions.username
                  "
                  name="password"
                >
                  <q-form class="q-gutter-md">
                    <q-input
                      v-model="passwordForm.identity"
                      dense
                      filled
                      :placeholder="passwordLoginPlaceholder"
                      hide-bottom-space
                      bg-color="grey-2"
                      disable
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
                      disable
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
                      <q-btn
                        flat
                        unelevated
                        type="button"
                        color="primary"
                        label="没有账号，点击前往注册"
                        :style="`color: ${color} !important`"
                        @click="signupSettings = true"
                      />
                    </div> </q-form
                ></q-tab-panel>
              </q-tab-panels>
            </q-tab-panel>
          </q-tab-panels>
          <div
            v-if="withPolicy"
            class="row items-center absolute-bottom q-pa-lg q-ml-md"
          >
            <q-checkbox v-model="policy" size="32px" />
            <q-item-label class="text-grey-8">
              {{ policyText || `我已阅读并同意隐私协议与服务条款` }}
            </q-item-label>
          </div>
        </q-card>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QFile, QTabPanels } from 'quasar';

import VerificationCodeForm from 'components/form/VerificationCodeForm.vue';

export default defineComponent({
  name: 'IndexPage',

  components: {
    VerificationCodeForm,
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
      policyText: ref(''),
      policyLink: ref(''),

      // Signup Settings
      signupOptions: ref({
        email: false,
        mobile: true,
      }),
      initialization: ref(false),
      signupSettings: ref(false),

      // Login Settings
      codeLoginOptions: ref({
        email: false,
        mobile: true,
      }),
      pwdLoginOptions: ref({
        email: false,
        mobile: false,
        username: false,
      }),
      loginSettings: ref(false),

      // Preview
      previewPanel: ref('signup-panel'),
      signupTab: ref('mobile'),
      loginTab: ref('code'),
      policy: ref(false),

      // Password Login
      passwordForm: ref({
        identity: ref(''),
        password: ref(''),
      }),
      showPwd: ref(false),
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

    passwordLoginPlaceholder() {
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
  },

  methods: {
    handleUpload() {
      if (this.logo) {
        this.imageUrl = URL.createObjectURL(this.logo);
      }
    },

    uploadImage() {
      console.error('haha');
      (this.$refs.file as QFile).pickFiles();
    },

    switchPreviewPanel() {
      console.error('haha');
      if (this.loginSettings) {
        (this.$refs.preview as QTabPanels).goTo('login-panel');
      }
      if (this.signupSettings) {
        (this.$refs.preview as QTabPanels).goTo('signup-panel');
      }
    },

    switchSignupMethod() {
      if (this.signupOptions.email) {
        (this.$refs.signup as QTabPanels).goTo('email');
      }
      if (this.signupOptions.mobile) {
        (this.$refs.signup as QTabPanels).goTo('mobile');
      }
    },

    switchLoginMethod() {
      if (this.codeLoginOptions.email || this.codeLoginOptions.mobile) {
        (this.$refs.login as QTabPanels).goTo('code');
      }
      if (
        this.pwdLoginOptions.email ||
        this.pwdLoginOptions.mobile ||
        this.pwdLoginOptions.username
      ) {
        (this.$refs.login as QTabPanels).goTo('password');
      }
    },
  },
});
</script>

<style lang="scss">
.img-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 3px;
}

.preview {
  width: 380px;
  background-color: white;

  .img-wrapper {
    width: 48px;
    height: 48px;
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
