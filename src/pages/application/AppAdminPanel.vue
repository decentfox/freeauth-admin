<template>
  <page-wrapper page-title="应用管理">
    <data-table
      ref="applicationTable"
      api-url="/applications/query"
      api-method="POST"
      :columns="columns"
      :filter-columns="filterColumns"
      search-placeholder="搜索应用信息"
      wrap-cells
      hide-import
      hide-export
    >
      <template #table-action>
        <q-btn
          unelevated
          dense
          label="创建应用"
          class="q-ml-sm q-px-md primary-btn"
          @click="openApplicationForm"
        />
      </template>
      <template #body-cell-name="props">
        <q-td
          :props="props"
          class="cursor-pointer text-primary text-weight-bold"
          @click="goToApplicationProfile($event, props.row.id)"
        >
          {{ props.row.name }}
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
                  label: '重置密钥',
                  icon: 'restart_alt',
                  actionType: 'reset',
                },
                {
                  label: !props.row.is_deleted ? '禁用应用' : '启用应用',
                  icon: !props.row.is_deleted
                    ? 'remove_circle_outline'
                    : 'task_alt',
                  actionType: !props.row.is_deleted ? 'disable' : 'enable',
                  disable: props.row.is_protected && !props.row.is_deleted,
                  disableHint:
                    props.row.is_protected && !props.row.is_deleted
                      ? '该应用为您当前所在应用，不支持禁用'
                      : '',
                },
                {
                  label: '删除应用',
                  icon: 'delete_outline',
                  actionType: 'delete',
                  disable: props.row.is_protected && !props.row.is_deleted,
                  disableHint:
                    props.row.is_protected && !props.row.is_deleted
                      ? '该应用为您当前所在应用，不支持删除'
                      : '',
                },
              ]"
              @click.stop
              @delete="deleteApplications([props.row], refreshApplicationData)"
              @disable="
                toggleApplicationsStatus(
                  [props.row],
                  true,
                  refreshApplicationData
                )
              "
              @enable="
                toggleApplicationsStatus(
                  [props.row],
                  false,
                  refreshApplicationData
                )
              "
              @reset="resetAppSecret(props.row.id)"
            />
          </div>
        </q-td>
      </template>
    </data-table>
    <app-form
      ref="createAppForm"
      :action="FormAction.create"
      @refresh="refreshApplicationData"
    />
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { date, QTableProps } from 'quasar';

import { AppOperationsMixin } from 'components/application/AppOperations';
import { FormAction, FormComponent } from 'components/form/type';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '应用名称',
    align: 'left',
    field: 'name',
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
    name: 'id',
    label: 'AppID',
    align: 'left',
    field: 'id',
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
    label: '应用名称',
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
  name: 'AppAdminPanel',

  mixins: [AppOperationsMixin],

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,
      FormAction,
    };
  },

  methods: {
    openApplicationForm() {
      (this.$refs.createAppForm as FormComponent).show();
    },

    refreshApplicationData() {
      (this.$refs.applicationTable as DataTableComponent).fetchRows();
    },

    goToApplicationProfile(evt: Event, appId: string) {
      this.$router.push(`/app_profile/${appId}`);
    },
  },
});
</script>

<style lang="scss" scoped></style>
