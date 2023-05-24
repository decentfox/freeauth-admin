import { Permission } from 'pages/permission/type';
import { Role } from 'pages/role/type';

export interface PermOperationsType {
  methods: {
    togglePermissionsStatus: (
      permissions: Permission[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deletePermissions: (
      permissions: Permission[],
      handler?: (...args: [string]) => void
    ) => void;
    unbindRoles: (
      permission: Permission,
      roles: Role[],
      handler?: (...args: [string]) => void
    ) => void;
  };
}

export enum FormAction {
  create = 'create',
  update = 'update',
}
