<!--
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
-->
<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="`${user.name}（${user.username}）`"
    :status="!user.is_deleted"
    :tabs="[
      { name: 'user', label: '基本信息' },
      { name: 'organizations', label: '组织归属' },
      { name: 'roles', label: '角色信息' },
      { name: 'perms', label: '权限信息' },
    ]"
    @update:tab-value="switchPanelTab"
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
            disable: user.id === currentUser.id && !user.is_deleted,
            disableHint: '该账号为您当前登录正在使用账号',
          },
          {
            label: '重置密码',
            icon: 'restart_alt',
            actionType: 'reset',
            disable: !user.email,
            disableHint: '新密码以邮件形式进行发送，请先补充邮箱信息',
          },
          {
            label: '删除账号',
            icon: 'delete_outline',
            actionType: 'delete',
            disable: user.id === currentUser.id,
            disableHint: '该账号为您当前登录正在使用账号',
          },
        ]"
        @disable="toggleUsersStatus([user], true, refreshUserData)"
        @enable="toggleUsersStatus([user], false, refreshUserData)"
        @reset="resetUserPassword(user.id)"
        @delete="deleteUsers([user], refreshUserData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="user">
        <user-form
          ref="updateUserForm"
          :user="user"
          :action="FormAction.update"
          @refresh="loadUserInfo"
        />
      </q-tab-panel>
      <q-tab-panel name="organizations">
        <q-table
          flat
          wrap-cells
          hide-pagination
          :rows="user.departments"
          :columns="deptColumns"
        >
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <chip-group :chips="[props.row.org_type]" square />
            </q-td>
          </template>
          <template #body-cell-enterprise="props">
            <q-td :props="props">
              <chip-group
                :chips="
                  props.row.enterprise ? [props.row.enterprise] : [props.row]
                "
                square
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <dropdown-button
                :buttons="[
                  {
                    label: '移出组织',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindOrgs(user, [props.row], refreshUserData)"
              />
            </q-td>
          </template>
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </q-table>
        <q-toolbar class="q-my-md q-gutter-sm">
          <q-btn
            unelevated
            dense
            :label="user.departments?.length !== 0 ? '变更组织' : '加入组织'"
            class="q-px-sm primary-btn"
            @click="openSetOrganizationsForm"
          />
          <q-btn
            v-if="user.departments?.length !== 0"
            unelevated
            dense
            label="办理离职"
            class="q-px-sm primary-btn"
            @click="resignUsers([user], refreshUserData)"
          />
        </q-toolbar>
      </q-tab-panel>
      <q-tab-panel name="roles">
        <q-table
          flat
          wrap-cells
          hide-pagination
          :rows="user.roles"
          :columns="roleColumns"
        >
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <chip-group
                :chips="props.row.org_type ? [props.row.org_type] : []"
                square
              />
            </q-td>
          </template>
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <boolean-chip
                :value="!props.row.is_deleted"
                true-label="正常"
                false-label="禁用"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <dropdown-button
                :buttons="[
                  {
                    label: '移除角色',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindRoles(user, [props.row], refreshUserData)"
              />
            </q-td>
          </template>
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </q-table>
        <q-toolbar class="q-my-md q-gutter-sm">
          <q-btn
            unelevated
            dense
            label="配置角色"
            class="q-px-sm primary-btn"
            @click="openSetRolesForm"
          />
        </q-toolbar>
      </q-tab-panel>
      <q-tab-panel name="perms">
        <data-table
          ref="permTable"
          :columns="permColumns"
          sticky-action-column
          search-placeholder="搜索权限信息"
          hide-filter
          hide-import
          hide-export
        >
          <template #body-cell-tags="props">
            <q-td :props="props">
              <chip-group :chips="props.row.tags" icon="local_offer" />
            </q-td>
          </template>
          <template #body-cell-roles="props">
            <q-td :props="props">
              <div class="row">
                <chip-group :chips="props.row.roles" square />
              </div>
            </q-td>
          </template>
          <template #body-cell-application="props">
            <q-td :props="props">
              <chip-group :chips="[props.row.application]" square />
            </q-td>
          </template>
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <boolean-chip
                :value="!props.row.is_deleted"
                true-label="正常"
                false-label="禁用"
              />
            </q-td>
          </template>
          <template #no-data="{ icon, message }">
            <div class="full-width row flex-center q-gutter-sm text-grey-6">
              <q-icon :name="icon" />
              <span>
                {{ message }}
              </span>
            </div>
          </template>
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <set-orgs-form ref="setOrganizationsForm" @user-updated="loadUserInfo" />
      <set-roles-form ref="setRolesForm" @user-updated="loadUserInfo" />
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapState } from 'pinia';
import { QTableProps } from 'quasar';

import { FormAction } from 'components/form/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DataTableComponent } from 'components/table/type';
import {
  SetOrganizationsComponent,
  SetRolesComponent,
  User,
} from 'components/user/type';
import { UserOperationsMixin } from 'components/user/UserOperations';
import { authStore } from 'stores/auth-store';

const roleColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '角色名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '角色代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'description',
    label: '角色描述',
    align: 'left',
    field: 'description',
    style: 'max-width: 400px',
    headerStyle: 'max-width: 400px',
  },
  {
    name: 'org_type',
    label: '组织类型归属',
    align: 'left',
    field: 'org_type',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'center',
    field: 'is_deleted',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

const deptColumns: QTableProps['columns'] = [
  {
    name: 'org_type',
    label: '组织类型归属',
    align: 'left',
    field: 'org_type',
  },
  {
    name: 'enterprise',
    label: '企业归属',
    align: 'left',
    field: 'enterprise',
  },
  {
    name: 'name',
    label: '直属组织名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '直属组织代码',
    align: 'left',
    field: (row) => (row.code ? row.code : '-'),
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

const permColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '权限名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'code',
    label: '权限代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'tags',
    label: '标签',
    align: 'left',
    field: 'tags',
  },
  {
    name: 'roles',
    label: '关联角色',
    align: 'left',
    field: 'roles',
  },
  {
    name: 'application',
    label: '所属应用',
    align: 'left',
    field: 'application',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'center',
    field: 'is_deleted',
    sortable: true,
  },
];

export default defineComponent({
  name: 'UserProfile',

  mixins: [UserOperationsMixin],

  props: {
    userId: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: 'user',
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
      permColumns: permColumns,
      FormAction,
    };
  },

  computed: {
    ...mapState(authStore, ['currentUser']),
  },

  mounted() {
    this.panelTab = this.tab ? this.tab : this.panelTab;
    this.loadUserInfo();
  },

  methods: {
    async loadUserInfo() {
      const resp = await this.$api.get(`/users/${this.userId}`, {
        showProgress: true,
      });
      this.user = resp.data;
    },

    switchPanelTab(val: string) {
      if (val === 'perms') {
        setTimeout(() => {
          const et = this.$refs.permTable as DataTableComponent;
          et.setApiInfo(`/users/${this.user.id}/permissions`, 'POST');
          et.fetchRows();
        }, 20);
      }
    },

    refreshUserData(op: string) {
      if (['disable', 'enable', 'resign', 'unbind'].includes(op)) {
        this.loadUserInfo();
      } else if (op === 'delete') {
        this.$router.back();
      }
    },

    openSetRolesForm() {
      (this.$refs.setRolesForm as SetRolesComponent).show(this.user);
    },

    openSetOrganizationsForm() {
      (this.$refs.setOrganizationsForm as SetOrganizationsComponent).show(
        this.user
      );
    },
  },
});
</script>
