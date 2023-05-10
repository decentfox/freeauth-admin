<template>
  <q-page class="full-width q-pa-md">
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
      @批量禁用="(selected) => toggleUsersStatus(selected, true)"
      @批量启用="(selected) => toggleUsersStatus(selected, false)"
      @批量删除="(selected) => deleteUsers(selected)"
      @row-click="goToUserProfile"
    >
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="创建用户"
          class="q-ml-sm q-px-md primary-btn"
          @click="createUserForm = true"
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
            @menu-click="operateOneUser($event, props.row)"
          />
        </q-td>
      </template>
    </data-table>

    <!--Dialogs-->
    <form-dialog
      ref="createUserDialog"
      v-model="createUserForm"
      title="创建用户"
      width="450px"
      @confirm="createUser"
      @close="resetCreateUserForm"
    >
      <template #form-content>
        <div class="q-gutter-md q-pa-md">
          <div>
            <field-label name="登录信息" required hint="至少填写一项" />
            <div class="q-gutter-sm">
              <q-input
                v-model="newUser.username"
                filled
                dense
                placeholder="请填写用户名"
                hide-bottom-space
                class="col"
                :error="!!createUserFormError.username"
                :error-message="createUserFormError.username"
              />
              <q-input
                v-model="newUser.mobile"
                filled
                dense
                placeholder="请填写手机号"
                hide-bottom-space
                class="col"
                :error="!!createUserFormError.mobile"
                :error-message="createUserFormError.mobile"
              />
              <q-input
                v-model="newUser.email"
                filled
                dense
                placeholder="请填写邮箱"
                hide-bottom-space
                class="col"
                :error="!!createUserFormError.email"
                :error-message="createUserFormError.email"
                @update:model-value="
                  if (!newUser.email) firstLoginNotification = false;
                "
              />
            </div>
            <div
              v-if="!!createUserFormError.__root__"
              class="error-hint text-negative"
            >
              {{ createUserFormError.__root__ }}
            </div>
          </div>
          <div>
            <field-label name="用户姓名" />
            <q-input
              v-model="newUser.name"
              filled
              dense
              placeholder="请填写用户姓名"
              hide-bottom-space
              :error="!!createUserFormError.name"
              :error-message="createUserFormError.name"
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
              :disable="!newUser.email"
            >
              <q-tooltip
                v-if="!newUser.email"
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
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import { FormDialogComponent } from 'components/dialog/type';
import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';
import DataTable from 'components/table/DataTable.vue';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';

import { User, UserPostData, UserPostError } from './type';

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

  components: { DataTable, DropdownButton, FieldLabel, FormDialog },

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      createUserForm: ref(false),
      createUserFormError: ref<UserPostError>({}),
      firstLoginNotification: ref(false),
      passwordChangingRequired: ref(false),
      newUser: ref<UserPostData>({}),
    };
  },

  methods: {
    async createUser() {
      try {
        this.createUserFormError = {};
        await this.$api.post('/users', this.newUser, {
          successMsg: '用户创建成功',
        });
        (this.$refs.createUserDialog as FormDialogComponent).hide();
        (this.$refs.table as DataTableComponent).fetchRows();
        this.resetCreateUserForm();
      } catch (e) {
        this.createUserFormError = (e as Error).cause || {};
      }
    },

    resetCreateUserForm() {
      this.createUserFormError = {};
      this.newUser = {};
    },

    toggleUsersStatus(users: User[], isDeleted: boolean) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;
      const content = isDeleted
        ? `您正在请求禁用用户：${userDesc}，操作后，该用户将无法登录系统及重置密码，但您仍可在后台对该账号进行编辑及重新启用。`
        : `您正在请求启用用户：${userDesc}，操作后，账号状态将恢复正常，用户可以重新登录系统。`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: isDeleted ? '禁用用户' : '恢复用户',
            content: content,
            buttons: [
              { label: '取消', class: 'secondary-btn' },
              {
                label: isDeleted ? '禁用' : '恢复',
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
                '/users/status',
                {
                  user_ids: users.map((u: User) => u.id),
                  is_deleted: isDeleted,
                },
                { successMsg: `${isDeleted ? '禁用' : '启用'}用户成功` }
              );
            } finally {
              (this.$refs.table as DataTableComponent).fetchRows();
            }
          }
        });
    },

    deleteUsers(users: User[]) {
      const userDesc = `${users[0].name || users[0].username}${
        users[0].mobile ? `（${users[0].mobile}）` : ''
      }${users.length > 1 ? `等 ${users.length} 人` : ''}`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除用户',
            content: `您正在请求删除用户：${userDesc}，数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
            const userIds: string[] = users.map((u: User) => u.id);
            try {
              await this.$api.request({
                method: 'DELETE',
                url: '/users',
                data: { user_ids: userIds },
                successMsg: '删除用户成功',
              });
            } finally {
              (this.$refs.table as DataTableComponent).fetchRows();
            }
          }
        });
    },

    operateOneUser(evt: Event, user: User) {
      if (evt.type === 'disable') {
        this.toggleUsersStatus([user], true);
      } else if (evt.type === 'enable') {
        this.toggleUsersStatus([user], false);
      } else if (evt.type === 'delete') {
        this.deleteUsers([user]);
      }
    },

    goToUserProfile(evt: Event, row: User) {
      this.$router.push(`/user_profile/${row.id}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
