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
}
