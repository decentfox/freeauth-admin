import { Role } from '../role/type';
import { Organization, OrgType } from '../type';

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
  /** 用户直属组织：企业、部门 */
  departments?: Organization[];
  /** 用户关联角色 */
  roles?: Role[];
  /** 用户属于的组织类型 */
  org_type?: OrgType;
  /** 用户最后登录时间 */
  last_login_at?: Date;
  /** 用户创建时间 */
  created_at?: Date;
  /** 用户状态：true-禁用；false-正常 */
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
  organization_ids?: string;
  __root__?: string;
}
