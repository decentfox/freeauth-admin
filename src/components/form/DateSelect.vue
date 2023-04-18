<template>
  <q-select
    ref="select"
    v-model="model"
    :label="required ? `${label} *` : label"
    hide-dropdown-icon
    clearable
    menu-shrink
    :options="[1]"
    @clear="onClear"
  >
    <template #append>
      <q-icon name="event" />
    </template>
    <template #option>
      <q-date
        v-model="model"
        minimal
        mask="YYYY-MM-DD"
        @update:model-value="onValueUpdated"
      />
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QSelect } from 'quasar';

export default defineComponent({
  name: 'DateSelect',

  props: {
    modelValue: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      model: ref<string | null | undefined>(null),
    };
  },

  watch: {
    modelValue(val: string | null | undefined) {
      this.model = val;
    },
  },

  created() {
    this.model = this.modelValue;
  },

  methods: {
    onValueUpdated(val: string | null | undefined) {
      this.$emit('update:modelValue', val);
      if (!!val) {
        (this.$refs.select as QSelect).hidePopup();
      }
    },

    onClear() {
      this.onValueUpdated(null);
    },
  },
});
</script>

<style lang="scss" scoped></style>
