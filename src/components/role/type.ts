import { User } from 'src/pages/user/type';

import { Role } from 'pages/role/type';

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
