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
  <q-field dense filled>
    <template #append>
      <q-icon name="arrow_drop_down" />
    </template>
    <div class="items-center row" tabindex="0">
      <template v-if="multiSelect && tickedNodes.length > 0">
        <q-chip
          v-for="(node, idx) in tickedNodes"
          :key="idx"
          color="primary"
          text-color="white"
          dense
          square
        >
          {{ node.name }}
        </q-chip>
      </template>
      <template v-if="!multiSelect && !!selectedNode.id">
        <q-chip color="primary" text-color="white" dense square>
          {{ selectedNode.name }}
        </q-chip>
      </template>
      <template v-if="tickedNodes.length === 0 && !selectedNode.id">
        <span class="field-placeholder">请选择所属上级部门</span>
      </template>
    </div>
    <q-popup-proxy ref="popup" :breakpoint="600" fit class="q-pa-sm">
      <q-tree
        v-if="multiSelect"
        ref="popupTree"
        v-model:ticked="ticked"
        :nodes="nodes"
        node-key="id"
        label-key="name"
        selected-color="white"
        default-expand-all
        no-transition
        tick-strategy="strict"
        @update:ticked="nodeTicked"
      />
      <q-tree
        v-else
        ref="popupTree"
        v-model:selected="selected"
        :nodes="nodes"
        node-key="id"
        label-key="name"
        selected-color="white"
        default-expand-all
        no-transition
        @update:selected="nodeSelected"
      />
    </q-popup-proxy>
  </q-field>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { QPopupProxy, QTree, QTreeNode } from 'quasar';

export default defineComponent({
  name: 'TreeSelect',

  props: {
    nodes: {
      type: Array as PropType<QTreeNode[]>,
      default: () => {
        return [];
      },
    },

    multiSelect: {
      type: Boolean,
      default: false,
    },

    initialSelectedItems: {
      type: Array as PropType<QTreeNode[]>,
      default: () => {
        return [];
      },
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      selected: ref(null),
      ticked: ref<string[]>([]),
      selectedNode: ref<QTreeNode>({}),
      tickedNodes: ref<QTreeNode>([]),
    };
  },

  watch: {
    nodes() {
      this.resetTree();
      this.initTree();
    },
  },

  mounted() {
    this.initTree();
  },

  unmounted() {
    this.resetTree();
  },

  methods: {
    resetTree() {
      this.selected = null;
      this.ticked = [];
      this.selectedNode = {};
      this.tickedNodes = [];
    },

    initTree() {
      if (!this.multiSelect && this.initialSelectedItems.length) {
        this.selectedNode = this.initialSelectedItems[0];
        this.selected = this.selectedNode ? this.selectedNode.id : null;
      }
      if (this.multiSelect && this.initialSelectedItems.length) {
        this.tickedNodes = this.initialSelectedItems;
        this.ticked = this.initialSelectedItems.map(
          (item: QTreeNode) => item.id
        );
      }
    },

    nodeSelected() {
      this.selectedNode = (this.$refs.popupTree as QTree).getNodeByKey(
        this.selected
      );
      this.$emit('update:modelValue', this.selected);
      (this.$refs.popup as QPopupProxy).hide();
    },

    nodeTicked() {
      this.$emit('update:modelValue', this.ticked);
      setTimeout(() => {
        this.tickedNodes = (this.$refs.popupTree as QTree).getTickedNodes();
      }, 20);
    },
  },
});
</script>

<style lang="scss" scoped></style>
