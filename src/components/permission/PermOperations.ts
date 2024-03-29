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

import ConfirmDialog from '../dialog/ConfirmDialog.vue';
import { Role } from '../role/type';

import { Permission, PermOperationsType } from './type';

export const PermOperationsMixin: PermOperationsType = {
  methods: {
    togglePermissionsStatus(
      permissions: Permission[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) {
      const permissionDesc = `【${permissions[0].name}】${
        permissions.length > 1 ? `等 ${permissions.length} 个权限` : ''
      }`;
      const content = isDeleted
        ? `您正在请求禁用${permissionDesc}。操作后，该权限对应资源将无法被外界所获取，即使是已经关联了该权限的主体。`
        : `您正在请求启用${permissionDesc}。操作后，拥有该权限的主体将重新获取该权限所对应的资源。`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: isDeleted ? '禁用权限' : '启用权限',
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
              '/permissions/status',
              {
                ids: permissions.map((p: Permission) => p.id),
                is_deleted: isDeleted,
              },
              { successMsg: `${isDeleted ? '禁用' : '启用'}权限成功` }
            );
          } finally {
            if (handler) {
              handler(isDeleted ? 'disable' : 'enable');
            }
          }
        }
      });
    },

    deletePermissions(
      permissions: Permission[],
      handler?: (...args: [string]) => void
    ) {
      const permissionDesc = `【${permissions[0].name}】${
        permissions.length > 1 ? `等 ${permissions.length} 个权限` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '删除权限',
          content: `您正在请求删除${permissionDesc}。数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
              url: '/permissions',
              data: { ids: permissions.map((u: Permission) => u.id) },
              successMsg: '删除权限成功',
            });
          } finally {
            if (handler) {
              handler('delete');
            }
          }
        }
      });
    },

    unbindRoles(
      permission: Permission,
      roles: Role[],
      handler?: (...args: [string]) => void
    ) {
      const roleDesc = `【${roles[0].name}】${
        roles.length > 1 ? `等 ${roles.length} 个角色` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '移除角色',
          content: `您正在请求解除角色${roleDesc}与当前权限的关联，该操作不会影响角色与其他权限的关联。`,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: '解除关系',
              actionType: 'unbind',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'unbind') {
          try {
            await api.request({
              method: 'POST',
              url: '/permissions/unbind_roles',
              data: {
                role_ids: roles.map((r: Role) => r.id),
                permission_ids: [permission.id],
              },
              successMsg: '移除角色成功',
            });
          } finally {
            if (handler) {
              handler('unbind');
            }
          }
        }
      });
    },
  },
};
