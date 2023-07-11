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
  /** 应用是否被禁用 */
  is_deleted?: boolean;
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

export interface AppOperationsType {
  methods: {
    toggleApplicationsStatus: (
      applications: Application[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deleteApplications: (
      applications: Application[],
      handler?: (...args: [string]) => void
    ) => void;
    resetAppSecret: (appId: string) => void;
  };
}
