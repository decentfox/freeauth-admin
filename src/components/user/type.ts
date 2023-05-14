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
