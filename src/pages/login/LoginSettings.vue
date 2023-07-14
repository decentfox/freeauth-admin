<template>
  <page-wrapper page-title="定制登录">
    <q-splitter
      v-model="splitterModel"
      disable
      style="height: calc(100vh - 82px)"
    >
      <template #before>
        <div class="q-px-sm">
          <q-list v-if="ready">
            <login-setting-panel
              v-model="basicExpanded"
              title="基础配置"
              icon="display_settings"
            >
              <q-card-section class="q-gutter-sm">
                <q-item-label class="q-pb-sm text-weight-bold">
                  登录注册框样式
                </q-item-label>
                <q-item-section>
                  <q-item-label class="text-caption hint-label">
                    自定义图标（logo）
                  </q-item-label>
                  <div class="row items-center">
                    <q-img
                      :src="loginSettings.guardLogo"
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
                      :model-value="null"
                      accept=".png, .jpg, .jpeg"
                      style="display: none"
                      @update:model-value="handleUpload"
                    />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption hint-label">
                    自定义标题
                  </q-item-label>
                  <q-input
                    v-model="loginSettings.guardTitle"
                    filled
                    dense
                    placeholder="请填写登录注册框标题"
                    hide-bottom-space
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption hint-label">
                    自定义界面主色
                  </q-item-label>
                  <q-input
                    v-model="loginSettings.guardPrimaryColor"
                    filled
                    dense
                  >
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
                          <q-color v-model="loginSettings.guardPrimaryColor" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </q-item-section>
              </q-card-section>
              <q-card-section class="q-gutter-sm">
                <q-toggle
                  v-model="loginSettings.agreementEnabled"
                  left-label
                  label="开启登录注册协议"
                  class="text-weight-bold"
                />
                <q-item-section v-if="loginSettings.agreementEnabled">
                  <q-item-label class="text-caption hint-label">
                    协议勾选框文字
                  </q-item-label>
                  <q-input
                    v-model="loginSettings.agreementTitle"
                    filled
                    dense
                    prefix="我已阅读并同意"
                    placeholder="例如：隐私协议与服务条款"
                    hide-bottom-space
                  />
                </q-item-section>
                <q-item-section v-if="loginSettings.agreementEnabled">
                  <q-item-label class="text-caption hint-label">
                    协议跳转链接
                  </q-item-label>
                  <q-input
                    v-model="loginSettings.agreementLink"
                    filled
                    dense
                    placeholder="https://"
                    hide-bottom-space
                  />
                </q-item-section>
              </q-card-section>
            </login-setting-panel>

            <q-separator />

            <login-setting-panel
              :model-value="
                !basicExpanded && currentGuardMode === GuardMode.signup
              "
              title="注册配置"
              icon="settings_accessibility"
              @update:model-value="
                (val: boolean) =>
                  (currentGuardMode = val ? GuardMode.signup : currentGuardMode)
              "
            >
              <q-card-section>
                <q-item-label class="q-pb-sm text-weight-bold">
                  选择注册方式
                </q-item-label>
                <q-option-group
                  v-model="loginSettings.signupModes"
                  :options="signupModeOptions"
                  type="checkbox"
                  dense
                  size="32px"
                  class="q-mt-sm"
                  @update:model-value="
                    (modes: AuthMode[]) => (currentSignupMode = modes.slice(-1)[0])
                  "
                />
              </q-card-section>
              <template v-if="signupEnabled">
                <q-card-section>
                  <security-config-item
                    v-model="loginSettings.signupCodeValidatingLimitEnabled"
                    v-model:interval="
                      loginSettings.signupCodeValidatingInterval
                    "
                    v-model:max-attempts="
                      loginSettings.signupCodeValidatingMaxAttempts
                    "
                    toggle-label="注册验证码尝试次数"
                    description="验证码有效限定周期内，允许用户试错次数，超出则需重新获取"
                    action-hint="允许试错次数"
                  />
                </q-card-section>
                <q-card-section>
                  <security-config-item
                    v-model="loginSettings.signupCodeSendingLimitEnabled"
                    v-model:interval="loginSettings.signupCodeSendingInterval"
                    v-model:max-attempts="
                      loginSettings.signupCodeSendingMaxAttempts
                    "
                    toggle-label="注册验证码发送限制"
                    description="同一个手机或邮箱，在限定周期内可获取的注册验证码次数"
                    action-hint="可获取验证码次数"
                  />
                </q-card-section>

                <q-separator inset spaced="md" />

                <q-card-section>
                  <security-config-item
                    v-model="loginSettings.changePwdAfterFirstLoginEnabled"
                    toggle-label="注册后修改初始密码"
                    description="开启后，用户完成注册后会被要求修改自动生成的初始密码"
                  />
                </q-card-section>
              </template>
            </login-setting-panel>

            <q-separator />

            <login-setting-panel
              :model-value="
                !basicExpanded && currentGuardMode === GuardMode.signin
              "
              title="登录配置"
              icon="password"
              @update:model-value="
                (val: boolean) =>
                  (currentGuardMode = val ? GuardMode.signin : currentGuardMode)
              "
            >
              <q-card-section>
                <q-item-label class="q-pb-sm text-weight-bold">
                  选择验证码登录方式
                </q-item-label>
                <q-option-group
                  v-model="loginSettings.codeSigninModes"
                  :options="codeSigninModeOptions"
                  type="checkbox"
                  dense
                  size="32px"
                  class="q-mt-sm"
                  @update:model-value="
                    (modes: AuthMode[]) =>
                      (currentLoginMode =
                        !pwdLoginEnabled || modes.length > 0
                          ? LoginMode.code
                          : LoginMode.password)
                  "
                />
              </q-card-section>
              <q-card-section v-if="codeLoginEnabled">
                <security-config-item
                  v-model="loginSettings.signinCodeValidatingLimitEnabled"
                  v-model:interval="loginSettings.signinCodeValidatingInterval"
                  v-model:max-attempts="
                    loginSettings.signinCodeValidatingMaxAttempts
                  "
                  toggle-label="登录验证码尝试次数"
                  description="验证码有效限定周期内，允许用户试错次数，超出则需重新获取"
                  action-hint="允许试错次数"
                />
              </q-card-section>
              <q-card-section v-if="codeLoginEnabled">
                <security-config-item
                  v-model="loginSettings.signinCodeSendingLimitEnabled"
                  v-model:interval="loginSettings.signinCodeSendingInterval"
                  v-model:max-attempts="
                    loginSettings.signinCodeSendingMaxAttempts
                  "
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
                <q-option-group
                  v-model="loginSettings.pwdSigninModes"
                  :options="pwdSigninModeOptions"
                  type="checkbox"
                  dense
                  size="32px"
                  class="q-mt-sm"
                  @update:model-value="
                    (modes: AuthMode[]) =>
                      (currentLoginMode =
                        modes.length > 0 ? LoginMode.password : LoginMode.code)
                  "
                />
              </q-card-section>
              <q-card-section v-if="pwdLoginEnabled">
                <security-config-item
                  v-model="loginSettings.signinPwdValidatingLimitEnabled"
                  v-model:interval="loginSettings.signinPwdValidatingInterval"
                  v-model:max-attempts="
                    loginSettings.signinPwdValidatingMaxAttempts
                  "
                  toggle-label="登录密码尝试次数"
                  description="限定周期内允许用户试错次数，超出后当日不再允许登录"
                  action-hint="允许试错次数"
                />
              </q-card-section>

              <q-separator inset spaced="md" />

              <q-card-section>
                <security-config-item
                  v-model:interval="loginSettings.jwtTokenTtl"
                  :model-value="!!loginSettings.jwtTokenTtl"
                  toggle-label="cookie 过期时间"
                  description="用户登录状态的有效时间，过期后用户需要重新登录"
                  @update:model-value="
                    (val: number) => (loginSettings.jwtTokenTtl = val ? 1440 : 0)
                  "
                />
              </q-card-section>
            </login-setting-panel>
            <q-separator />
          </q-list>
          <q-inner-loading :showing="!ready">
            <q-spinner-ios size="sm" color="primary" />
          </q-inner-loading>
        </div>
      </template>
      <template #after>
        <div class="q-mx-xl q-my-sm">
          <signup-and-login-frame
            v-model="currentGuardMode"
            v-model:signup-mode="currentSignupMode"
            v-model:login-mode="currentLoginMode"
            is-preview
            @update:model-value="basicExpanded = false"
          />
        </div>
      </template>
    </q-splitter>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapActions, mapState } from 'pinia';
