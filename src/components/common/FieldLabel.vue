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
  <q-item-label class="text-caption hint-label">
    {{ text }}
    <q-icon
      v-if="required"
      name="emergency"
      size="8px"
      color="negative"
      class="assistant-icon"
    />
    <q-icon
      v-if="hint"
      name="error_outline"
      size="14px"
      class="q-ml-xs assistant-icon"
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
    text: {
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

<style lang="scss" scoped>
.assistant-icon {
  vertical-align: top;
}
</style>
