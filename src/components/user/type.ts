import { User } from 'pages/user/type';

export interface UserOperationsType {
  methods: {
    toggleUsersStatus: (
      users: User[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deleteUsers: (users: User[], handler?: (...args: [string]) => void) => void;
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
