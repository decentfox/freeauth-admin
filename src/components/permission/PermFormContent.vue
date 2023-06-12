<template>
  <div class="q-col-gutter-md q-pa-md">
    <div>
      <field-label text="所属应用" required hint="创建后不支持变更" />
      <q-select
        :model-value="modelValue.application_id"
        :options="appOptions"
        dense
        filled
        class="full-width"
        option-label="name"
        option-value="id"
        emit-value
        map-options
        :disable="!!appId"
        hide-bottom-space
        :error="!!formError.application_id"
        :error-message="formError.application_id"
        @update:model-value="(val: string) => onModelUpdated('application_id', val)"
      />
    </div>
    <div>
      <field-label text="权限名称" required />
      <q-input
        :model-value="modelValue.name"
        filled
        dense
        placeholder="请填写权限名称"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="(val: string) => onModelUpdated('name', val)"
      />
    </div>
    <div>
      <field-label
        text="权限 Code"
        required
        hint="权限的唯一标识符，可用于获取权限信息"
      />
      <q-input
        :model-value="modelValue.code"
        filled
        dense
        placeholder="请填写权限代码"
        hide-bottom-space
        :error="!!formError.code"
        :error-message="formError.code"
        @update:model-value="(val: string) => onModelUpdated('code', val)"
      />
    </div>
    <div>
      <field-label text="权限标签" />
      <q-select
        ref="tags"
        :model-value="modelValue.tags"
        filled
        dense
        use-input
        use-chips
        option-label="name"
        option-value="name"
        emit-value
        map-options
        multiple
        input-debounce="0"
        :options="tagOptions"
        @new-value="createValue"
        @filter="filterFn"
        @click="loadTagOptions"
        @update:model-value="(val: string[]) => onModelUpdated('tags', val)"
      />
    </div>
    <div>
      <field-label text="权限描述" />
      <q-input
        :model-value="modelValue.description"
        filled
        dense
        type="textarea"
        placeholder="请填写权限描述"
        hide-bottom-space
        @update:model-value="(val: string) => onModelUpdated('description', val)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { Application } from '../application/type';
import { Tag } from '../tag/type';

import { PermissionPostData, PermissionPostError } from './type';

export default defineComponent({
  name: 'PermFormContent',

  props: {
    /** 指定权限所属应用 */
    appId: {
      type: String,
      default: '',
    },
    /** 权限表单数据结构 */
    modelValue: {
      type: Object as PropType<PermissionPostData>,
      default: () => {
        return {};
      },
    },
    /** 权限表单错误提示 */
    formError: {
      type: Object as PropType<PermissionPostError>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      appOptions: ref<Application[]>([]),
      initialTagOptions: ref<Tag[]>([]),
      tagOptions: ref<Tag[]>([]),
    };
  },

  mounted() {
    this.loadAppOptions();
  },

  methods: {
    async loadAppOptions() {
      const resp = await this.$api.get('/applications/options');
      this.appOptions = resp.data;
    },

    async loadTagOptions() {
      const resp = await this.$api.get('/permission_tags');
      this.initialTagOptions = resp.data.permission_tags;
      this.tagOptions = resp.data.permission_tags;
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

    onModelUpdated(field: string, val: string | string[] | null) {
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
