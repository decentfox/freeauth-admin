<template>
  <q-page class="full-width">
    <q-tab-panels v-model="viewMode">
      <q-tab-panel name="table" class="q-pa-md">
        <data-table
          ref="roleTable"
          :columns="columns"
          api-url="/roles/query"
          api-method="POST"
          sticky-action-column
          search-placeholder="搜索角色信息"
          :filter-columns="filterColumns"
          wrap-cells
          hide-import
          hide-export
        >
          <template #table-action>
            <q-btn
              unelevated
              dense
              label="创建角色"
              class="q-ml-sm q-px-md primary-btn"
              @click="openRoleForm"
            />
            <q-btn
              unelevated
              dense
              class="q-ml-md secondary-btn"
              @click="viewMode = 'structure'"
            >
              <q-icon class="material-icons-outlined">account_tree</q-icon>
              <q-tooltip>切换视图</q-tooltip>
            </q-btn>
          </template>
          <template #header-cell-org_type="props">
            <q-th :props="props">
              {{ props.col.label }}
              <q-icon name="error_outline" size="14px">
                <q-tooltip anchor="center right" self="center start">
                  只有该角色所属组织下的用户才可关联使用该角色
                </q-tooltip>
              </q-icon>
            </q-th>
          </template>
          <template #body-cell-name="props">
            <q-td
              :props="props"
              class="cursor-pointer text-primary text-weight-bold"
              @click="goToRoleProfile($event, props.row.id)"
            >
              {{ props.row.name }}
            </q-td>
          </template>
          <template #body-cell-org_type="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.org_type"
                clickable
                size="12px"
                square
                color="secondary"
                class="q-ml-none"
              >
                {{ props.row.org_type.name }}
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
              <div class="text-grey-8 q-gutter-xs">
                <dropdown-button
                  :buttons="[
                    {
                      label: !props.row.is_deleted ? '禁用角色' : '启用角色',
                      icon: !props.row.is_deleted
                        ? 'remove_circle_outline'
                        : 'task_alt',
                      actionType: !props.row.is_deleted ? 'disable' : 'enable',
                    },
                    {
                      label: '添加主体',
                      icon: 'manage_accounts',
                      actionType: 'bind_users',
                    },
                    {
                      label: '配置权限',
                      icon: 'room_preferences',
                      actionType: 'set_perms',
                    },
                    {
                      label: '删除角色',
                      icon: 'delete_outline',
                      actionType: 'delete',
                    },
                  ]"
                  @click.stop
                  @disable="toggleRoles([props.row], true)"
                  @enable="toggleRoles([props.row], false)"
                  @delete="deleteRoles([props.row])"
                  @bind-users="goToRoleProfile($event, props.row.id)"
                  @set-perms="goToRoleProfile($event, props.row.id)"
                />
              </div>
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="structure" class="q-pa-none">
        <q-splitter
          v-model="splitterModel"
          class="q-py-sm"
          unit="px"
          :limits="[250, 400]"
        >
          <!--the first splitted screen-->
          <template #before>
            <org-structure-tree
              @update:select-node="onNodeUpdated"
              @update:change-org-type="onOrgTypeChanged"
            />
          </template>

          <template #separator>
            <div class="splitter-drag-icon">
              <q-icon name="drag_indicator" color="primary" />
            </div>
          </template>

          <!--the second splitted screen-->
          <template #after>
            <q-splitter
              v-model="secondSplitterModel"
              unit="px"
              :limits="[250, 250]"
            >
              <template #before>
                <div class="q-px-md">
                  <q-item-section>
                    <q-item-label header class="q-pt-lg q-pb-none">
                      可用角色
                      <q-icon name="error_outline" size="14px">
                        <q-tooltip anchor="center right" self="center start">
                          当前组织类型下的用户可选角色列表
                        </q-tooltip>
                      </q-icon>
                    </q-item-label>
                  </q-item-section>
                  <div v-for="(set, idx) in availableRoleSet" :key="idx">
                    <q-separator inset spaced="lg" />
                    <q-item-label caption class="q-px-md q-py-sm text-grey-7">
                      {{ set.label }}
                    </q-item-label>
                    <div v-for="role in set.roles" :key="role.id">
                      <q-item>
                        <q-item-section>
                          <q-item-label>
                            {{ role.name }}
                            <q-badge
                              v-if="role.is_deleted"
                              align="top"
                              :label="!role.is_deleted ? '正常' : '禁用'"
                              :class="
                                !role.is_deleted
                                  ? 'chip-status-on'
                                  : 'chip-status-off'
                              "
                              class="q-ml-xs"
                            />
                          </q-item-label>
                          <q-item-label caption lines="1">
                            {{ role.description }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            dense
                            unelevated
                            color="secondary"
                            text-color="grey-7"
                            icon="person_add"
                            size="10px"
                            @click="goToRoleProfile($event, role.id)"
                          >
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                </div>
              </template>

              <template #separator>
                <div class="splitter-drag-icon">
                  <q-icon name="drag_indicator" color="primary" />
                </div>
              </template>

              <template #after>
                <div
                  class="q-px-md q-py-sm scroll frame-table"
                  style="height: calc(100vh - 70px)"
                >
                  <data-table
                    ref="userTable"
                    :columns="userColumns"
                    sticky-action-column
                    search-placeholder="搜索用户信息"
                    hide-filter
                    hide-export
                    hide-import
                  >
                    <template #table-action>
                      <q-btn
                        unelevated
                        dense
                        icon="list_alt"
                        class="q-ml-md secondary-btn"
                        @click="viewMode = 'table'"
                      >
                        <q-tooltip>切换视图</q-tooltip>
                      </q-btn>
                    </template>
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
                    <template #body-cell-departments="props">
                      <q-td :props="props">
                        <q-chip
                          v-for="(dept, idx) in (props.row.departments as Department[])"
                          :key="idx"
                          clickable
                          size="12px"
                          square
                          color="secondary"
                          class="q-ml-none"
                        >
                          {{ dept.name }}
                        </q-chip>
                      </q-td>
                    </template>
                    <template #body-cell-roles="props">
                      <q-td :props="props">
                        <q-chip
                          v-for="(role, idx) in (props.row.roles as Role[])"
                          :key="idx"
                          clickable
                          size="12px"
                          square
                          color="secondary"
                          class="q-ml-none"
                        >
                          {{ role.name }}
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
                            !props.row.is_deleted
                              ? 'chip-status-on'
                              : 'chip-status-off'
                          "
                        />
                      </q-td>
                    </template>
                    <template #body-cell-actions="props">
                      <q-td :props="props">
                        <dropdown-button
                          :buttons="[
                            {
                              label: '配置角色',
                              icon: 'manage_accounts',
                              actionType: 'set_roles',
                            },
                          ]"
                          @click.stop
                          @set-roles="openSetRoleForm(props.row)"
                        />
                      </q-td>
                    </template>
                  </data-table>
                </div>
              </template>
            </q-splitter>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
  <form-dialog
    ref="roleDialog"
    v-model="roleForm"
    title="创建角色"
    width="450px"
    @confirm="saveRoleForm"
    @close="resetRoleForm"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <q-option-group
          v-model="roleTypeTab"
          inline
          class="q-px-md"
          :options="[
            { label: '全局可选角色', value: 'global' },
            { label: '指定组织类型下可选角色', value: 'org_type' },
          ]"
        />
        <div v-if="roleTypeTab === 'org_type'">
          <field-label name="所属组织类型" required />
          <q-select
            v-model="roleFormData.org_type_id"
            :options="orgTypeOptions"
            dense
            filled
            class="full-width"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            hide-bottom-space
            :rules="[(val) => !!val || '请选择所属组织类型']"
          />
        </div>
      </div>
      <q-separator inset />
      <div class="q-col-gutter-md q-pa-md">
        <div>
          <field-label name="角色名称" required />
          <q-input
            v-model="roleFormData.name"
            filled
            dense
            placeholder="请填写角色名称"
            hide-bottom-space
            :error="!!roleFormError.name"
            :error-message="roleFormError.name"
          />
        </div>
        <div>
          <field-label
            name="角色 Code"
            hint="角色的唯一标识符，可用户获取角色信息"
          />
          <q-input
            v-model="roleFormData.code"
            filled
            dense
            placeholder="请填写角色代码"
            hide-bottom-space
            :error="!!roleFormError.code"
            :error-message="roleFormError.code"
          />
        </div>
        <div>
          <field-label name="角色描述" />
          <q-input
            v-model="roleFormData.description"
            filled
            dense
            type="textarea"
            placeholder="请填写角色描述"
            hide-bottom-space
          />
        </div>
      </div>
    </template>
  </form-dialog>
  <form-dialog
    ref="setRoleDialog"
    v-model="setRoleForm"
    title="配置角色"
    width="450px"
    @confirm="saveSetRoleForm"
    @close="resetSetRoleForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <field-label name="关联角色" />
          <q-select
            v-model="selectedRoles"
            :options="availableRoleOptions"
            dense
            filled
            class="full-width"
            option-label="name"
            option-value="id"
            multiple
            use-chips
          >
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
                    {{ scope.opt.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    square
                    size="12px"
                    :label="
                      !scope.opt.org_type
                        ? '全局角色'
                        : scope.opt.org_type.name + '角色'
                    "
                    class="q-pa-sm bg-secondary"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="text-caption hint-label">
          提示：仅能选择全局角色或属于当前页所选【{{
            selectedOrgType.name
          }}】下的角色。
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Department,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Organization,
  OrgType,
  Role,
  RolePostData,
  RolePostError,
  RoleSet,
  SetRolePostData,
  SetRolePostError,
  User,
} from 'pages/type';
import { date, QTableProps, QTreeNode } from 'quasar';
import { FormDialogComponent } from 'src/components/dialog/type';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';
import OrgStructureTree from 'components/OrgTree.vue';
import DataTable from 'components/table/DataTable.vue';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';

const columns: QTableProps['columns'] = [
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
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

const filterColumns: FilterColumn[] = [
  {
    field: 'name',
    label: '角色名称',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'code',
    label: '角色 Code',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'created_at',
    label: '创建时间',
    type: 'datetime',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.gt,
      FilterOperator.gte,
      FilterOperator.lt,
      FilterOperator.lte,
    ],
  },
  {
    field: 'is_deleted',
    label: '状态',
    type: 'select',
    operatorOptions: [FilterOperator.eq, FilterOperator.neq],
    options: [
      { value: false, label: '正常' },
      { value: true, label: '禁用' },
    ],
  },
];

export default defineComponent({
  name: 'IndexPage',

  components: {
    DataTable,
    DropdownButton,
    FormDialog,
    FieldLabel,
    OrgStructureTree,
  },

  setup() {
    return {
      // table mode
      columns: columns,
      filterColumns: filterColumns,
      viewMode: ref('table'),

      // structure mode
      splitterModel: 300,
      secondSplitterModel: 250,
      selectedOrgType: ref({
        id: '',
        name: '',
      }),
      selectedNode: ref({
        id: '',
        name: '',
      }),
      userColumns: userColumns,
      availableRoleSet: ref<RoleSet[]>([]),

      // form dialog
      orgTypeOptions: ref<OrgType[]>([]),
      roleTypeTab: ref('global'),
      roleForm: ref(false),
      roleFormData: ref<RolePostData>({}),
      roleFormError: ref<RolePostError>({}),

      selectedRoles: ref<Role[]>([]),
      availableRoleOptions: ref<Role[]>([]),
      setRoleForm: ref(false),
      setRoleFormData: ref<SetRolePostData>({}),
      setRoleFormError: ref<SetRolePostError>({}),
    };
  },

  methods: {
    operateOneRole(evt: Event, role: Role) {
      if (evt.type === 'disable') {
        this.toggleRoles([role], true);
      } else if (evt.type === 'enable') {
        this.toggleRoles([role], false);
      } else if (evt.type === 'delete') {
        this.deleteRoles([role]);
      } else if (evt.type === 'bind_users') {
        this.goToRoleProfile(evt, role.id);
      } else if (evt.type === 'set_perms') {
        this.goToRoleProfile(evt, role.id);
      }
    },

    onNodeUpdated(node: QTreeNode) {
      this.selectedNode.id = node.id;
      this.selectedNode.name = node.name;
      this.loadUserTable();
    },

    onOrgTypeChanged(selected: OrgType) {
      this.selectedOrgType = selected;
      this.selectedNode = {
        id: '',
        name: '',
      };
      this.loadAvailableRoles();
    },

    async loadAvailableRoles() {
      if (this.selectedOrgType.id) {
        const resp = await this.$api.post('/roles/query', {
          org_type_id: this.selectedOrgType.id,
        });
        this.availableRoleOptions = resp.data.rows;
        this.availableRoleSet = [
          {
            label: '组织类型角色',
            roles: resp.data.rows.filter((r: Role) => !!r.org_type),
          },
          {
            label: '全局角色',
            roles: resp.data.rows.filter((r: Role) => !r.org_type),
          },
        ];
      }
    },

    async loadUserTable() {
      if (this.selectedNode.id) {
        setTimeout(() => {
          const ut = this.$refs.userTable as DataTableComponent;
          ut.setApiInfo(
            `/organizations/${this.selectedNode.id}/members`,
            'POST'
          );
          ut.fetchRows();
        }, 200);
      }
    },

    openRoleForm() {
      this.loadOrgTypes();
      this.roleForm = true;
    },

    async saveRoleForm() {
      try {
        this.roleFormError = {};
        if (this.roleTypeTab === 'global') {
          this.roleFormData.org_type_id = undefined;
        }
        await this.$api.post('/roles', this.roleFormData, {
          successMsg: '角色创建成功',
        });
        (this.$refs.roleDialog as FormDialogComponent).hide();
        (this.$refs.roleTable as DataTableComponent).fetchRows();
        this.resetRoleForm();
      } catch (e) {
        this.roleFormError = (e as Error).cause || {};
      }
    },

    resetRoleForm() {
      this.roleFormData = {};
      this.roleFormError = {};
      this.roleTypeTab = 'global';
    },

    async loadOrgTypes() {
      const resp = await this.$api.get('/org_types');
      this.orgTypeOptions = resp.data.org_types;
      this.roleFormData.org_type_id = this.orgTypeOptions[0].id;
    },

    toggleRoles(roles: Role[], isDeleted: boolean) {
      const roleDesc = `${roles[0].name}${
        roles.length > 1 ? `等 ${roles.length} 角色` : ''
      }`;
      const content = isDeleted
        ? `您正在请求禁用【${roleDesc}】。操作后，角色主体（关联用户）将不再具有角色关联的资源权限，但不会改变角色与角色主体的关联关系。`
        : `您正在请求启用【${roleDesc}】。操作后，角色主体（关联用户）将重新获得角色关联的资源权限。`;
      this.$q
        .dialog({
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
        })
        .onOk(async ({ type }) => {
          if (type === 'toggle') {
            try {
              await this.$api.put(
                '/roles/status',
                { ids: roles.map((r: Role) => r.id), is_deleted: isDeleted },
                { successMsg: `${isDeleted ? '禁用' : '启用'}用户成功` }
              );
            } finally {
              (this.$refs.roleTable as DataTableComponent).fetchRows();
            }
          }
        });
    },

    deleteRoles(roles: Role[]) {
      const roleDesc = `${roles[0].name}${
        roles.length > 1 ? `等 ${roles.length} 角色` : ''
      }`;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除角色',
            content: `您正在请求删除【${roleDesc}】。数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
            try {
              await this.$api.request({
                method: 'DELETE',
                url: '/roles',
                data: { ids: roles.map((u: Role) => u.id) },
                successMsg: '删除角色成功',
              });
            } finally {
              (this.$refs.roleTable as DataTableComponent).fetchRows();
            }
          }
        });
    },

    openSetRoleForm(user: User) {
      this.setRoleForm = true;
      this.setRoleFormData.user_id = user.id;
      this.selectedRoles = user.roles || [];
    },

    async saveSetRoleForm() {
      this.setRoleFormData.role_ids = this.selectedRoles.map((role) => role.id);
      try {
        this.setRoleFormError = {};
        await this.$api.put(
          `/users/${this.setRoleFormData.user_id}/roles`,
          this.setRoleFormData,
          {
            successMsg: '角色配置成功',
          }
        );
        (this.$refs.setRoleDialog as FormDialogComponent).hide();
        this.loadUserTable();
        this.resetSetRoleForm();
      } catch (e) {
        this.setRoleFormError = (e as Error).cause || {};
      }
    },

    resetSetRoleForm() {
      this.setRoleFormData = {};
      this.setRoleFormError = {};
      this.selectedRoles = [];
    },

    goToRoleProfile(evt: Event, roleId: string) {
      this.$router.push(`/role_profile/${roleId}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
