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
