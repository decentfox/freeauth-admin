import { Organization, OrgType } from '../organization/type';
import { Role } from '../role/type';

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
  /** 用户所拥有的权限（代码） */
  perms?: string[];
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
  /** 是否强制用户在首次登录时修改密码  */
  reset_pwd_on_first_login?: boolean;
  /** 是否通过邮件发送初始默认登录信息  */
  send_first_login_email?: boolean;
}

export interface UserPostError {
  name?: string;
  mobile?: string;
  email?: string;
  username?: string;
  organization_ids?: string;
  __root__?: string;
}

export interface UserOperationsType {
  methods: {
    toggleUsersStatus: (
      users: User[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deleteUsers: (users: User[], handler?: (...args: [string]) => void) => void;
    resignUsers: (users: User[], handler?: (...args: [string]) => void) => void;
    unbindRoles: (
      user: User,
      roles: Role[],
      handler?: (...args: [string]) => void
    ) => void;
    unbindOrgs: (
      user: User,
      organizations: Organization[],
      handler?: (...args: [string]) => void
    ) => void;
    resetUserPassword: (userId: string) => void;
  };
}

export interface SetRolesComponent {
  /** 唤醒设置角色对话框 */
  show: (user: User) => void;
}

export interface SetRolesPostData {
  /** 用户的 ID */
  user_id?: string;
  /** 角色的 ID */
  role_ids?: string[];
}

export interface SetRolesPostError {
  user_id?: string;
  role_ids?: string;
}

export interface SetOrganizationsComponent {
  /** 唤醒设置组织对话框 */
  show: (user: User) => void;
}

export interface SetOrganizationsPostData {
  /** 用户的 ID */
  user_id?: string;
  /** 多个组织的 ID 集合 */
  organization_ids?: string[];
  /** 组织类型 ID */
  org_type_id?: string;
}

export interface SetOrganizationsPostError {
  user_id?: string;
  organization_ids?: string;
}
