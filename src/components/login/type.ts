export interface SignupAndLoginComponent {
  /** 注册框与登录框间的切换 */
  switchTo: (panelName: string, emit: boolean) => void;
  /** 注册方式的切换：手机号注册、邮箱注册 */
  switchSignupMethodTo: (methodName: string) => void;
  /** 登录方式的切换：验证码登录、密码登录 */
  switchLoginMethodTo: (methodName: string) => void;
}

export interface SignupAndLoginPolicy {
  /** 登录注册协议勾选框文字 */
  text?: string;
  /** 登录注册协议跳转链接 */
  link?: string;
}

export type SignupOptions = {
  /** 是否支持手机号验证码注册 */
  mobile: boolean;
  /** 是否支持邮箱验证码注册 */
  email: boolean;
};

export type CodeLoginOptions = {
  /** 是否支持手机号验证码登录 */
  mobile: boolean;
  /** 是否支持邮箱验证码登录 */
  email: boolean;
};

export type PwdLoginOptions = {
  /** 是否支持手机号密码登录 */
  mobile: boolean;
  /** 是否支持邮箱密码登录 */
  email: boolean;
  /** 是否支持用户名密码登录 */
  username: boolean;
};

export type SecurityConfig = {
  /** 是否启用该安全项 */
  status: boolean;
  /** 安全项作用的周期 */
  duration?: number;
  /** 安全项作用周期内允许的操作次数 */
  times?: number;
};
