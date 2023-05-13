<template>
  <q-select
    v-model="model"
    :label="required ? `${label} *` : label"
    :disable="onlyOneOption"
    :options="options"
    :clearable="!required"
    square
    stack-label
    menu-shrink
    class="full-width"
    popup-content-style="min-height: 144px"
    v-bind="$attrs"
    @clear="clearCascader"
  >
    <template #option="scope">
      <cascade-item
        :scope="scope.opt"
        :selected="isOptionSelected(scope.opt)"
        :opt-label="optLabel"
        :opt-value="optValue"
        @update:model="onValueUpdated"
      />
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { CascadeOption } from './type';

export default defineComponent({
  name: 'CascadeSelect',

  props: {
    modelValue: {
      type: Array as PropType<CascadeOption[]>,
      default: null,
    },
    options: {
      type: Array as PropType<CascadeOption[]>,
      default: () => {
        return [];
      },
    },
    label: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    optValue: {
      type: String,
      default: () => 'value',
    },
    optLabel: {
      type: String,
      default: () => 'label',
    },
  },

  emits: {
    'update:modelValue': (selected: CascadeOption[]) => {
      return selected.length >= 0;
    },
  },

  setup() {
    return {
      selectedOptions: ref<CascadeOption[]>([]),
      model: ref<string | null>(null),
      onlyOneOption: ref(false),
    };
  },

  created() {
    let opts = this.options;
    let selected = [];
    let onlyOneOption = true;
    while (onlyOneOption && opts.length > 0) {
      onlyOneOption = opts.length === 1;
      selected.push(opts[0]);
      opts = opts[0].children || [];
    }
    this.onlyOneOption = onlyOneOption;
    if (this.modelValue.length > 0) {
      this.onValueUpdated(this.modelValue);
    } else if (onlyOneOption) {
      this.onValueUpdated(selected);
    } else if (selected.length > 0) {
      this.onValueUpdated([selected[0]]);
    }
  },

  methods: {
    clearCascader() {
      this.model = null;
    },

    onValueUpdated(val: CascadeOption[]) {
      this.selectedOptions = val;
      this.model = val.map((z) => z[this.optLabel]).join(' / ');
      this.$emit('update:modelValue', val);
    },

    isOptionSelected(opt: CascadeOption): boolean {
      return (
        this.selectedOptions.filter(
          (z) => z[this.optValue] === opt[this.optValue]
        ).length > 0
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>
