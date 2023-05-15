import { Organization } from '../type';

export interface Role {
  /** 角色 ID */
  id: string;
  /** 角色名称 */
  name?: string;
  /** 角色 Code */
  code?: string;
  /** 角色描述 */
  description?: string;
  /** 所属组织类型 */
  org_type?: Organization;
  /** 角色创建时间 */
  created_at?: Date;
  /** 角色状态：true-禁用；false-正常 */
  is_deleted?: boolean;
}

export interface RoleSet {
  label: string;
  roles: Role[];
}

export interface RolePostData {
  /** 角色名称 */
  name?: string;
  /** 角色 Code */
  code?: string;
  /** 角色描述 */
  description?: string;
  /** 所属组织类型 ID */
  org_type_id?: string;
}

export interface RolePostError {
  name?: string;
  code?: string;
  org_type_id?: string;
}

export interface BindUsersPostData {
  /** 用户的 ID */
  user_ids?: string[];
  /** 角色的 ID */
  role_ids?: string[];
}

export interface BindUsersPostError {
  user_ids?: string;
  role_ids?: string;
}
