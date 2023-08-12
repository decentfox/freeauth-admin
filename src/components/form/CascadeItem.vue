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
  <div style="width: auto">
    <q-item
      v-if="!scope.children || scope.children.length === 0"
      v-close-popup
      clickable
      :active="selected"
      @click="chooseItem"
    >
      <q-item-section>{{ scope[optLabel] }}</q-item-section>
    </q-item>
    <q-item v-else clickable :active="selected" @click="chooseItem">
      <q-item-section>{{ scope[optLabel] }}</q-item-section>
      <q-item-section v-if="scope.children" side>
        <q-icon name="chevron_right" />
      </q-item-section>
      <q-menu
        anchor="top end"
        self="top start"
        square
        style="min-height: 144px"
      >
        <q-list v-if="scope.children">
          <CascadeItem
            v-for="(child, idx) in scope.children"
            :key="idx"
            :scope="child"
            :selected="child.selected"
            :opt-label="optLabel"
            :opt-value="optValue"
            @update:model="
              (value: CascadeOption[]) => {
                onValueUpdated(value);
              }
            "
          />
        </q-list>
      </q-menu>
    </q-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { CascadeOption } from './type';

export default defineComponent({
  name: 'CascadeItem',

  props: {
    scope: {
      type: Object as PropType<CascadeOption>,
      default: () => {
        return {};
      },
    },
    optValue: {
      type: String,
      default: 'value',
    },
    optLabel: {
      type: String,
      default: 'label',
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    'update:model': (selected: CascadeOption[]) => {
      return selected.length >= 0;
    },
  },

  methods: {
    chooseItem() {
      this.$emit('update:model', [this.scope]);
    },

    onValueUpdated(selected: CascadeOption[]) {
      const newSelected = [this.scope].concat(selected);
      this.$emit('update:model', newSelected);
    },
  },
});
</script>
