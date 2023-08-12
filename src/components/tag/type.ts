/*
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
*/
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
