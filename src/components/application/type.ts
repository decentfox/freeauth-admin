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
export interface Application {
  /** 应用 ID */
  id: string;
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
  /** 应用密钥 */
  secret_key?: string;
  /** 应用是否为预设应用 */
  is_protected?: boolean;
  /** 应用是否被禁用 */
  is_deleted?: boolean;
}

export interface ApplicationPostData {
  /** 应用名称 */
  name?: string;
  /** 应用描述 */
  description?: string;
}

export interface ApplicationPostError {
  name?: string;
}

export interface AppOperationsType {
  methods: {
    toggleApplicationsStatus: (
      applications: Application[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) => void;
    deleteApplications: (
      applications: Application[],
      handler?: (...args: [string]) => void
    ) => void;
    resetAppSecret: (appId: string) => void;
  };
}
