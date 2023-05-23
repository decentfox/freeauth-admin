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
          v-model="selectedAppId"
          :options="appOptions"
          dense
          filled
          class="full-width q-pr-sm"
          option-label="name"
          option-value="id"
          emit-value
          map-options
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
        />
        <q-btn
          unelevated
          dense
          label="创建权限"
          class="q-ml-sm q-px-md primary-btn"
          @click="openPermissionForm"
        />
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
          <q-chip
            v-for="(tag, idx) in props.row.tags"
            :key="idx"
            size="12px"
            color="secondary"
            class="q-ml-none"
          >
            <span class="material-icons-outlined q-pr-xs"> local_offer </span>
            {{ tag.name }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-application="props">
        <q-td :props="props">
          <q-chip
            size="12px"
            square
            color="secondary"
            class="q-ml-none"
            :label="props.row.application.name"
          />
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
                  label: !props.row.is_deleted ? '禁用权限' : '启用权限',
                  icon: !props.row.is_deleted
                    ? 'remove_circle_outline'
                    : 'task_alt',
                  actionType: !props.row.is_deleted ? 'disable' : 'enable',
                },
                {
                  label: '删除权限',
                  icon: 'delete_outline',
                  actionType: 'delete',
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
    <form-dialog
      ref="permissionDialog"
      v-model="permissionForm"
      title="创建权限"
      width="450px"
      @confirm="savePermissionForm"
      @close="resetPermissionForm"
    >
      <template #form-content>
        <div class="q-col-gutter-md q-pa-md">
          <div>
            <field-label
              name="所属应用"
              required
              hint="如需切换，请关闭对话框，对表格左上方选择器进行操作"
            />
            <q-select
              v-model="selectedAppId"
              :options="appOptions"
              dense
              filled
              class="full-width"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              disable
              hide-bottom-space
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
      </template>
    </form-dialog>
  </page-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, QTableProps } from 'quasar';

import { FormDialogComponent } from 'components/dialog/type';
import { PermOperationsMixin } from 'components/permission/PermOperations';
import {
  DataTableComponent,
  FilterColumn,
  FilterOperator,
} from 'components/table/type';

import { Application, Tag } from '../type';

import { PermissionPostData, PermissionPostError } from './type';

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

      permissionForm: ref(false),
      permissionFormData: ref<PermissionPostData>({}),
      permissionFormError: ref<PermissionPostError>({}),

      selectedAppId: ref(''),
      appOptions: ref<Application[]>([]),

      initialTagOptions: ref<Tag[]>([]),
      tagOptions: ref<Tag[]>([]),
      selectedTags: ref<string[]>([]),
    };
  },

  mounted() {
    this.loadApplicationOptions();
  },

  methods: {
    async loadApplicationOptions() {
      const resp = await this.$api.post('/applications/query', {});
      this.appOptions = resp.data.rows;
      this.selectedAppId = this.appOptions[0].id;
      this.loadPermissionsbyApp();
    },

    async loadPermissionsbyApp() {
      setTimeout(() => {
        const et = this.$refs.permissionTable as DataTableComponent;
        et.setApiInfo('/permissions/query', 'POST');
        et.onExternalFiltered('application_id', this.selectedAppId);
      }, 20);
    },

    async openPermissionForm() {
      this.permissionForm = true;
      const resp = await this.$api.get('/permission_tags');
      this.initialTagOptions = resp.data.permission_tags;
      this.tagOptions = resp.data.permission_tags;
    },

    async savePermissionForm() {
      try {
        this.permissionFormError = {};
        this.permissionFormData.application_id = this.selectedAppId;
        this.permissionFormData.existing_tag_ids = this.selectedTags.filter(
          (tag) => this.initialTagOptions.map((t) => t.id).includes(tag)
        );
        this.permissionFormData.new_tags = this.selectedTags.filter(
          (tag) => !this.initialTagOptions.map((t) => t.id).includes(tag)
        );
        await this.$api.post('/permissions', this.permissionFormData, {
          successMsg: '权限创建成功',
        });
        (this.$refs.permissionDialog as FormDialogComponent).hide();
        this.refreshPermissionData();
        this.resetPermissionForm();
      } catch (e) {
        this.permissionFormError = (e as Error).cause || {};
      }
    },

    resetPermissionForm() {
      this.permissionFormData = {};
      this.permissionFormError = {};
      this.selectedTags = [];
    },

    refreshPermissionData() {
      (this.$refs.permissionTable as DataTableComponent).fetchRows();
    },

    goToPermissionProfile(evt: Event, permId: string) {
      this.$router.push(`/perm_profile/${permId}`);
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

<style lang="scss" scoped></style>
