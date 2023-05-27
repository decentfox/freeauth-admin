<template>
  <q-select
    ref="select"
    v-model="selected"
    :options="options"
    :placeholder="placeholder"
    :option-value="optValue"
    :option-label="optLabel"
    filled
    dense
    use-input
    hide-dropdown-icon
    hide-bottom-space
    multiple
    map-options
    virtual-scroll-slice-size="5"
    @filter="searchOptions"
    @update:model-value="(value) => clearFilter(value)"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey"> 找不到任何匹配项 </q-item-section>
      </q-item>
    </template>
    <template #selected-item="scope">
      <q-chip
        removable
        dense
        :tabindex="scope.tabindex"
        color="primary"
        text-color="white"
        class="q-pa-sm"
        :label="scope.opt.name"
        @remove="scope.removeAtIndex(scope.index)"
      />
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <boolean-chip
            :value="!scope.opt.is_deleted"
            true-label="正常"
            false-label="禁用"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ scope.opt[optLabel] }}
            {{ scope.opt.username }}
          </q-item-label>
          <q-item-label caption>
            {{ scope.opt.mobile }}
            {{ scope.opt.email }}
          </q-item-label>
          <slot name="option-caption-label" :opt="scope.opt" />
        </q-item-section>
        <q-item-section v-if="!!scope.opt.org_type" side>
          <chip-group :chips="[scope.opt.org_type]" square />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect } from 'quasar';

export default defineComponent({
  name: 'SearchableMultipleSelect',

  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {};
      },
    },
    optValue: {
      type: String,
      default: 'id',
    },
    optLabel: {
      type: String,
      default: 'name',
    },
    placeholder: {
      type: String,
      default: '输入关键字进行搜索',
    },
    optionApiUrl: {
      type: String,
      default: null,
    },
    optionApiParams: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      options: ref([]),
      selected: ref({}),
    };
  },

  created() {
    this.selected = this.modelValue;
  },

  methods: {
    searchOptions(
      val: string,
      update: (fn: () => void) => void,
      abort: () => void
    ) {
      const kw = val.trim();
      if (kw === '') {
        abort();
        return;
      }
      update(async () => {
        const resp = await this.$api.post(
          this.optionApiUrl,
          Object.assign({}, this.optionApiParams, {
            q: kw,
          })
        );
        this.options = resp.data.rows;
      });
    },

    clearFilter(val: string) {
      this.$emit('update:modelValue', val);
      (this.$refs.select as QSelect).updateInputValue('');
    },
  },
});
</script>

<style lang="scss" scoped></style>
