export interface OrgTypeOption {
  id: number;
  value: number;
  label: string;
  name: string;
}

export interface User {
  id: string;
  name?: string;
  mobile?: string;
  email?: string;
  username: string;
  depts?: string[];
  last_login_at?: Date;
  created_at?: Date;
  is_deleted: boolean;
}

export interface UserPostData {
  name?: string;
  mobile?: string;
  email?: string;
  username?: string;
}

export interface UserPostError {
  name?: string;
  mobile?: string;
  email?: string;
  username?: string;
  __root__?: string;
}

export interface Enterprise {
  id: number;
  name: string;
  taxId: string;
  bank: string;
  bankId: string;
  address: string;
  tel: string;
}

export interface OrgTreeStructure {
  label: string;
  id: number;
  icon?: string;
  children?: OrgTreeStructure[];
}
