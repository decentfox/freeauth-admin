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
  <form-dialog
    ref="departmentDialog"
    v-model="departmentForm"
    title="部门分支"
    width="450px"
    @confirm="saveDepartmentForm"
    @close="resetDepartmentForm"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <div>
          <field-label text="所属上级部门" required />
          <tree-select
            v-model="departmentFormData.parent_id"
            :nodes="orgTreeData"
            :initial-selected-items="parentDepartment"
            :disable="parentDepartment.length !== 0"
          />
          <div
            v-if="!!departmentFormError.parent_id"
            class="error-hint text-negative"
          >
            {{ departmentFormError.parent_id }}
          </div>
        </div>
        <div>
          <field-label text="部门名称" required />
          <q-input
            v-model="departmentFormData.name"
            filled
            dense
            placeholder="请填写部门名称"
            hide-bottom-space
            :error="!!departmentFormError.name"
            :error-message="departmentFormError.name"
          />
        </div>
        <div>
          <field-label
            text="部门 Code"
            hint="部门分支的唯一标识符，同一企业机构下唯一，可用于获取部门信息"
          />
          <q-input
            v-model="departmentFormData.code"
            filled
            dense
            placeholder="请填写部门代码"
            hide-bottom-space
            :error="!!departmentFormError.code"
            :error-message="departmentFormError.code"
          />
        </div>
        <div>
          <field-label text="部门描述" />
          <q-input
            v-model="departmentFormData.description"
            filled
            dense
            type="textarea"
            placeholder="请填写部门描述"
            hide-bottom-space
          />
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTreeNode } from 'quasar';

import { FormDialogComponent } from '../dialog/type';

import { Department, DepartmentPostData, DepartmentPostError } from './type';

export default defineComponent({
  name: 'OrgTypeForm',

  props: {
    /** 当前操作所在组织类型 */
    selectedOrgTypeId: {
      type: String,
      default: '',
    },
  },

  emits: ['departmentUpdated'],

  setup() {
    return {
      orgTreeData: ref<QTreeNode[]>([]),
      departmentForm: ref(false),
      departmentFormData: ref<DepartmentPostData>({}),
      departmentFormError: ref<DepartmentPostError>({}),
      operatedDepartment: ref<Department>({
        id: '',
        name: '',
        parent_id: '',
      }),
      parentDepartment: ref<QTreeNode[]>([]),
    };
  },

  methods: {
    async loadOrgTree() {
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgTypeId}/organization_tree`
      );
      this.orgTreeData = resp.data;
    },

    async show(nodeId?: string, parentNode?: QTreeNode) {
      this.loadOrgTree();
      if (parentNode) {
        this.departmentFormData.parent_id = parentNode.id;
        this.parentDepartment = [parentNode];
      } else {
        this.parentDepartment = [];
      }
      if (nodeId) {
        const resp = await this.$api.get(`/departments/${nodeId}`);
        this.operatedDepartment = resp.data;
        this.departmentFormData = {
          name: resp.data.name,
          description: resp.data.description,
          parent_id: resp.data.parent.id,
          code: resp.data.code,
        };
      }
      this.departmentForm = true;
    },

    async saveDepartmentForm() {
      try {
        this.departmentFormError = {};
        if (!this.operatedDepartment.id) {
          await this.$api.post('/departments', this.departmentFormData, {
            successMsg: '部门分支创建成功',
          });
        } else {
          await this.$api.put(
            `/departments/${this.operatedDepartment.id}`,
            this.departmentFormData,
            {
              successMsg: '部门分支更新成功',
            }
          );
        }
        (this.$refs.departmentDialog as FormDialogComponent).hide();
        this.$emit('departmentUpdated');
        this.resetDepartmentForm();
      } catch (e) {
        this.departmentFormError = (e as Error).cause || {};
      }
    },

    resetDepartmentForm() {
      this.departmentFormError = {};
      this.departmentFormData = {};
      this.parentDepartment = [];
      this.operatedDepartment = {
        id: '',
        name: '',
        parent_id: '',
      };
    },
  },
});
</script>

<style lang="scss" scoped></style>
