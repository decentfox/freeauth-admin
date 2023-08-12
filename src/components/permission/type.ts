/*
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
*/
import { Application } from '../application/type';
import { Role } from '../role/type';
import { Tag } from '../tag/type';

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
  /** 关联标签 ID 列表 */
  tags?: string[];
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

export interface PermOperationsType {
  methods: {
    togglePermissionsStatus: (
      permissions: Permission[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deletePermissions: (
      permissions: Permission[],
      handler?: (...args: [string]) => void
    ) => void;
    unbindRoles: (
      permission: Permission,
      roles: Role[],
      handler?: (...args: [string]) => void
    ) => void;
  };
}
