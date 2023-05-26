<template>
  <div class="q-col-gutter-md q-pa-md">
    <q-option-group
      v-model="selectType"
      inline
      class="q-px-md"
      :disable="action === FormAction.update"
      :options="[
        { label: '全局可选角色', value: 'global' },
        { label: '指定组织类型下可选角色', value: 'org_type' },
      ]"
    />
    <div v-if="selectType === 'org_type'">
      <field-label text="所属组织类型" required />
      <q-select
        :model-value="formData.org_type_id"
        :options="orgTypeOptions"
        dense
        filled
        class="full-width"
        option-label="name"
        option-value="id"
        emit-value
        map-options
        hide-bottom-space
        :disable="action === FormAction.update"
        :rules="[(val) => !!val || '请选择所属组织类型']"
        @update:model-value="
          (value) => {
            $emit('update:org_type_id', value);
          }
        "
      />
    </div>
    <div>
      <field-label text="角色名称" required />
      <q-input
        :model-value="formData.name"
        filled
        dense
        placeholder="请填写角色名称"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="
          (value) => {
            $emit('update:name', value);
          }
        "
      />
    </div>
    <div>
      <field-label
        text="角色 Code"
        hint="角色的唯一标识符，可用于获取角色信息"
      />
      <q-input
        :model-value="formData.code"
        filled
        dense
        placeholder="请填写角色代码"
        hide-bottom-space
        :error="!!formError.code"
        :error-message="formError.code"
        @update:model-value="
          (value) => {
            $emit('update:code', value);
          }
        "
      />
    </div>
    <div>
      <field-label text="角色描述" />
      <q-input
        :model-value="formData.description"
        filled
        dense
        type="textarea"
        placeholder="请填写角色描述"
        hide-bottom-space
        @update:model-value="
          (value) => {
            $emit('update:description', value);
          }
        "
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
    formData: {
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

  emits: [
    'update:org_type_id',
    'update:name',
    'update:code',
    'update:description',
  ],

  setup() {
    return {
      FormAction,
      orgTypeOptions: ref<OrgType[]>([]),
      selectType: ref('global'),
    };
  },

  watch: {
    formData() {
      if (this.action === FormAction.update)
        this.selectType = !!this.formData.org_type_id ? 'org_type' : 'global';
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
  },
});
</script>

<style lang="scss" scoped></style>
