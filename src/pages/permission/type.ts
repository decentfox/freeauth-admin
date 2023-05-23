import { Role } from '../role/type';
import { Application, Tag } from '../type';

export interface Permission {
  /** 权限 ID */
  id: string;
  /** 权限名称 */
  name?: string;
  /** 权限 Code */
  code?: string;
  /** 权限描述 */
  description?: string;
  /** 权限关联的角色 */
  roles?: Role[];
  /** 权限所属应用 */
  application?: Application;
  /** 权限关联标签列表 */
  tags?: Tag[];
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
  /** 所属应用 ID */
  application_id?: string;
  /** 已有标签 ID 列表 */
  existing_tag_ids?: string[];
  /** 新建标签名称列表 */
  new_tags?: string[];
}

export interface PermissionPostError {
  name?: string;
  code?: string;
  application_id?: string;
}

export interface BindRolesToPermsPostData {
  /** 权限的 ID 列表 */
  permission_ids?: string[];
  /** 角色的 ID 列表 */
  role_ids?: string[];
}

export interface BindRolesToPermsPostError {
  permission_ids?: string;
  role_ids?: string;
}
