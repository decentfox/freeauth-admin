export interface OrgType {
  id: number;
  value: number;
  label: string;
}

export interface User {
  id: string;
  name?: string;
  mobile?: string;
  email?: string;
  username: string;
  last_login_at?: Date;
  created_at: Date;
  is_deleted: boolean;
}
