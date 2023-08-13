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
    v-for="(chip, idx) in chips"
    :key="idx"
    size="12px"
    :color="selectedChips.includes(chip.id) ? 'primary' : 'secondary'"
    :text-color="selectedChips.includes(chip.id) ? 'white' : ''"
    class="q-ml-none"
    :clickable="clickable"
    :square="square"
    @click="clickChip(chip)"
  >
    <span v-if="!!icon" class="material-icons-outlined q-pr-xs">
      {{ icon }}
    </span>
    {{ chip.name }}
  </q-chip>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { ChipGroupItem } from './type';

export default defineComponent({
  name: 'ChipChipGroup',

  props: {
    chips: {
      type: Array as PropType<ChipGroupItem[]>,
      default: () => {
        return [];
      },
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    square: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    selection: {
      type: String,
      default: 'single',
    },
  },

  emits: ['selectedChange'],

  setup() {
    return {
      selectedChips: ref<string[]>([]),
    };
  },

  methods: {
    clickChip(chip: ChipGroupItem) {
      if (!this.clickable) return;
      if (this.selection === 'multiple') {
        if (this.selectedChips.includes(chip.id)) {
          this.selectedChips = this.selectedChips.filter(
            (tid) => tid != chip.id
          );
        } else {
          this.selectedChips.push(chip.id);
        }
      } else if (this.selection === 'single') {
        this.selectedChips = this.selectedChips.includes(chip.id)
          ? []
          : [chip.id];
      }
      this.$emit('selectedChange', this.selectedChips);
    },
  },
});
</script>

<style lang="scss" scoped></style>
