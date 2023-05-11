export interface User {
  /** 用户 ID */
  id: string;
  /** 用户姓名 */
  name?: string;
  /** 用户手机号 */
  mobile?: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户用户名 */
  username?: string;
  /** 用户直属部门 */
  departments?: Department[];
  /** 用户关联角色 */
  roles?: Role[];
  /** 用户最后登录时间 */
  last_login_at?: Date;
  /** 用户创建时间 */
  created_at?: Date;
  /** 用户是否禁用 */
  is_deleted?: boolean;
}

export interface UserPostData {
  /** 用户姓名 */
  name?: string;
  /** 用户手机号 */
  mobile?: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户用户名 */
  username?: string;
  /** 用户直属部门 */
  organization_ids?: string[];
}

export interface UserPostError {
  name?: string;
  mobile?: string;
  email?: string;
  username?: string;
  __root__?: string;
}

export interface OrgTree {
  /** 打开企业机构的表单对话框 */
  openEnterpriseForm: (enterpriseId?: string) => void;
  /** 删除企业机构的表单对话框 */
  deleteOrganization: (orgId: string) => void;
}

export interface Organization {
  /** 组织 ID */
  id: string;
  /** 组织 Code */
  code?: string;
  /** 组织名称 */
  name: string;
}

export interface OrgType extends Organization {
  code: string;
  /** 组织类型描述 */
  description?: string;
  /** 组织类型是否停用 */
  is_deleted: boolean;
  /** 是否为默认组织类型 */
  is_protected: boolean;
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

export interface BindUsersPostData {
  /** 多个用户的 ID 集合 */
  user_ids?: string[];
  /** 多个组织的 ID 集合 */
  organization_ids?: string[];
  /** 组织类型 ID */
  org_type_id?: string;
}

export interface BindUsersPostError {
  user_ids?: string;
  organization_ids?: string;
}

export interface TransferPostData {
  /** 用户的 ID */
  user_id?: string;
  /** 组织的 ID */
  organization_ids?: string[];
}

export interface TransferPostError {
  user_id?: string;
  organization_ids?: string;
}

export interface Role {
  /** 角色 ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色 Code */
  code?: string;
  /** 角色描述 */
  description?: string;
  /** 所属组织类型 */
  org_type?: Organization;
  /** 角色创建时间 */
  created_at?: Date;
  /** 用户是否禁用 */
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

export interface SetRolePostData {
  /** 用户的 ID */
  user_id?: string;
  /** 角色的 ID */
  role_ids?: string[];
}

export interface SetRolePostError {
  user_id?: string;
  role_ids?: string;
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

export interface Permission {
  name: string;
  desc?: string;
  code: string;
  path?: string;
}
