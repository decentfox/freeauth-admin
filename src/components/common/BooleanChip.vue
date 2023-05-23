<template>
  <q-chip
    square
    size="12px"
    :label="value ? `${trueLabel}` : `${falseLabel}`"
    class="text-weight-bold q-pa-sm q-ml-none"
    :class="value ? 'chip-status-on' : 'chip-status-off'"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BooleanChip',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    trueLabel: {
      type: String,
      default: 'YES',
    },
    falseLabel: {
      type: String,
      default: 'NO',
    },
  },
});
</script>

<style lang="scss" scoped>
.chip-status-on {
  background-color: $blue-1;
  color: $blue-14;
}

.chip-status-off {
  background-color: $red-1;
  color: $red-8;
}

.body--dark {
  .chip-status-on {
    background-color: rgb(54, 72, 113);
    color: $blue-1;
  }

  .chip-status-off {
    background-color: #6f3a3a;
    color: $red-1;
  }
}
</style>
