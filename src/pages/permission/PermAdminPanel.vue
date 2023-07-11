<template>
  <page-wrapper page-title="权限管理">
    <data-table
      ref="permissionTable"
      :columns="columns"
      :filter-columns="filterColumns"
      search-placeholder="搜索权限信息"
      hide-import
      hide-export
    >
      <template #type-select>
        <q-select
          v-model="selectedApp"
          :options="appOptions"
          dense
          filled
          class="full-width q-pr-sm"
          option-label="name"
          option-value="id"
          style="max-width: 250px"
          prefix="应用："
          @update:model-value="loadPermissionsbyApp"
        />
      </template>
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="管理标签"
          class="q-ml-sm q-px-md secondary-btn"
          @click="openTagManagement"
        />
        <div>
          <q-btn
            unelevated
            dense
            label="创建权限"
            class="q-ml-sm q-px-md primary-btn"
            :disable="selectedApp.is_protected"
            @click="openPermissionForm"
          />
          <q-tooltip
            v-if="selectedApp.is_protected"
            anchor="bottom right"
            self="top right"
            max-width="200px"
          >
            所选应用即为当前所在系统 FreeAuth，权限的变更应通过代码实现
          </q-tooltip>
        </div>
      </template>
      <template #body-cell-name="props">
        <q-td
          :props="props"
          class="cursor-pointer text-primary text-weight-bold"
          @click="goToPermissionProfile($event, props.row.id)"
        >
          {{ props.row.name }}
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
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="text-grey-8 q-gutter-xs">
            <dropdown-button
              :buttons="[
                {
                  label: !props.row.is_deleted ? '禁用权限' : '启用权限',
                  icon: !props.row.is_deleted
                    ? 'remove_circle_outline'
                    : 'task_alt',
                  actionType: !props.row.is_deleted ? 'disable' : 'enable',
                  disable: props.row.code === '*',
                  disableHint: '系统内置通配符权限，不支持禁用',
                },
                {
                  label: '删除权限',
                  icon: 'delete_outline',
                  actionType: 'delete',
                  disable: props.row.code === '*',
                  disableHint: '系统内置通配符权限，不支持删除',
                },
              ]"
              @click.stop
              @disable="
                togglePermissionsStatus(
                  [props.row],
                  true,
                  refreshPermissionData
                )
              "
              @enable="
                togglePermissionsStatus(
                  [props.row],
                  false,
                  refreshPermissionData
                )
              "
              @delete="deletePermissions([props.row], refreshPermissionData)"
            />
          </div>
        </q-td>
      </template>
    </data-table>
    <perm-form
      ref="createPermForm"
      :app-id="selectedApp.id"
      :action="FormAction.create"
      @refresh="refreshPermissionData"
    />
    <tag-management ref="tagManagement" width="500px" title="管理权限标签" />
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import { Application } from 'components/application/type';
import { FormAction, FormComponent } from 'components/form/type';
import { PermOperationsMixin } from 'components/permission/PermOperations';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';
import { TagManagementComponent } from 'components/tag/type';

const columns: QTableProps['columns'] = [
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
    label: '权限名称',
    operatorOptions: [
      FilterOperator.eq,
      FilterOperator.neq,
      FilterOperator.ct,
      FilterOperator.nct,
    ],
  },
  {
    field: 'code',
    label: '权限 Code',
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
  name: 'PermAdminPanel',

  mixins: [PermOperationsMixin],

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      selectedApp: ref<Application>({ id: '' }),
      appOptions: ref<Application[]>([]),

      FormAction,
    };
  },

  mounted() {
    this.loadApplicationOptions();
  },

  methods: {
    async loadApplicationOptions() {
      const resp = await this.$api.get('/applications/options');
      this.appOptions = resp.data;
      this.selectedApp = this.appOptions[0];
      this.loadPermissionsbyApp();
    },

    async loadPermissionsbyApp() {
      setTimeout(() => {
        const pt = this.$refs.permissionTable as DataTableComponent;
        pt.setApiInfo('/permissions/query', 'POST');
        pt.onExternalFiltered('application_id', this.selectedApp.id);
      }, 20);
    },

    openPermissionForm() {
      (this.$refs.createPermForm as FormComponent).show();
    },

    refreshPermissionData() {
      (this.$refs.permissionTable as DataTableComponent).fetchRows();
    },

    goToPermissionProfile(evt: Event, permId: string) {
      this.$router.push(`/perm_profile/${permId}`);
    },

    openTagManagement() {
      (this.$refs.tagManagement as TagManagementComponent).show();
    },
  },
});
</script>

<style lang="scss" scoped></style>
