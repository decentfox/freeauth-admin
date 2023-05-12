<template>
  <slot name="actions"> </slot>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { User } from 'src/pages/type';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';

export default defineComponent({
  name: 'UserOperations',

  components: {},

  emits: ['refresh'],

  setup() {
    return {};
  },

  methods: {
    toggleUsersStatus(users: User[], isDeleted: boolean) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;
      const content = isDeleted
        ? `您正在请求禁用用户${userDesc}。操作后，该用户将无法登录系统及重置密码，但您仍可在后台对该账号进行编辑及重新启用。`
        : `您正在请求启用用户${userDesc}。操作后，账号状态将恢复正常，用户可以重新登录系统。`;

      this.$q
        .dialog({
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
        })
        .onOk(async ({ type }) => {
          if (type === 'toggle') {
            try {
              await this.$api.put(
                '/users/status',
                {
                  user_ids: users.map((u: User) => u.id),
                  is_deleted: isDeleted,
                },
                { successMsg: `${isDeleted ? '禁用' : '启用'}用户成功` }
              );
            } finally {
              this.$emit('refresh', { type: isDeleted ? 'disable' : 'enable' });
            }
          }
        });
    },

    deleteUsers(users: User[]) {
      const userDesc = `【${users[0].name}】${
        users.length > 1 ? `等 ${users.length} 人` : ''
      }`;

      this.$q
        .dialog({
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
        })
        .onOk(async ({ type }) => {
          if (type === 'delete') {
            const userIds: string[] = users.map((u: User) => u.id);
            try {
              await this.$api.request({
                method: 'DELETE',
                url: '/users',
                data: { user_ids: userIds },
                successMsg: '删除用户成功',
              });
            } finally {
              this.$emit('refresh', { type: 'delete' });
            }
          }
        });
    },
  },
});
</script>
