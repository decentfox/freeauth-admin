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
            label: !permission.is_deleted ? '禁用角色' : '启用角色',
            icon: !permission.is_deleted ? 'remove_circle_outline' : 'task_alt',
            actionType: !permission.is_deleted ? 'disable' : 'enable',
          },

          {
            label: '删除角色',
            icon: 'delete_outline',
            actionType: 'delete',
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
        <q-card flat bordered class="q-pa-md">
          <q-form>
            <div class="q-col-gutter-md q-pa-sm">
              <div>
                <field-label name="权限名称" required />
                <q-input
                  v-model="permissionFormData.name"
                  filled
                  dense
                  placeholder="请填写权限名称"
                  hide-bottom-space
                  :error="!!permissionFormError.name"
                  :error-message="permissionFormError.name"
                />
              </div>
              <div>
                <field-label
                  name="权限 Code"
                  required
                  hint="权限的唯一标识符，可用于获取权限信息"
                />
                <q-input
                  v-model="permissionFormData.code"
                  filled
                  dense
                  placeholder="请填写权限代码"
                  hide-bottom-space
                  :error="!!permissionFormError.code"
                  :error-message="permissionFormError.code"
                />
              </div>
              <div>
                <field-label name="权限描述" />
                <q-input
                  v-model="permissionFormData.description"
                  filled
                  dense
                  type="textarea"
                  placeholder="请填写权限描述"
                  hide-bottom-space
                />
              </div>
            </div>
            <q-card-actions>
              <q-btn
                unelevated
                class="primary-btn"
                label="保存"
                @click="savePermissionForm"
              />
            </q-card-actions>
          </q-form>
        </q-card>
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
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <q-chip
                square
                size="12px"
                :label="!props.row.is_deleted ? '正常' : '禁用'"
                class="text-weight-bold q-pa-sm q-ml-none"
                :class="
                  !props.row.is_deleted ? 'chip-status-on' : 'chip-status-off'
                "
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
          <template #body-cell-departments="props">
            <q-td :props="props">
              <q-chip
                v-for="(dept, idx) in (props.row.departments as Department[])"
                :key="idx"
                size="12px"
                square
                color="secondary"
                class="q-ml-none"
              >
                {{ dept.name }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-is_deleted="props">
            <q-td :props="props">
              <q-chip
                square
                size="12px"
                :label="!props.row.is_deleted ? '正常' : '禁用'"
                class="text-weight-bold q-pa-sm q-ml-none"
                :class="
                  !props.row.is_deleted ? 'chip-status-on' : 'chip-status-off'
                "
              />
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog> </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';
import { DataTableComponent } from 'src/components/table/type';

import { PermOperationsMixin } from 'components/permission/PermOperations';
import { ProfileComponent } from 'layouts/type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Department } from '../type';

import { Permission, PermissionPostData, PermissionPostError } from './type';

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

      permissionFormData: ref<PermissionPostData>({}),
      permissionFormError: ref<PermissionPostError>({}),

      bindRolesForm: ref(false),
      roleColumns: roleColumns,
      userColumns: userColumns,
    };
  },

  mounted() {
    this.loadPermInfo();
  },

  methods: {
    async loadPermInfo() {
      const resp = await this.$api.get(`/permissions/${this.permId}`);
      this.permission = resp.data;
      this.permissionFormData = Object.assign({}, resp.data);
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

    async savePermissionForm() {
      if (
        JSON.stringify(this.permission) ===
        JSON.stringify(this.permissionFormData)
      )
        return;
      try {
        this.permissionFormError = {};
        const resp = await this.$api.put(
          `/permissions/${this.permission.id}`,
          this.permissionFormData,
          {
            successMsg: '权限更新成功',
          }
        );
        this.permission = resp.data;
        this.permissionFormData = Object.assign({}, resp.data);
        this.permissionFormError = {};
      } catch (e) {
        this.permissionFormError = (e as Error).cause || {};
      }
    },

    refreshPermissionData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadPermInfo();
      } else if (op === 'delete') {
        (this.$refs.profile as ProfileComponent).goBack();
      }
    },
  },
});
</script>
