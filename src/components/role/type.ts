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
import { OrgType } from '../organization/type';
import { User } from '../user/type';

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
  org_type?: OrgType;
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

export interface BindUsersToRolesPostData {
  /** 用户的 ID 列表 */
  user_ids?: string[];
  /** 角色的 ID 列表 */
  role_ids?: string[];
}

export interface BindUsersToRolesPostError {
  user_ids?: string;
  role_ids?: string;
}

export interface RoleOperationsType {
  methods: {
    toggleRolesStatus: (
      roles: Role[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deleteRoles: (roles: Role[], handler?: (...args: [string]) => void) => void;
    unbindUsers: (
      role: Role,
      users: User[],
      handler?: (...args: [string]) => void
    ) => void;
  };
}
