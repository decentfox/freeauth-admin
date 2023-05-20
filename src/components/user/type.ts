import { Role } from 'pages/role/type';
import { Organization } from 'pages/type';
import { User } from 'pages/user/type';

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
