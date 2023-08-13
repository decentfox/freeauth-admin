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
import { api } from 'boot/axios';
import { Dialog } from 'quasar';

import AppSecretFormDialog from 'components/application/AppSecretFormDialog.vue';

import { Application } from '../application/type';
import ConfirmDialog from '../dialog/ConfirmDialog.vue';

import { AppOperationsType } from './type';

export const AppOperationsMixin: AppOperationsType = {
  methods: {
    toggleApplicationsStatus(
      applications: Application[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) {
      const applicationDesc = `【${applications[0].name}】${
        applications.length > 1 ? `等 ${applications.length} 个应用` : ''
      }`;

      const content = isDeleted
        ? `您正在请求禁用${applicationDesc}。操作后，应用将无法从 FreeAuth 获取用户及权限等相关数据。`
        : `您正在请求启用${applicationDesc}。操作后，应用将重新获取 FreeAuth 获取用户及权限等相关数据。`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: isDeleted ? '禁用应用' : '启用应用',
          content: content,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: isDeleted ? '禁用' : '启用',
              actionType: 'toggle',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'toggle') {
          try {
            await api.put(
              '/applications/status',
              {
                ids: applications.map((a: Application) => a.id),
                is_deleted: isDeleted,
              },
              { successMsg: `${isDeleted ? '禁用' : '启用'}应用成功` }
            );
          } finally {
            if (handler) {
              handler(isDeleted ? 'disable' : 'enable');
            }
          }
        }
      });
    },

    deleteApplications(
      applications: Application[],
      handler?: (...args: [string]) => void
    ) {
      const applicationDesc = `【${applications[0].name}】${
        applications.length > 1 ? `等 ${applications.length} 个应用` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '删除应用',
          content: `您正在请求删除${applicationDesc}及所含权限。数据删除后将无法进行恢复，您确认要继续删除吗？`,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: '删除',
              actionType: 'delete',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'delete') {
          try {
            await api.request({
              method: 'DELETE',
              url: '/applications',
              data: { ids: applications.map((a: Application) => a.id) },
              successMsg: '删除应用成功',
            });
          } finally {
            if (handler) {
              handler('delete');
            }
          }
        }
      });
    },

    async resetAppSecret(appId: string) {
      const resp = await api.put(
        `/applications/${appId}/secret`,
        {},
        {
          successMsg: '应用密钥重置成功',
        }
      );
      const app = resp.data;
      Dialog.create({
        component: AppSecretFormDialog,
        componentProps: {
          appId: app.id,
          appSecret: app.secret,
        },
      });
    },
  },
};
