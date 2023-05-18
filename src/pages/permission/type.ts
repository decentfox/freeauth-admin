export interface Permission {
  /** 权限 ID */
  id: string;
  /** 权限名称 */
  name?: string;
  /** 权限 Code */
  code?: string;
  /** 权限描述 */
  description?: string;
  /** 权限创建时间 */
  created_at?: Date;
  /** 权限状态：true-禁用；false-正常 */
  is_deleted?: boolean;
}

export interface PermissionPostData {
  /** 权限名称 */
  name?: string;
  /** 权限 Code */
  code?: string;
  /** 权限描述 */
  description?: string;
}

export interface PermissionPostError {
  name?: string;
  code?: string;
}
