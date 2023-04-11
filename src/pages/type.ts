export interface OrgType {
  id: number;
  value: number;
  label: string;
}

export interface User {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
  username: string;
  status: boolean;
}
