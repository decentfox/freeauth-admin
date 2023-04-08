export interface MainMenu {
  /** 主菜单标题 */
  header: string;
  /** 主菜单图标名称 */
  icon: string;
  /** 包含的子菜单 */
  links: MainMenuLink[];
}

export interface MainMenuLink {
  /** 菜单标题 */
  title: string;
  /** 菜单链接，可空 */
  link?: string;
}
