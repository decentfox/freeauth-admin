export interface Application {
  /** 应用 ID */
  id: string;
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
  /** 应用密钥 */
  secret_key?: string;
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
