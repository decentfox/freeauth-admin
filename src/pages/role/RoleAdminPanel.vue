<template>
  <page-wrapper page-title="角色管理">
    <q-tab-panels v-model="viewMode">
      <q-tab-panel name="table" class="q-pa-none">
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
                  只有该角色所属组织类型下的用户才可关联使用该角色
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
              <q-chip size="12px" square color="secondary" class="q-ml-none">
                {{ props.row.org_type ? props.row.org_type.name : '全局' }}
              </q-chip>
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
                  @disable="
                    toggleRolesStatus([props.row], true, refreshRoleData)
                  "
                  @enable="
                    toggleRolesStatus([props.row], false, refreshRoleData)
                  "
                  @delete="deleteRoles([props.row], refreshRoleData)"
                  @bind-users="goToRoleProfile($event, props.row.id, 'users')"
                  @set-perms="goToRoleProfile($event, props.row.id, 'perms')"
                />
              </div>
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
      <q-tab-panel name="structure" class="q-pa-none">
        <q-splitter v-model="splitterModel" unit="px" :limits="[250, 400]">
          <!--the first splitted screen-->
          <template #before>
            <org-tree
              :editable="false"
              @update:select-node="onNodeUpdated"
              @update:org-type="onOrgTypeChanged"
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
                    <q-item-label header class="q-pt-md q-pb-none">
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
                            <boolean-chip
                              v-if="role.is_deleted"
                              :value="!role.is_deleted"
                              dense
                              true-label="正常"
                              false-label="禁用"
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
                            @click="goToRoleProfile($event, role.id, 'users')"
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
                  class="q-px-md scroll frame-table"
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
                              label: '配置角色',
                              icon: 'manage_accounts',
                              actionType: 'set_roles',
                            },
                          ]"
                          @click.stop
                          @set-roles="openSetRolesForm(props.row)"
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
  </page-wrapper>
  <role-form
    ref="createRoleForm"
    :action="FormAction.create"
    @refresh="refreshRoleData"
  />
  <set-roles-form ref="setRolesForm" @user-updated="loadUserTable" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps, QTreeNode } from 'quasar';

import { FormAction, FormComponent } from 'components/form/type';
import { RoleOperationsMixin } from 'components/role/RoleOperations';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';
import { SetRolesComponent } from 'components/user/type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Department, OrgType } from '../type';
import { User } from '../user/type';

import { Role, RoleSet } from './type';

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
  name: 'RoleAdminPanel',

  mixins: [RoleOperationsMixin],

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

      FormAction,
    };
  },

  methods: {
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
      (this.$refs.createRoleForm as FormComponent).show();
    },

    openSetRolesForm(user: User) {
      (this.$refs.setRolesForm as SetRolesComponent).show(user);
    },

    refreshRoleData() {
      (this.$refs.roleTable as DataTableComponent).fetchRows();
    },

    goToRoleProfile(evt: Event, roleId: string, target?: string) {
      this.$router.push(`/role_profile/${roleId}${target ? `/${target}` : ''}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
