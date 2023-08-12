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
  <div class="q-col-gutter-md q-pa-md">
    <q-option-group
      v-model="selectType"
      inline
      class="q-px-md"
      :disable="isUpdate"
      :options="[
        { label: '全局可选角色', value: 'global' },
        { label: '指定组织类型下可选角色', value: 'org_type' },
      ]"
    />
    <div v-if="selectType === 'org_type'">
      <field-label text="所属组织类型" required />
      <q-select
        :model-value="modelValue.org_type_id"
        :options="orgTypeOptions"
        dense
        filled
        class="full-width"
        option-label="name"
        option-value="id"
        emit-value
        map-options
        hide-bottom-space
        :disable="isUpdate"
        :rules="[(val: string) => !!val || '请选择所属组织类型']"
        @update:model-value="(val: string) => onModelUpdated('org_type_id', val)"
      />
    </div>
    <div>
      <field-label text="角色名称" required />
      <q-input
        :model-value="modelValue.name"
        filled
        dense
        placeholder="请填写角色名称"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="(val: string | number | null) => onModelUpdated('name', val)"
      />
    </div>
    <div>
      <field-label
        text="角色 Code"
        hint="角色的唯一标识符，可用于获取角色信息"
      />
      <q-input
        :model-value="modelValue.code"
        filled
        dense
        placeholder="请填写角色代码"
        hide-bottom-space
        :error="!!formError.code"
        :error-message="formError.code"
        @update:model-value="(val: string  | number | null) => onModelUpdated('code', val)"
      />
    </div>
    <div>
      <field-label text="角色描述" />
      <q-input
        :model-value="modelValue.description"
        filled
        dense
        type="textarea"
        placeholder="请填写角色描述"
        hide-bottom-space
        @update:model-value="(val: string | number | null) => onModelUpdated('description', val)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { FormAction } from '../form/type';
import { OrgType } from '../organization/type';

import { RolePostData, RolePostError } from './type';

export default defineComponent({
  name: 'RoleFormContent',

  props: {
    /** 角色表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 角色表单数据结构 */
    modelValue: {
      type: Object as PropType<RolePostData>,
      default: () => {
        return {};
      },
    },
    /** 角色表单错误提示 */
    formError: {
      type: Object as PropType<RolePostError>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:modelValue'],

  setup(props) {
    return {
      orgTypeOptions: ref<OrgType[]>([]),
      selectType: ref(!!props.modelValue.org_type_id ? 'org_type' : 'global'),
    };
  },

  computed: {
    isUpdate(): boolean {
      return this.action === FormAction.update;
    },
  },

  watch: {
    'modelValue.org_type_id'(val) {
      this.selectType = !!val ? 'org_type' : 'global';
    },
  },

  mounted() {
    this.loadOrgTypes();
  },

  methods: {
    async loadOrgTypes() {
      const resp = await this.$api.get('/org_types');
      this.orgTypeOptions = resp.data.org_types;
    },

    onModelUpdated(field: string, val: string | number | boolean | null) {
      this.$emit(
        'update:modelValue',
        Object.assign({}, this.modelValue, {
          [field]: val,
        })
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>
