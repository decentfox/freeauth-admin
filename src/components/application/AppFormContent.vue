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
    <div>
      <field-label text="应用名称" required />
      <q-input
        :model-value="modelValue.name"
        filled
        dense
        placeholder="请填写应用名称"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="(val: string  | number | null) => onModelUpdated('name', val)"
      />
    </div>
    <div>
      <field-label text="应用描述" />
      <q-input
        :model-value="modelValue.description"
        filled
        dense
        type="textarea"
        placeholder="请填写应用描述"
        hide-bottom-space
        @update:model-value="(val: string  | number | null) => onModelUpdated('description', val)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { ApplicationPostData, ApplicationPostError } from './type';

export default defineComponent({
  name: 'AppFormContent',

  props: {
    /** 应用表单数据结构 */
    modelValue: {
      type: Object as PropType<ApplicationPostData>,
      default: () => {
        return {};
      },
    },
    /** 应用表单错误提示 */
    formError: {
      type: Object as PropType<ApplicationPostError>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {};
  },

  methods: {
    onModelUpdated(field: string, val: string | number | string[] | null) {
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
