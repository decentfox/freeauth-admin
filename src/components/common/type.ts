export interface MainMenuSection {
  /** 主菜单分组标题 */
  header: string;
  /** 包含的菜单链接 */
  links: MainMenuLink[];
}

export interface MainMenuLink {
  /** 菜单标题 */
  title: string;
  /** 菜单图标名称 */
  icon: string;
  /** 菜单链接，可空 */
  link?: string;
  /** 菜单权限配置 */
  requiredPerms?: string[];
}

export interface MenuButton {
  /** 菜单按钮文案 */
  label?: string;
  /** 菜单按钮图标 */
  icon?: string;
  /** 菜单按钮触发事件类型 */
  actionType: string;
  /** 菜单按钮是否禁用 */
  disable?: boolean;
  /** 禁用按钮提示信息 */
  disableHint?: string;
}

export interface ChipGroupItem {
  id: string;
  name: string;
}
