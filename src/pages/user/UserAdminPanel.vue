<template>
  <page-wrapper page-title="用户管理">
    <data-table
      ref="userTable"
      api-url="/users/query"
      api-method="POST"
      :columns="columns"
      :filter-columns="filterColumns"
      sticky-action-column
      search-placeholder="搜索用户信息"
      selection="multiple"
      :batch-actions="['批量禁用', '批量启用', '批量删除']"
      @批量禁用="
        (selected: User[]) => toggleUsersStatus(selected, true, refreshUserData)
      "
      @批量启用="
        (selected: User[]) => toggleUsersStatus(selected, false, refreshUserData)
      "
      @批量删除="(selected: User[]) => deleteUsers(selected, refreshUserData)"
    >
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="创建用户"
          class="q-ml-sm q-px-md primary-btn"
          @click="openUserForm"
        />
      </template>
      <template #body-cell-name="props">
        <q-td
          :props="props"
          class="cursor-pointer text-primary text-weight-bold"
          @click="goToUserProfile($event, props.row.id)"
        >
          {{ props.row.name }}
        </q-td>
      </template>
      <template #body-cell-roles="props">
        <q-td :props="props">
          <q-item-section
            v-for="(role, idx) in props.row.roles"
            :key="idx"
            side
            @click="goToRoleProfile(role.id)"
          >
            <q-item-label class="cursor-pointer text-primary text-weight-bold">
              <q-icon name="people_alt" />
              {{ role.name }}
            </q-item-label>
          </q-item-section>
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
                label: !props.row.is_deleted ? '禁用账号' : '启用账号',
                icon: !props.row.is_deleted
                  ? 'remove_circle_outline'
                  : 'task_alt',
                actionType: !props.row.is_deleted ? 'disable' : 'enable',
                disable: props.row.id === currentUser.id,
                disableHint: '该账号为您当前登录正在使用账号',
              },
              {
                label: '删除账号',
                icon: 'delete_outline',
                actionType: 'delete',
                disable: props.row.id === currentUser.id,
                disableHint: '该账号为您当前登录正在使用账号',
              },
            ]"
            @disable="toggleUsersStatus([props.row], true, refreshUserData)"
            @enable="toggleUsersStatus([props.row], false, refreshUserData)"
            @delete="deleteUsers([props.row], refreshUserData)"
          />
        </q-td>
      </template>
    </data-table>

    <!--Dialogs-->
    <user-form
      ref="createUserForm"
      :action="FormAction.create"
      @refresh="refreshUserData"
    />
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { date, QTableProps } from 'quasar';

import { FormAction, FormComponent } from 'components/form/type';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from 'components/user/type';
import { UserOperationsMixin } from 'components/user/UserOperations';
import { authStore } from 'stores/auth-store';

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
    sortable: true,
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
    sortable: true,
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
    sortable: true,
  },
  {
    name: 'roles',
    label: '角色',
    align: 'left',
    field: 'roles',
  },
  {
    name: 'last_login_at',
    label: '最后登录时间',
    align: 'left',
    field: (row) =>
      row.last_login_at
        ? date.formatDate(new Date(row.last_login_at), 'YYYY-MM-DD HH:mm:ss')
        : null,
    sortable: true,
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
    align: 'left',
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
    label: '姓名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'username',
    label: '用户名',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'mobile',
    label: '手机号',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'email',
    label: '邮箱',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'last_login_at',
    label: '最后登录时间',
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
  name: 'UserAdminPanel',

  mixins: [UserOperationsMixin],

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      FormAction,
    };
  },

  computed: {
    ...mapState(authStore, ['currentUser']),
  },

  methods: {
    openUserForm() {
      (this.$refs.createUserForm as FormComponent).show();
    },

    refreshUserData() {
      const tb = this.$refs.userTable as DataTableComponent;
      tb.resetSelected();
      tb.fetchRows();
    },

    goToUserProfile(evt: Event, userId: string) {
      this.$router.push(`/user_profile/${userId}`);
    },

    goToRoleProfile(rolId: string) {
      this.$router.push(`/role_profile/${rolId}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
