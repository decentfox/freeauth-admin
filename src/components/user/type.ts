import { User } from 'src/pages/type';

export interface UserMethods {
  toggleUsersStatus: (users: User[], isDeleted: boolean) => void;
  deleteUsers: (users: User[]) => void;
}
