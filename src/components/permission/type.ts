import { Permission } from 'pages/permission/type';

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
  };
}