import { QFile } from 'quasar';

import {
  AuthMode,
  AuthModeLabel,
  GuardMode,
  LoginMode,
} from 'components/login/type';
import { loginSettingsStore } from 'stores/login-settings-store';

export default defineComponent({
  name: 'LoginSettings',

  setup() {
    return {
      splitterModel: 40,
      basicExpanded: ref(true),
      currentGuardMode: ref(GuardMode.signup),
      currentSignupMode: ref(AuthMode.mobile),
      currentLoginMode: ref(LoginMode.code),

      GuardMode,
      LoginMode,
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

    signupModeOptions() {
      return [AuthMode.mobile, AuthMode.email].map((mode) => ({
        label: `支持${AuthModeLabel[mode]}和验证码注册`,
        value: mode,
      }));
    },

    codeSigninModeOptions() {
      return [AuthMode.mobile, AuthMode.email].map((mode) => ({
        label: `支持${AuthModeLabel[mode]}和验证码登录`,
        value: mode,
      }));
    },

    pwdSigninModeOptions() {
      return [AuthMode.mobile, AuthMode.email, AuthMode.username].map(
        (mode) => ({
          label: `支持${AuthModeLabel[mode]}和密码登录`,
          value: mode,
        })
      );
    },
  },

  created() {
    this.loadLoginSettings();
  },

  methods: {
    ...mapActions(loginSettingsStore, ['loadSettings']),

    async loadLoginSettings() {
      await this.loadSettings();
      this.currentGuardMode = this.signupEnabled
        ? GuardMode.signup
        : GuardMode.signin;
      this.currentSignupMode = this.loginSettings.signupModes?.includes(
        AuthMode.mobile
      )
        ? AuthMode.mobile
        : AuthMode.email;
      this.currentLoginMode = this.codeLoginEnabled
        ? LoginMode.code
        : LoginMode.password;
    },

    handleUpload(logo: File) {
      if (logo) {
        const reader = new FileReader();
        reader.onload = () => {
          this.loginSettings.guardLogo = reader.result as string;
        };
        reader.readAsDataURL(logo);
      }
    },

    uploadImage() {
      (this.$refs.file as QFile).pickFiles();
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
