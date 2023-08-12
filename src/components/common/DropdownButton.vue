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
  <q-btn
    no-caps
    flat
    dense
    :class="btnClass"
    :style="btnStyle"
    :label="btnLabel"
    :icon="btnIcon"
  >
    <q-menu class="q-px-xs" anchor="bottom right" self="top right">
      <q-list dense>
        <q-item
          v-for="button in buttons"
          :key="button.label"
          v-close-popup
          v-bind="button"
          clickable
          class="q-my-xs"
          :disable="button.disable"
          @click="$emit(button.actionType.replace('_', '-'))"
        >
          <q-item-section v-if="button.icon" avatar class="q-pr-none">
            <q-icon :name="button.icon" size="18px" />
          </q-item-section>
          <q-item-section> {{ button.label }} </q-item-section>
          <q-tooltip
            v-if="button.disable"
            anchor="bottom left"
            self="center start"
          >
            {{ button.disableHint }}
          </q-tooltip>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { MenuButton } from './type';

export default defineComponent({
  name: 'DropdownButton',

  props: {
    btnIcon: {
      type: String,
      default: 'more_horiz',
    },
    btnLabel: {
      type: String,
      default: '',
    },
    btnClass: {
      type: String,
      default: 'text-black-white',
    },
    btnStyle: {
      type: String,
      default: '',
    },
    buttons: {
      type: Array as PropType<MenuButton[]>,
      default: () => {
        return [];
      },
    },
  },

  methods: {},
});
</script>

<style lang="scss" scoped></style>
