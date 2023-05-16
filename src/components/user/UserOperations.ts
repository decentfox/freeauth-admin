import { api } from 'boot/axios';
import { Dialog } from 'quasar';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import { User } from 'pages/user/type';

import { UserOperationsType } from './type';

export const UserOperationsMixin: UserOperationsType = {
  methods: {
    toggleUsersStatus(
      users: User[],
      isDeleted: boolean,
      handler?: (...args: [string]) => void
    ) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;
      const content = isDeleted
        ? `您正在请求禁用用户${userDesc}。操作后，该用户将无法登录系统及重置密码，但您仍可在后台对该账号进行编辑及重新启用。`
        : `您正在请求启用用户${userDesc}。操作后，账号状态将恢复正常，用户可以重新登录系统。`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: isDeleted ? '禁用用户' : '恢复用户',
          content: content,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: isDeleted ? '禁用' : '恢复',
              actionType: 'toggle',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (type === 'toggle') {
          try {
            await api.put(
              '/users/status',
              {
                user_ids: users.map((u: User) => u.id),
                is_deleted: isDeleted,
              },
              { successMsg: `${isDeleted ? '禁用' : '启用'}用户成功` }
            );
          } finally {
            if (handler) {
              handler(isDeleted ? 'disable' : 'enable');
            }
          }
        }
      });
    },

    deleteUsers(users: User[], handler?: (...args: [string]) => void) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '删除用户',
          content: `您正在请求删除用户${userDesc}。数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
              url: '/users',
              data: { user_ids: users.map((u: User) => u.id) },
              successMsg: '删除用户成功',
            });
          } finally {
            if (handler) {
              handler('delete');
            }
          }
        }
      });
    },

    resignUsers(users: User[], handler?: (...args: [string]) => void) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;

      Dialog.create({
        component: ConfirmDialog,
        componentProps: {
          title: '办理离职',
          content: `您正在请求为成员${userDesc}办理离职。操作后，该成员授权、组织部门和角色等关系将被删除，转为普通用户。如需同时禁用该用户，请点击【离职并禁用】。
`,
          buttons: [
            { label: '取消', class: 'secondary-btn' },
            {
              label: '离职',
              actionType: 'resign',
              class: 'accent-btn',
            },
            {
              label: '离职并禁用',
              actionType: 'resign_disable',
              class: 'accent-btn',
            },
          ],
        },
      }).onOk(async ({ type }) => {
        if (['resign', 'resign_disable'].indexOf(type) >= 0) {
          let postData = {};
          if (type === 'resign') {
            postData = { user_ids: users.map((u: User) => u.id) };
          } else if (type === 'resign_disable') {
            postData = {
              user_ids: users.map((u: User) => u.id),
              is_deleted: true,
            };
          }
          try {
            await api.request({
              method: 'POST',
              url: '/users/resign',
              data: postData,
              successMsg: '离职办理成功',
            });
          } finally {
            if (handler) {
              handler('resign');
            }
          }
        }
      });
    },
  },
};
