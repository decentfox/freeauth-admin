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
                <field-label name="所属应用（不支持变更）" required />
                <q-input
                  :model-value="permission.application?.name"
                  filled
                  dense
                  hide-bottom-space
                  disable
                  :error="!!permissionFormError.application_id"
                  :error-message="permissionFormError.application_id"
                />
              </div>
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
                <field-label name="权限标签" />
                <q-select
                  ref="tags"
                  v-model="selectedTags"
                  filled
                  dense
                  use-input
                  use-chips
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  multiple
                  input-debounce="0"
                  :options="tagOptions"
                  @new-value="createValue"
                  @filter="filterFn"
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
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <q-chip size="12px" square color="secondary" class="q-ml-none">
                {{ props.row.org_type ? props.row.org_type.name : '全局' }}
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
              <field-label name="关联角色" required />
              <q-select
                ref="select"
                v-model="selectedRoles"
                :options="roleOptions"
                placeholder="输入角色名称进行搜索"
                filled
                dense
                use-input
                hide-dropdown-icon
                multiple
                map-options
                virtual-scroll-slice-size="5"
                @filter="searchRole"
                @update:model-value="clearFilter"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      找不到任何匹配项
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    color="primary"
                    text-color="white"
                    class="q-pa-sm"
                    :label="scope.opt.name"
                    @remove="scope.removeAtIndex(scope.index)"
                  />
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-chip
                        square
                        size="12px"
                        :label="!scope.opt.is_deleted ? '正常' : '禁用'"
                        class="text-weight-bold q-pa-sm"
                        :class="
                          !scope.opt.is_deleted
                            ? 'chip-status-on'
                            : 'chip-status-off'
                        "
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.name }}（{{ scope.opt.name }}）
                      </q-item-label>
                      <q-item-label caption>
                        {{ scope.opt.mobile }} {{ scope.opt.email }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section v-if="!!scope.opt.org_type" side>
                      <q-chip
                        square
                        size="12px"
                        :label="scope.opt.org_type.name"
                        class="q-pa-sm bg-secondary"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
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
import { date, QSelect, QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { PermOperationsMixin } from 'components/permission/PermOperations';
import { DataTableComponent } from 'components/table/type';
import { ProfileComponent } from 'layouts/type';

import { Role } from '../role/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Department, Tag } from '../type';

import {
  BindRolesToPermsPostData,
  BindRolesToPermsPostError,
  Permission,
  PermissionPostData,
  PermissionPostError,
} from './type';

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

      permissionFormData: ref<PermissionPostData>({}),
      permissionFormError: ref<PermissionPostError>({}),

      roleColumns: roleColumns,
      userColumns: userColumns,

      bindRolesForm: ref(false),
      roleOptions: ref([]),
      selectedRoles: ref<Role[]>(),
      bindRolesFormData: ref<BindRolesToPermsPostData>({}),
      bindRolesFormError: ref<BindRolesToPermsPostError>({}),

      initialTagOptions: ref<Tag[]>([]),
      tagOptions: ref<Tag[]>([]),
      selectedTags: ref<string[]>([]),
    };
  },

  mounted() {
    this.loadPermInfo();
    this.loadTagOptions();
  },

  methods: {
    async loadPermInfo() {
      const resp = await this.$api.get(`/permissions/${this.permId}`);
      this.permission = resp.data;
      this.permissionFormData = Object.assign({}, resp.data);
      this.selectedTags = this.permission.tags
        ? this.permission.tags.map((p) => p.id)
        : [];
    },

    async loadTagOptions() {
      const resp = await this.$api.get('/permission_tags');
      this.initialTagOptions = resp.data.permission_tags;
      this.tagOptions = resp.data.permission_tags;
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
      } else if (val === 'perm') {
        this.loadTagOptions();
      }
    },

    async savePermissionForm() {
      this.permissionFormData.existing_tag_ids = this.selectedTags.filter(
        (tag) => this.initialTagOptions.map((t) => t.id).includes(tag)
      );
      this.permissionFormData.new_tags = this.selectedTags.filter(
        (tag) => !this.initialTagOptions.map((t) => t.id).includes(tag)
      );
      if (
        JSON.stringify(this.permission) ===
        JSON.stringify(this.permissionFormData)
      )
        return;
      try {
        this.permissionFormError = {};
        this.permissionFormData.application_id =
          this.permission.application?.id;
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
      } else if (op === 'unbind') {
        this.loadPermInfo();
        (this.$refs.rolesTable as DataTableComponent).fetchRows();
      }
    },

    searchRole(
      val: string,
      update: (fn: () => void) => void,
      abort: () => void
    ) {
      const kw = val.trim();
      if (kw === '') {
        abort();
        return;
      }
      update(async () => {
        let resp = await this.$api.post('/roles/query', {
          q: kw,
        });
        this.roleOptions = resp.data.rows;
      });
    },

    clearFilter() {
      (this.$refs.select as QSelect).updateInputValue('');
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

    createValue(
      val: string,
      done: (item?: string, mode?: 'add' | 'add-unique' | 'toggle') => void
    ) {
      if (val.length > 0) {
        if (!this.initialTagOptions.map((tag) => tag.name).includes(val)) {
          done(val, 'add-unique');
        }
      }
    },

    filterFn(val: string, update: (fn: () => void) => void) {
      update(() => {
        if (val === '') {
          this.tagOptions = this.initialTagOptions;
        } else {
          const needle = val.toLowerCase();
          this.tagOptions = this.initialTagOptions.filter(
            (v) => v.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    },
  },
});
</script>
