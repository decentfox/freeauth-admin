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
    :name="role.name"
    :status="!role.is_deleted"
    :tabs="[
      { name: 'role', label: '基本信息' },
      { name: 'users', label: '关联主体' },
      { name: 'perms', label: '配置权限' },
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
            label: !role.is_deleted ? '禁用角色' : '启用角色',
            icon: !role.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !role.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除角色',
            icon: 'delete_outline',
            actionType: 'delete',
          },
        ]"
        @disable="toggleRolesStatus([role], true, refreshRoleData)"
        @enable="toggleRolesStatus([role], false, refreshRoleData)"
        @delete="deleteRoles([role], refreshRoleData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="role">
        <role-form
          ref="updateRoleForm"
          :role="role"
          :action="FormAction.update"
          @refresh="loadRoleInfo"
        />
      </q-tab-panel>
      <q-tab-panel name="users">
        <data-table
          ref="userTable"
          :columns="userColumns"
          sticky-action-column
          search-placeholder="搜索用户信息"
          hide-filter
          hide-import
          hide-export
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="添加主体"
              class="q-ml-sm q-px-md primary-btn"
              @click="bindUsersForm = true"
            />
          </template>
          <template #body-cell-departments="props">
            <q-td :props="props">
              <chip-group :chips="props.row.departments" square />
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
                    label: '移除主体',
                    icon: 'person_remove',
                    actionType: 'unbind',
                  },
                ]"
                @click.stop
                @unbind="unbindUsers(role, [props.row], refreshRoleData)"
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="perms">
        <div v-if="applicationChips.length" class="q-pa-sm row items-center">
          <div class="text-caption">应用：</div>
          <q-scroll-area
            :thumb-style="thumbStyle"
            style="height: 32px; width: calc(100% - 40px)"
          >
            <div class="row no-wrap q-gutter-col-xs">
              <chip-group
                :chips="(applicationChips as ChipGroupItem[])"
                icon="wysiwyg"
                clickable
                square
                @selected-change="filterByApp"
              />
            </div>
          </q-scroll-area>
        </div>
        <div v-if="tagChips.length" class="q-pa-sm q-pb-md row">
          <div class="text-caption q-py-xs">标签：</div>
          <div class="q-gutter-col-xs" style="width: calc(100% - 40px)">
            <chip-group
              :chips="tagChips"
              icon="local_offer"
              clickable
              selection="multiple"
              @selected-change="filterByTags"
            />
          </div>
        </div>

        <data-table
          ref="permissionTable"
          api-method="GET"
          api-url="/permissions"
          :columns="permColumns"
          search-placeholder="搜索权限信息"
          hide-import
          hide-export
        >
          <template #extra-filters>
            <q-checkbox
              v-model="linkedPermCheck"
              label="仅展示已关联该角色的权限"
              @update:model-value="filterByRole"
            />
          </template>
          <template #body-cell-linked="props">
            <q-td :props="props">
              <q-checkbox
                :model-value="
                  props.row.roles.map((r:Role) => r.id).includes(role.id)
                "
                :disable="props.row.code === '*' && props.row.application.is_protected && props.row.roles.map((r:Role) => r.id).includes(role.id)"
                @update:model-value="(val: boolean) => toggleLinked(val, props.row)"
              />
              <q-tooltip
                v-if="props.row.code === '*' && props.row.application.is_protected && props.row.roles.map((r:Role) => r.id).includes(role.id)"
              >
                不支持解除通配符权限与预设应用 FreeAuth 系统管理员的关系
              </q-tooltip>
            </q-td>
          </template>
          <template #body-cell-tags="props">
            <q-td :props="props">
              <chip-group :chips="props.row.tags" icon="local_offer" />
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
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <form-dialog
        ref="bindUsersDialog"
        v-model="bindUsersForm"
        title="添加主体"
        width="450px"
        @confirm="saveBindUsersForm"
        @close="resetBindUsersForm"
      >
        <template #form-content>
          <div class="q-gutter-md q-pa-md">
            <div>
              <field-label text="关联主体" required />
              <searchable-multiple-select
                v-model="selectedUsers"
                placeholder="输入用户信息进行搜索"
                option-api-url="/users/query"
                :option-api-params="{
                  org_type_id: role.org_type?.id,
                  include_unassigned_users: !!role.org_type ? false : true,
                }"
              />
              <div
                v-if="!!bindUsersFormError.user_ids"
                class="error-hint text-negative"
              >
                {{ bindUsersFormError.user_ids }}
              </div>
            </div>
            <div v-if="!!role.org_type" class="text-caption hint-label">
              提示：该角色为组织类型【{{
                role.org_type.name
              }}】角色，因此只能搜索到【{{
                role.org_type.name
              }}】下的用户进行关联。如未搜索到目标用户，请先检查其组织归属。
            </div>
          </div>
        </template>
      </form-dialog>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps, VueStyleObjectProp } from 'quasar';

import { Application } from 'components/application/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChipGroupItem } from 'components/common/type';
import { FormDialogComponent } from 'components/dialog/type';
import { FormAction } from 'components/form/type';
import { Permission } from 'components/permission/type';
import { RoleOperationsMixin } from 'components/role/RoleOperations';
import {
  BindUsersToRolesPostData,
  BindUsersToRolesPostError,
  Role,
} from 'components/role/type';
import { DataTableComponent } from 'components/table/type';
import { Tag } from 'components/tag/type';
import { User } from 'components/user/type';

const userColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
  },
  {
    name: 'departments',
    label: '直属组织',
    align: 'left',
    field: 'departments',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'left',
    field: 'is_deleted',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'left',
    field: 'actions',
  },
];

const permColumns: QTableProps['columns'] = [
  {
    name: 'linked',
    label: '关联',
    align: 'left',
    field: 'linked',
  },
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
    name: 'application',
    label: '所属应用',
    align: 'left',
    field: 'application',
  },
  {
    name: 'is_deleted',
    label: '状态',
    align: 'left',
    field: 'is_deleted',
  },
];

export default defineComponent({
  name: 'RoleProfile',

  mixins: [RoleOperationsMixin],

  props: {
    roleId: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: 'role',
    },
  },

  setup() {
    return {
      role: ref<Role>({
        id: '',
      }),
      panelTab: ref('role'),
      userColumns: userColumns,
      permColumns: permColumns,
      FormAction,

      bindUsersForm: ref(false),
      selectedUsers: ref<User[]>([]),
      bindUsersFormData: ref<BindUsersToRolesPostData>({}),
      bindUsersFormError: ref<BindUsersToRolesPostError>({}),

      linkedPermCheck: ref(false),
      applicationChips: ref<Application[]>([]),
      tagChips: ref<Tag[]>([]),

      thumbStyle: ref<VueStyleObjectProp>({
        right: '2px',
        borderRadius: '2px',
        backgroundColor: '#f2f2f2',
        height: '2px',
        opacity: '0.75',
      }),
    };
  },

  mounted() {
    this.panelTab = this.tab ? this.tab : this.panelTab;
    this.loadRoleInfo();
  },

  methods: {
    async loadRoleInfo() {
      const resp = await this.$api.get(`/roles/${this.roleId}`, {
        showProgress: true,
      });
      this.role = resp.data;
    },

    switchPanelTab(val: string) {
      if (val === 'users') {
        setTimeout(() => {
          const et = this.$refs.userTable as DataTableComponent;
          et.setApiInfo(`/roles/${this.role.id}/users`, 'POST');
          et.fetchRows();
        }, 20);
      } else if (val === 'perms') {
        this.loadApplicationOptions();
        this.loadTagOptions();
      }
    },

    async loadApplicationOptions() {
      const resp = await this.$api.get('/applications/options');
      this.applicationChips = resp.data;
    },

    async loadTagOptions() {
      const resp = await this.$api.get('/permission_tags');
      this.tagChips = resp.data.permission_tags;
    },

    async saveBindUsersForm() {
      this.bindUsersFormData.user_ids = this.selectedUsers
        ? this.selectedUsers.map((user) => user.id)
        : [];
      this.bindUsersFormData.role_ids = [this.role.id];
      try {
        this.bindUsersFormError = {};
        await this.$api.post('/roles/bind_users', this.bindUsersFormData, {
          successMsg: '主体添加成功',
        });
        (this.$refs.bindUsersDialog as FormDialogComponent).hide();
        (this.$refs.userTable as DataTableComponent).fetchRows();
        this.loadRoleInfo();
        this.resetBindUsersForm();
      } catch (e) {
        this.bindUsersFormError = (e as Error).cause || {};
      }
    },

    resetBindUsersForm() {
      this.bindUsersFormData = {};
      this.bindUsersFormError = {};
      this.selectedUsers = [];
    },

    refreshRoleData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadRoleInfo();
      } else if (op === 'delete') {
        this.$router.back();
      } else if (op === 'unbind') {
        this.loadRoleInfo();
        (this.$refs.userTable as DataTableComponent).fetchRows();
      }
    },

    filterByRole(ticked: boolean) {
      const pt = this.$refs.permissionTable as DataTableComponent;
      if (ticked) {
        pt.onExternalFiltered('role_id', this.role.id);
      } else {
        pt.removeExternalFilter('role_id');
      }
    },

    filterByApp(selected: string[]) {
      const pt = this.$refs.permissionTable as DataTableComponent;
      if (selected.length !== 0) {
        pt.onExternalFiltered('application_id', selected[0]);
      } else {
        pt.removeExternalFilter('application_id');
      }
    },

    filterByTags(selected: string[]) {
      const pt = this.$refs.permissionTable as DataTableComponent;
      if (selected.length !== 0) {
        pt.onExternalFiltered('tag_ids', selected);
      } else {
        pt.removeExternalFilter('tag_ids');
      }
    },

    async toggleLinked(ticked: boolean, permission: Permission) {
      try {
        await this.$api.post(
          ticked ? '/permissions/bind_roles' : '/permissions/unbind_roles',
          { role_ids: [this.role.id], permission_ids: [permission.id] },
          {
            successMsg: ticked ? '关联成功' : '移除成功',
          }
        );
        if (ticked && permission.code !== '*') {
          const pt = this.$refs.permissionTable as DataTableComponent;
          if (
            (pt.rows as Permission[]).filter(
              (perm: Permission) =>
                perm.code === '*' &&
                perm.application?.id === permission.application?.id &&
                perm.roles &&
                perm.roles.filter((role: Role) => role.id === this.role.id)
                  .length > 0
            ).length > 0
          ) {
            this.$q.dialog({
              title: '温馨提示',
              message:
                '该角色已拥有应用程序中的最高权限，即“通配符权限”，故无需再配置其他权限',
            });
          }
        }
      } finally {
        const pt = this.$refs.permissionTable as DataTableComponent;
        pt.fetchRows();
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
