export interface Tag {
  /** 标签 ID */
  id: string;
  /** 标签名称 */
  name: string;
}

export interface TagManagementComponent {
  /** 唤醒设置角色对话框 */
  show: () => void;
}

export interface TagUpdateData {
  id?: string;
  name?: string;
}

export interface TagUpdateError {
  name?: string;
}
