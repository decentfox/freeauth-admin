<template>
  <page-wrapper page-title="用户管理">
    <data-table
      ref="table"
      :columns="columns"
      api-url="/users/query"
      api-method="POST"
      sticky-action-column
      search-placeholder="搜索用户信息"
      selection="multiple"
      :filter-columns="filterColumns"
      :batch-actions="['批量禁用', '批量启用', '批量删除']"
      @批量禁用="
        (selected) => toggleUsersStatus(selected, true, refreshUserData)
      "
      @批量启用="
        (selected) => toggleUsersStatus(selected, false, refreshUserData)
      "
      @批量删除="(selected) => deleteUsers(selected, refreshUserData)"
    >
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="创建用户"
          class="q-ml-sm q-px-md primary-btn"
          @click="newUserForm = true"
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
        <q-td :props="props" @click.stop>
          <dropdown-button
            :buttons="[
              {
                label: !props.row.is_deleted ? '禁用账号' : '启用账号',
                icon: !props.row.is_deleted
                  ? 'remove_circle_outline'
                  : 'task_alt',
                actionType: !props.row.is_deleted ? 'disable' : 'enable',
              },
              {
                label: '删除账号',
                icon: 'delete_outline',
                actionType: 'delete',
              },
            ]"
            @click.stop
            @disable="toggleUsersStatus([props.row], true, refreshUserData)"
            @enable="toggleUsersStatus([props.row], false, refreshUserData)"
            @delete="deleteUsers([props.row], refreshUserData)"
          />
        </q-td>
      </template>
    </data-table>

    <!--Dialogs-->
    <form-dialog
      ref="newUserDialog"
      v-model="newUserForm"
      title="创建用户"
      width="450px"
      @confirm="createUser"
      @close="resetNewUserForm"
    >
      <template #form-content>
        <div class="q-gutter-md q-pa-md">
          <div>
            <field-label name="登录信息" required hint="至少填写一项" />
            <div class="q-gutter-sm">
              <q-input
                v-model="newUserFormData.username"
                filled
                dense
                placeholder="请填写用户名"
                hide-bottom-space
                class="col"
                :error="!!newUserFormError.username"
                :error-message="newUserFormError.username"
              />
              <q-input
                v-model="newUserFormData.mobile"
                filled
                dense
                placeholder="请填写手机号"
                hide-bottom-space
                class="col"
                :error="!!newUserFormError.mobile"
                :error-message="newUserFormError.mobile"
              />
              <q-input
                v-model="newUserFormData.email"
                filled
                dense
                placeholder="请填写邮箱"
                hide-bottom-space
                class="col"
                :error="!!newUserFormError.email"
                :error-message="newUserFormError.email"
                @update:model-value="
                  if (!newUserFormData.email) firstLoginNotification = false;
                "
              />
            </div>
            <div
              v-if="!!newUserFormError.__root__"
              class="error-hint text-negative"
            >
              {{ newUserFormError.__root__ }}
            </div>
          </div>
          <div>
            <field-label name="用户姓名" />
            <q-input
              v-model="newUserFormData.name"
              filled
              dense
              placeholder="请填写用户姓名"
              hide-bottom-space
              :error="!!newUserFormError.name"
              :error-message="newUserFormError.name"
            />
          </div>
          <div>
            <q-toggle
              v-model="passwordChangingRequired"
              label="强制用户在首次登录时修改密码"
            />
            <q-toggle
              v-model="firstLoginNotification"
              label="通过邮件发送初始默认登录信息"
              :disable="!newUserFormData.email"
            >
              <q-tooltip
                v-if="!newUserFormData.email"
                anchor="bottom left"
                self="center start"
              >
                填写有效邮箱后才可启用
              </q-tooltip>
            </q-toggle>
          </div>
        </div>
      </template>
    </form-dialog>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';
import { UserOperationsMixin } from 'components/user/UserOperations';

import { UserPostData, UserPostError } from './type';

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
      // user list table
      columns: columns,
      filterColumns: filterColumns,

      // create new user
      newUserForm: ref(false),
      newUserFormData: ref<UserPostData>({}),
      newUserFormError: ref<UserPostError>({}),
      firstLoginNotification: ref(false),
      passwordChangingRequired: ref(false),
    };
  },

  methods: {
    async createUser() {
      try {
        this.newUserFormError = {};
        await this.$api.post('/users', this.newUserFormData, {
          successMsg: '用户创建成功',
        });
        (this.$refs.newUserDialog as FormDialogComponent).hide();
        this.resetNewUserForm();
        this.refreshUserData();
      } catch (e) {
        this.newUserFormError = (e as Error).cause || {};
      }
    },

    resetNewUserForm() {
      this.newUserFormError = {};
      this.newUserFormData = {};
    },

    refreshUserData() {
      (this.$refs.table as DataTableComponent).fetchRows();
    },

    goToUserProfile(evt: Event, userId: string) {
      this.$router.push(`/user_profile/${userId}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
