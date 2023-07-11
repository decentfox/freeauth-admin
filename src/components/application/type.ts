export interface Application {
  /** 应用 ID */
  id: string;
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
  /** 应用密钥 */
  secret_key?: string;
  /** 应用是否为预设应用 */
  is_protected?: boolean;
}

export interface ApplicationPostData {
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
}

export interface ApplicationPostError {
  name?: string;
}
