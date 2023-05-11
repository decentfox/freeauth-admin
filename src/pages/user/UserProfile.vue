<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="`${user.name}（${user.username}）`"
    :status="!user.is_deleted"
    :tabs="[
      { name: 'user', label: '基本信息' },
      { name: 'organizations', label: '组织归属' },
      { name: 'roles', label: '配置角色' },
      { name: 'perms', label: '权限信息' },
    ]"
  >
    <template #toolbar-right>
      <dropdown-button
        btn-label="更多操作"
        btn-icon="expand_more"
        btn-class="q-px-md secondary-btn"
        :buttons="[
          {
            label: !user.is_deleted ? '禁用账号' : '启用账号',
            icon: !user.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !user.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除账号',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @menu-click="operateOneUser($event, user)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="user"></q-tab-panel>
      <q-tab-panel name="organizations"></q-tab-panel>
      <q-tab-panel name="roles"></q-tab-panel>
      <q-tab-panel name="perms"></q-tab-panel>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { User } from 'pages/type';
import ProfilePage from 'src/layouts/ProfilePage.vue';

import DropdownButton from 'components/DropdownButton.vue';

export default defineComponent({
  name: 'UserProfile',

  components: { DropdownButton, ProfilePage },

  props: {
    userId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {
      user: ref<User>({
        id: '',
      }),
      panelTab: ref('user'),
    };
  },

  mounted() {
    this.loadUserInfo();
  },

  methods: {
    async loadUserInfo() {
      const resp = await this.$api.get(`/users/${this.userId}`);
      this.user = resp.data;
      //this.userFormData = Object.assign({}, resp.data);
    },

    switchPanelTab(val: string) {
      if (val === 'roles') {
      }
    },

    operateOneUser(evt: Event, user: User) {
      console.error(user);
      if (evt.type === 'disable') {
        //this.toggleUsers([user], true);
      } else if (evt.type === 'enable') {
        //this.toggleUsers([user], false);
      } else if (evt.type === 'delete') {
        //this.deleteUsers([user]);
      }
    },
  },
});
</script>
