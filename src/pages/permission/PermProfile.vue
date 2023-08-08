<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="permission.name"
    :status="!permission.is_deleted"
    :tabs="[
      { name: 'perm', label: '基本信息' },
      { name: 'roles', label: '关联角色' },
      { name: 'users', label: '用户列表' },
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
            label: !permission.is_deleted ? '禁用权限' : '启用权限',
            icon: !permission.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !permission.is_deleted ? 'disable' : 'enable',
            disable: permission.code === '*',
            disableHint: '系统内置通配符权限，不支持禁用',
          },

          {
            label: '删除权限',
            icon: 'delete_outline',
            actionType: 'delete',
            disable: permission.code === '*',
            disableHint: '系统内置通配符权限，不支持删除',
          },
        ]"
        @disable="
          togglePermissionsStatus([permission], true, refreshPermissionData)
        "
        @enable="
          togglePermissionsStatus([permission], false, refreshPermissionData)
        "
        @delete="deletePermissions([permission], refreshPermissionData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="perm">
        <perm-form
          ref="updatePermForm"
          :permission="permission"
          :action="FormAction.update"
          @refresh="loadPermInfo"
        />
      </q-tab-panel>
      <q-tab-panel name="roles">
        <data-table
          ref="rolesTable"
          :columns="roleColumns"
          sticky-action-column
          search-placeholder="搜索角色信息"
          hide-filter
          hide-import
          hide-export
          wrap-cells
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="添加角色"
              class="q-ml-sm q-px-md primary-btn"
              @click="bindRolesForm = true"
            />
          </template>
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
                    disable:
                      permission.code === '*' &&
                      permission.application?.is_protected &&
                      props.row.is_protected,
                    disableHint:
                      '不支持解除通配符权限与预设应用 FreeAuth 系统管理员的关系',
                  },
                ]"
                @click.stop
                @unbind="
                  unbindRoles(permission, [props.row], refreshPermissionData)
                "
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="users">
        <data-table
          ref="usersTable"
          :columns="userColumns"
          sticky-action-column
          search-placeholder="搜索用户信息"
          hide-filter
          hide-import
          hide-export
          wrap-cells
        >
          <template #header-cell-roles="props">
            <q-th :props="props">
              {{ props.col.label }}
              <q-icon name="error_outline" size="14px">
                <q-tooltip anchor="center right" self="center start">
                  角色用于限制用户的操作权限
                </q-tooltip>
              </q-icon>
            </q-th>
          </template>
          <template #header-cell-departments="props">
            <q-th :props="props">
              {{ props.col.label }}
              <q-icon name="error_outline" size="14px">
                <q-tooltip anchor="center right" self="center start">
                  所属组织可以用于数据范围约束
                </q-tooltip>
              </q-icon>
            </q-th>
          </template>
          <template #body-cell-user_info="props">
            <q-td :props="props">
              <q-item-label>
                {{ props.row.name }}（{{ props.row.username }}）
              </q-item-label>
              <q-item-label caption class="text-grey-7">
                {{ props.row.mobile ? props.row.mobile : '' }}
                {{ props.row.email ? props.row.email : '' }}
              </q-item-label>
            </q-td>
          </template>
          <template #body-cell-roles="props">
            <q-td :props="props">
              <q-chip
                v-for="(role, idx) in (props.row.roles as Role[])"
                :key="idx"
                size="12px"
                square
                :color="
                  permission.roles?.map((r) => r.id).includes(role.id)
                    ? 'info'
                    : 'secondary'
                "
                class="q-ml-none"
              >
                {{ role.name }}
                <q-tooltip
                  v-if="permission.roles?.map((r) => r.id).includes(role.id)"
                  anchor="bottom middle"
                  self="top middle"
                >
                  与当前权限相关
                </q-tooltip>
              </q-chip>
            </q-td>
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
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <form-dialog
        ref="bindRolesDialog"
        v-model="bindRolesForm"
        title="添加角色"
        width="450px"
        @confirm="saveBindRolesForm"
        @close="resetBindRolesForm"
      >
        <template #form-content>
          <div class="q-gutter-md q-pa-md">
            <div>
              <field-label text="关联角色" required />
              <searchable-multiple-select
                v-model="selectedRoles"
                placeholder="输入角色名称进行搜索"
                option-api-url="/roles/query"
              />
              <div
                v-if="!!bindRolesFormError.role_ids"
                class="error-hint text-negative"
              >
                {{ bindRolesFormError.role_ids }}
              </div>
            </div>
            <div class="text-caption hint-label">
              提示：添加后，拥有该权限关联角色的用户将关联该权限。
            </div>
          </div>
        </template>
      </form-dialog>
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { FormAction } from 'components/form/type';
import { PermOperationsMixin } from 'components/permission/PermOperations';
import {
  BindRolesToPermsPostData,
  BindRolesToPermsPostError,
  Permission,
} from 'components/permission/type';
import { Role } from 'components/role/type';
import { DataTableComponent } from 'components/table/type';

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
    label: '描述',
    align: 'left',
    field: 'description',
    style: 'max-width: 400px',
    headerStyle: 'max-width: 400px',
  },
  {
    name: 'org_type',
    label: '角色归属',
    align: 'left',
    field: 'org_type',
  },
  {
    name: 'created_at',
    label: '创建时间',
    align: 'left',
    field: (row) =>
      date.formatDate(new Date(row.created_at), 'YYYY-MM-DD HH:mm:ss'),
    sortable: true,
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

const userColumns: QTableProps['columns'] = [
  {
    name: 'user_info',
    label: '用户信息',
    align: 'left',
    field: 'user_info',
  },
  {
    name: 'roles',
    label: '关联角色',
    align: 'left',
    field: 'roles',
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
    align: 'center',
    field: 'is_deleted',
    sortable: true,
  },
];

export default defineComponent({
  name: 'PermProfile',

  mixins: [PermOperationsMixin],

  props: {
    permId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {
      permission: ref<Permission>({
        id: '',
      }),
      panelTab: ref('perm'),
      roleColumns: roleColumns,
      userColumns: userColumns,
      FormAction,

      bindRolesForm: ref(false),
      selectedRoles: ref<Role[]>([]),
      bindRolesFormData: ref<BindRolesToPermsPostData>({}),
      bindRolesFormError: ref<BindRolesToPermsPostError>({}),
    };
  },

  mounted() {
    this.loadPermInfo();
  },

  methods: {
    async loadPermInfo() {
      const resp = await this.$api.get(`/permissions/${this.permId}`, {
        showProgress: true,
      });
      this.permission = resp.data;
    },

    switchPanelTab(val: string) {
      if (val === 'roles') {
        setTimeout(() => {
          const et = this.$refs.rolesTable as DataTableComponent;
          et.setApiInfo(`/permissions/${this.permission.id}/roles`, 'POST');
          et.fetchRows();
        }, 20);
      } else if (val === 'users') {
        setTimeout(() => {
          const et = this.$refs.usersTable as DataTableComponent;
          et.setApiInfo(`/permissions/${this.permission.id}/users`, 'POST');
          et.fetchRows();
        }, 20);
      }
    },

    refreshPermissionData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadPermInfo();
      } else if (op === 'delete') {
        this.$router.back();
      } else if (op === 'unbind') {
        this.loadPermInfo();
        (this.$refs.rolesTable as DataTableComponent).fetchRows();
      }
    },

    async saveBindRolesForm() {
      this.bindRolesFormData.role_ids = this.selectedRoles
        ? this.selectedRoles.map((role) => role.id)
        : [];
      this.bindRolesFormData.permission_ids = [this.permission.id];
      try {
        this.bindRolesFormError = {};
        await this.$api.post(
          '/permissions/bind_roles',
          this.bindRolesFormData,
          {
            successMsg: '角色添加成功',
          }
        );
        (this.$refs.bindRolesDialog as FormDialogComponent).hide();
        (this.$refs.rolesTable as DataTableComponent).fetchRows();
        this.loadPermInfo();
        this.resetBindRolesForm();
      } catch (e) {
        this.bindRolesFormError = (e as Error).cause || {};
      }
    },

    resetBindRolesForm() {
      this.bindRolesFormData = {};
      this.bindRolesFormError = {};
      this.selectedRoles = [];
    },
  },
});
</script>
