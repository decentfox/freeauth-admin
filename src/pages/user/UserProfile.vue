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
            label: '重置密码',
            icon: 'delete_outline',
            actionType: 'delete',
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
      <q-tab-panel name="user">
        <q-card flat bordered class="q-pa-md">
          <q-form>
            <div class="q-col-gutter-md q-pa-sm">
              <div>
                <field-label name="姓名（昵称）" required />
                <q-input
                  v-model="userFormData.name"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!userFormError.name"
                  :error-message="userFormError.name"
                />
              </div>
              <div>
                <field-label
                  name="用户名"
                  required
                  hint="可用于用户名密码登录"
                />
                <q-input
                  v-model="userFormData.username"
                  filled
                  dense
                  placeholder="请填写用户姓名"
                  hide-bottom-space
                  :error="!!userFormError.username"
                  :error-message="userFormError.username"
                />
              </div>
              <div>
                <field-label name="手机号码" hint="可用于手机号验证码登录" />
                <q-input
                  v-model="userFormData.mobile"
                  filled
                  dense
                  placeholder="请填写手机号"
                  hide-bottom-space
                  class="col"
                  :error="!!userFormError.mobile"
                  :error-message="userFormError.mobile"
                />
              </div>
              <div>
                <field-label name="邮箱地址" hint="可用于邮箱验证码登录" />
                <q-input
                  v-model="userFormData.email"
                  filled
                  dense
                  placeholder="请填写邮箱"
                  hide-bottom-space
                  class="col"
                  :error="!!userFormError.email"
                  :error-message="userFormError.email"
                />
              </div>
            </div>
            <q-card-actions>
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="saveUserForm"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="organizations">
        <q-table
          flat
          hide-pagination
          :rows="user.departments"
          :columns="deptColumns"
        />
      </q-tab-panel>
      <q-tab-panel name="roles">
        <q-table
          flat
          hide-pagination
          :rows="user.roles"
          :columns="roleColumns"
        />
      </q-tab-panel>
      <q-tab-panel name="perms"> TODO </q-tab-panel>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { User, UserPostData, UserPostError } from 'pages/type';
import { QTableProps } from 'quasar';
import ProfilePage from 'src/layouts/ProfilePage.vue';

import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';

const roleColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'actions',
    label: '操作',
    align: 'left',
    field: 'actions',
  },
];

const deptColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'actions',
    label: '操作',
    align: 'left',
    field: 'actions',
  },
];

export default defineComponent({
  name: 'UserProfile',

  components: { DropdownButton, FieldLabel, ProfilePage },

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
      roleColumns: roleColumns,
      deptColumns: deptColumns,

      userForm: ref(false),
      userFormData: ref<UserPostData>({}),
      userFormError: ref<UserPostError>({}),
    };
  },

  mounted() {
    this.loadUserInfo();
  },

  methods: {
    async loadUserInfo() {
      const resp = await this.$api.get(`/users/${this.userId}`);
      this.user = resp.data;
      this.userFormData = Object.assign({}, resp.data);
      console.error(this.user);
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

    async saveUserForm() {
      if (JSON.stringify(this.user) === JSON.stringify(this.userFormData))
        return;
      try {
        this.userFormError = {};
        const resp = await this.$api.put(
          `/users/${this.user.id}`,
          this.userFormData,
          {
            successMsg: '角色更新成功',
          }
        );
        this.user = resp.data;
        this.userFormData = Object.assign({}, resp.data);
        this.userFormError = {};
      } catch (e) {
        this.userFormError = (e as Error).cause || {};
      }
    },
  },
});
</script>
