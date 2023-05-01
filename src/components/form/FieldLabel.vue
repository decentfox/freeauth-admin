<template>
  <q-item-label class="text-caption hint-label">
    {{ name }}
    <q-icon
      v-if="required"
      name="emergency"
      size="8px"
      color="negative"
      style="vertical-align: top"
    />
    <q-icon
      v-if="hint"
      name="error_outline"
      size="14px"
      class="q-ml-xs"
      style="vertical-align: top"
    >
      <q-tooltip anchor="center right" self="center start">
        {{ hint }}
      </q-tooltip>
    </q-icon>
  </q-item-label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FieldLabel',

  props: {
    name: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    hint: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped></style>
