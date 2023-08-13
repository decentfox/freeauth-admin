<!--
  Copyright (c) 2016-present DecentFoX Studio and the FreeAuth authors.
  FreeAuth is licensed under Mulan PSL v2.
  You can use this software according to the terms and conditions of the Mulan PSL v2.
  You may obtain a copy of Mulan PSL v2 at:
           http://license.coscl.org.cn/MulanPSL2
  THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
  MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
  See the Mulan PSL v2 for more details.
-->
<template>
  <profile-page
    ref="profile"
    v-model:tab-value="panelTab"
    :name="application.name"
    :status="!application.is_deleted"
    :tabs="[
      { name: 'app', label: '基本信息' },
      { name: 'perms', label: '权限信息' },
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
            label: '重置密钥',
            icon: 'restart_alt',
            actionType: 'reset',
          },
          {
            label: !application.is_deleted ? '禁用应用' : '启用应用',
            icon: !application.is_deleted
              ? 'remove_circle_outline'
              : 'task_alt',
            actionType: !application.is_deleted ? 'disable' : 'enable',
            disable: application.is_protected && !application.is_deleted,
            disableHint:
              application.is_protected && !application.is_deleted
                ? '该应用为您当前所在应用，不支持禁用'
                : '',
          },
          {
            label: '删除应用',
            icon: 'delete_outline',
            actionType: 'delete',
            disable: application.is_protected && !application.is_deleted,
            disableHint:
              application.is_protected && !application.is_deleted
                ? '该应用为您当前所在应用，不支持删除'
                : '',
          },
        ]"
        @reset="resetAppSecret(application.id)"
        @disable="
          toggleApplicationsStatus([application], true, refreshApplicationData)
        "
        @enable="
          toggleApplicationsStatus([application], false, refreshApplicationData)
        "
        @delete="deleteApplications([application], refreshApplicationData)"
      />
    </template>
    <template #panels>
      <q-tab-panel name="app">
        <app-form
          ref="updatePermForm"
          :application="application"
          :action="FormAction.update"
          @refresh="loadAppInfo"
        />
      </q-tab-panel>
      <q-tab-panel name="perms">
        <data-table
          ref="permsTable"
          :columns="permColumns"
          sticky-action-column
          search-placeholder="搜索权限信息"
          hide-filter
          hide-import
          hide-export
          wrap-cells
        >
          <template #table-action>
            <div>
              <q-btn
                unelevated
                dense
                label="添加权限"
                class="q-ml-sm q-px-md primary-btn"
                :disable="application.is_protected"
                @click="openPermissionForm"
              />
              <q-tooltip
                v-if="application.is_protected"
                anchor="bottom right"
                self="top right"
                max-width="200px"
              >
                该应用即为当前所在系统 FreeAuth，权限的变更应通过代码实现
              </q-tooltip>
            </div>
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
                  @delete="
                    deletePermissions([props.row], refreshPermissionData)
                  "
                />
              </div>
            </q-td>
          </template>
        </data-table>
      </q-tab-panel>
    </template>
    <template #dialog>
      <perm-form
        ref="createPermForm"
        :app-id="application.id"
        :action="FormAction.create"
        @refresh="refreshPermissionData"
      />
    </template>
  </profile-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import { AppOperationsMixin } from 'components/application/AppOperations';
import { Application } from 'components/application/type';
import { FormAction, FormComponent } from 'components/form/type';
import { PermOperationsMixin } from 'components/permission/PermOperations';
import { DataTableComponent } from 'components/table/type';

const permColumns: QTableProps['columns'] = [
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

export default defineComponent({
  name: 'AppProfile',

  mixins: [AppOperationsMixin, PermOperationsMixin],

  props: {
    appId: {
      type: String,
      default: null,
    },
  },

  setup() {
    return {
      application: ref<Application>({
        id: '',
      }),
      panelTab: ref('app'),
      permColumns: permColumns,
      FormAction,
    };
  },

  mounted() {
    this.loadAppInfo();
  },

  methods: {
    async loadAppInfo() {
      const resp = await this.$api.get(`/applications/${this.appId}`, {
        showProgress: true,
      });
      this.application = resp.data;
    },

    switchPanelTab(val: string) {
      if (val === 'perms') {
        setTimeout(() => {
          const pt = this.$refs.permsTable as DataTableComponent;
          pt.setApiInfo('/permissions/query', 'POST');
          pt.onExternalFiltered('application_id', this.application.id);
        }, 20);
      }
    },

    refreshApplicationData(op: string) {
      if (['disable', 'enable'].includes(op)) {
        this.loadAppInfo();
      } else if (op === 'delete') {
        this.$router.back();
      }
    },

    openPermissionForm() {
      (this.$refs.createPermForm as FormComponent).show();
    },

    refreshPermissionData() {
      (this.$refs.permsTable as DataTableComponent).fetchRows();
    },
  },
});
</script>
