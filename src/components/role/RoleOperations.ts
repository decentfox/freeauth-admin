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
import { User } from '../user/type';

import { Role, RoleOperationsType } from './type';

export const RoleOperationsMixin: RoleOperationsType = {
  methods: {
    toggleRolesStatus(
      roles: Role[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) {
      const roleDesc = `【${roles[0].name}】${
        roles.length > 1 ? `等 ${roles.length} 个角色` : ''
      }`;
      const content = isDeleted
        ? `您正在请求禁用${roleDesc}。操作后，角色主体（关联用户）将不再具有角色关联的资源权限，但不会改变角色与角色主体的关联关系。`
        : `您正在请求启用${roleDesc}。操作后，角色主体（关联用户）将重新获得角色关联的资源权限。`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: isDeleted ? '禁用角色' : '启用角色',
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
              '/roles/status',
              { ids: roles.map((r: Role) => r.id), is_deleted: isDeleted },
              { successMsg: `${isDeleted ? '禁用' : '启用'}角色成功` }
            );
          } finally {
            if (handler) {
              handler(isDeleted ? 'disable' : 'enable');
            }
          }
        }
      });
    },

    deleteRoles(roles: Role[], handler?: (...args: [string]) => void) {
      const roleDesc = `【${roles[0].name}】${
        roles.length > 1 ? `等 ${roles.length} 个角色` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '删除角色',
          content: `您正在请求删除${roleDesc}。数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
              url: '/roles',
              data: { ids: roles.map((u: Role) => u.id) },
              successMsg: '删除角色成功',
            });
          } finally {
            if (handler) {
              handler('delete');
            }
          }
        }
      });
    },

    unbindUsers(
      role: Role,
      users: User[],
      handler?: (...args: [string]) => void
    ) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '移除用户',
          content: `您正在请求解除用户${userDesc}与当前角色的关联，该操作不会影响用户与其他角色的关联。`,
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
              url: '/roles/unbind_users',
              data: {
                user_ids: users.map((u: User) => u.id),
                role_ids: [role.id],
              },
              successMsg: '移除用户成功',
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
