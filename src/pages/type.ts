export interface OrgTree {
  /** 展开组织树结构 */
  expandTree: () => void;
  /** 创建企业机构的表单对话框 */
  createEnterprise: () => void;
  /** 编辑企业机构的表单对话框 */
  editEnterprise: (enterpriseId: string) => void;
  /** 删除企业机构的表单对话框 */
  deleteEnterprise: (enterpriseId: string) => void;
}

export interface OrgTypeOption {
  /** 组织类型 ID */
  id: string;
  /** 组织类型名称 */
  name: string;
  /** 组织类型描述 */
  description?: string;
  /** 组织类型是否停用 */
  is_deleted: boolean;
  /** 是否为默认组织类型 */
  is_protected: boolean;
}

export interface OrgTypePostData {
  /** 组织类型 ID */
  id?: string;
  /** 组织类型名称 */
  name?: string;
  /** 组织类型描述 */
  description?: string;
  /** 组织类型是否停用 */
  is_deleted?: boolean;
  /** 是否为默认组织类型 */
  is_protected?: boolean;
}

export interface OrgTypePostError {
  name?: string;
  __root__?: string;
}

export interface User {
  id: string;
  name?: string;
  mobile?: string;
  email?: string;
  username: string;
  depts?: string[];
  last_login_at?: Date;
  created_at?: Date;
  is_deleted: boolean;
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
}

export interface UserPostError {
  name?: string;
  mobile?: string;
  email?: string;
  username?: string;
  __root__?: string;
}

export interface EnterprisePostData {
  /** 企业名称 */
  name?: string;
  /** 企业纳税识别号 */
  taxId?: string;
  /** 企业开户行 */
  issuingBank?: string;
  /** 企业银行账号 */
  bankAccountNumber?: string;
  /** 企业办公地址 */
  contactAddress?: string;
  /** 企业办公电话 */
  contactPhoneNum?: string;
}

export interface Enterprise {
  /** 企业 ID */
  id: string;
  /** 企业名称 */
  name: string;
  /** 企业纳税识别号 */
  taxId?: string;
  /** 企业开户行 */
  issuingBank?: string;
  /** 企业银行账号 */
  bankAccountNumber?: string;
  /** 企业办公地址 */
  contactAddress?: string;
  /** 企业办公电话 */
  contactPhoneNum?: string;
}

export interface BranchPostData {
  /** 组织分支名称 */
  name?: string;
  /** 组织分支描述 */
  desc?: string;
  /** 所属上级部门 ID */
  parentId?: number;
  /** 直属企业 ID */
  enterprise?: number;
}

export interface Permission {
  name: string;
  desc?: string;
  code: string;
  path?: string;
}
