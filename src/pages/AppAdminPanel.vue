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
          @click="applicationForm = true"
        />
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
                  label: !props.row.is_deleted ? '禁用应用' : '启用应用',
                  icon: !props.row.is_deleted
                    ? 'remove_circle_outline'
                    : 'task_alt',
                  actionType: !props.row.is_deleted ? 'disable' : 'enable',
                },
                {
                  label: '删除应用',
                  icon: 'delete_outline',
                  actionType: 'delete',
                  disable: props.row.is_protected,
                  disableHint: props.row.is_protected
                    ? '系统预留应用，不支持删除'
                    : '',
                },
              ]"
              @click.stop
              @delete="deleteApplications([props.row])"
              @disable="toggleApplicationsStatus([props.row], true)"
              @enable="toggleApplicationsStatus([props.row], false)"
            />
          </div>
        </q-td>
      </template>
    </data-table>
    <form-dialog
      ref="applicationDialog"
      v-model="applicationForm"
      title="创建应用"
      width="450px"
      @confirm="saveApplicationForm"
      @close="resetApplicationForm"
    >
      <template #form-content>
        <div class="q-col-gutter-md q-pa-md">
          <div>
            <field-label text="应用名称" required />
            <q-input
              v-model="applicationFormData.name"
              filled
              dense
              placeholder="请填写应用名称"
              hide-bottom-space
              :error="!!applicationFormError.name"
              :error-message="applicationFormError.name"
            />
          </div>
          <div>
            <field-label text="应用描述" />
            <q-input
              v-model="applicationFormData.description"
              filled
              dense
              type="textarea"
              placeholder="请填写应用描述"
              hide-bottom-space
            />
          </div>
        </div>
      </template>
    </form-dialog>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import {
  Application,
  ApplicationPostData,
  ApplicationPostError,
} from 'components/application/type';
import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import { FormDialogComponent } from 'components/dialog/type';
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
    name: 'secret_key',
    label: '密钥',
    align: 'left',
    field: 'secret_key',
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

  setup() {
    return {
      columns: columns,
      filterColumns: filterColumns,

      applicationForm: ref(false),
      applicationFormData: ref<ApplicationPostData>({}),
      applicationFormError: ref<ApplicationPostError>({}),
    };
  },

  methods: {
    async saveApplicationForm() {
      try {
        this.applicationFormError = {};
        await this.$api.post('/applications', this.applicationFormData, {
          successMsg: '应用创建成功',
        });
        (this.$refs.applicationDialog as FormDialogComponent).hide();
        this.refreshApplicationData();
        this.resetApplicationForm();
      } catch (e) {
        this.applicationFormError = (e as Error).cause || {};
      }
    },

    resetApplicationForm() {
      this.applicationFormData = {};
      this.applicationFormError = {};
    },

    refreshApplicationData() {
      (this.$refs.applicationTable as DataTableComponent).fetchRows();
    },

    deleteApplications(applications: Application[]) {
      const applicationDesc = `【${applications[0].name}】${
        applications.length > 1 ? `等 ${applications.length} 个应用` : ''
      }`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除应用',
            content: `您正在请求删除${applicationDesc}及所含权限。数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
                url: '/applications',
                data: { ids: applications.map((a: Application) => a.id) },
                successMsg: '删除应用成功',
              });
            } finally {
              this.refreshApplicationData();
            }
          }
        });
    },

    toggleApplicationsStatus(applications: Application[], isDeleted: boolean) {
      const applicationDesc = `【${applications[0].name}】${
        applications.length > 1 ? `等 ${applications.length} 个应用` : ''
      }`;

      const content = isDeleted
        ? `您正在请求禁用${applicationDesc}。操作后，应用将无法从 FreeAuth 获取用户及权限等相关数据。`
        : `您正在请求启用${applicationDesc}。操作后，应用将重新获取 FreeAuth 获取用户及权限等相关数据。`;

      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: isDeleted ? '禁用应用' : '启用应用',
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
                '/applications/status',
                {
                  ids: applications.map((a: Application) => a.id),
                  is_deleted: isDeleted,
                },
                { successMsg: `${isDeleted ? '禁用' : '启用'}应用成功` }
              );
            } finally {
              this.refreshApplicationData();
            }
          }
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>
