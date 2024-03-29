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
import { QTreeNode } from 'quasar';

export interface OrgOperationsType {
  methods: {
    deleteOrgType: (
      orgType: OrgType,
      handler?: (...args: [string]) => void
    ) => void;

    deleteOrganization: (
      org: Organization,
      handler?: (...args: [string]) => void,
      isEnterprise?: boolean
    ) => void;
  };
}

export interface OrgTreeComponent {
  /** 打开企业机构的表单对话框 */
  openEnterpriseForm: (enterpriseId?: string) => void;
  /** 刷新组织树结构 */
  loadOrgTree: (resetSelectedNode?: boolean) => void;
}

export interface OrgTypeSelectComponent {
  openOrgTypeForm: (orgType?: OrgType) => void;
}

export interface OrgTypeFormComponent {
  /** 唤醒组织类型编辑对话框 */
  show: (orgType?: OrgType) => void;
}

export interface EnterpriseFormComponent {
  /** 唤醒企业信息编辑对话框 */
  show: (enterpriseId?: string) => void;
}

export interface DepartmentFormComponent {
  /** 唤醒部门信息编辑对话框 */
  show: (deptId?: string, parentNode?: QTreeNode) => void;
}

export interface Organization {
  /** 组织 ID */
  id: string;
  /** 组织 Code */
  code?: string;
  /** 组织名称 */
  name: string;
  /** 组织是否为企业类型 */
  is_enterprise?: boolean;
}

export interface OrgType extends Organization {
  /** 组织类型描述 */
  description?: string;
  /** 组织类型状态：true-停用；false-正常 */
  is_deleted?: boolean;
  /** 是否为默认组织类型 */
  is_protected?: boolean;
}

export interface OrgTypePostData {
  /** 组织类型名称 */
  name?: string;
  /** 组织类型 Code */
  code?: string;
  /** 组织类型描述 */
  description?: string;
  /** 组织类型是否停用 */
  is_deleted?: boolean;
}

export interface OrgTypePostError {
  name?: string;
  code?: string;
}

export interface Enterprise extends Organization {
  /** 企业机构纳税识别号 */
  tax_id?: string;
  /** 企业机构开户行 */
  issuing_bank?: string;
  /** 企业机构银行账号 */
  bank_account_number?: string;
  /** 企业机构办公地址 */
  contact_address?: string;
  /** 企业机构办公电话 */
  contact_phone_num?: string;
}

export interface EnterprisePostData {
  /** 企业机构所属组织类型 ID */
  org_type_id?: string;
  /** 企业机构 Code */
  code?: string;
  /** 企业机构名称 */
  name?: string;
  /** 企业机构纳税识别号 */
  tax_id?: string;
  /** 企业机构开户行 */
  issuing_bank?: string;
  /** 企业机构银行账号 */
  bank_account_number?: string;
  /** 企业机构办公地址 */
  contact_address?: string;
  /** 企业机构办公电话 */
  contact_phone_num?: string;
}

export interface EnterprisePostError {
  name?: string;
  tax_id?: string;
  code?: string;
}

export interface Department extends Organization {
  /** 部门分支描述 */
  description?: string;
  /** 所属上级部门 ID */
  parent_id: string;
}

export interface DepartmentPostData {
  /** 部门分支名称 */
  name?: string;
  /** 部门分支 Code */
  code?: string;
  /** 部门分支描述 */
  description?: string;
  /** 所属上级部门 ID */
  parent_id?: string;
}

export interface DepartmentPostError {
  name?: string;
  code?: string;
  parent_id?: string;
}

export interface BindUsersToOrgsPostData {
  /** 多个用户的 ID 集合 */
  user_ids?: string[];
  /** 多个组织的 ID 集合 */
  organization_ids?: string[];
  /** 组织类型 ID */
  org_type_id?: string;
}

export interface BindUsersToOrgsPostError {
  user_ids?: string;
  organization_ids?: string;
}
