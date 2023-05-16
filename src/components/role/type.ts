import { Role } from 'pages/role/type';
import { User } from 'pages/user/type';

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
