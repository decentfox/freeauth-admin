export enum GuardMode {
  signin = 'signin',
  signup = 'signup',
}

export enum LoginMode {
  code = 'code',
  password = 'password',
}

export const LoginModeLabel = {
  [LoginMode.code]: '验证码',
  [LoginMode.password]: '密码',
};

export enum AuthMode {
  username = 'username',
  mobile = 'mobile',
  email = 'email',
}

export const AuthModeLabel = {
  [AuthMode.mobile]: '手机号',
  [AuthMode.email]: '邮箱',
  [AuthMode.username]: '用户名',
};

export type LoginSetting = {
  /** 登录框自定义图标 */
  guardLogo?: string;
  /** 登录框自定义标题 */
  guardTitle?: string;
  /** 登录框自定义界面主色 */
  guardPrimaryColor?: string;
  /** 是否启用登录注册协议 */
  agreementEnabled?: boolean;
  /** 登录注册协议勾选框文字 */
  agreementTitle?: string;
  /** 登录注册协议跳转链接 */
  agreementLink?: string;
  /** 支持的注册方式：mobile（手机号验证码注册） 或 email（邮箱验证码注册） */
  signupModes?: AuthMode[];
  /** 是否启用注册验证码尝试次数限制 */
  signupCodeValidatingLimitEnabled?: boolean;
  /** 同一注册验证码在指定周期内允许输入错误的次数：次 */
  signupCodeValidatingMaxAttempts?: number;
  /** 同一注册验证码尝试验证的周期 */
  signupCodeValidatingInterval?: number;
  /** 是否启用注册验证码发送次数限制 */
  signupCodeSendingLimitEnabled?: boolean;
  /** 同一账号在指定周期内允许获取注册验证码的次数：次 */
  signupCodeSendingMaxAttempts?: number;
  /** 同一账号多次获取注册验证码的周期 */
  signupCodeSendingInterval?: number;
  /** 是否启用注册后首次登录时强制要求修改密码 */
  changePwdAfterFirstLoginEnabled?: boolean;
  /** 支持的验证码登录方式：mobile（手机号验证码登录） 或 email（邮箱验证码登录） */
  codeSigninModes?: AuthMode[];
  /** 是否启用登录验证码尝试次数限制 */
  signinCodeValidatingLimitEnabled?: boolean;
  /** 同一登录验证码在指定周期内允许输入错误的次数 */
  signinCodeValidatingMaxAttempts?: number;
  /** 同一登录验证码尝试验证的周期 */
  signinCodeValidatingInterval?: number;
  /** 是否启用登录验证码发送次数限制 */
  signinCodeSendingLimitEnabled?: boolean;
  /** 同一账号在指定周期内允许获取登录验证码的次数 */
  signinCodeSendingMaxAttempts?: number;
  /** 同一账号多次获取登录验证码的周期 */
  signinCodeSendingInterval?: number;
  /** 支持的密码登录方式：mobile（手机号密码登录）、email（邮箱密码登录）或 username（用户名密码登录） */
  pwdSigninModes?: AuthMode[];
  /** 是否启用密码尝试次数限制 */
  signinPwdValidatingLimitEnabled?: boolean;
  /** 同一账号在指定周期内允许密码输入错误的次数 */
  signinPwdValidatingMaxAttempts?: number;
  /** 同一账号尝试验证密码的周期 */
  signinPwdValidatingInterval?: number;
  /** Cookie 过期时间（分钟），0 代表关闭浏览器即过期 */
  jwtTokenTtl?: number;

  [key: string]: unknown;
};
