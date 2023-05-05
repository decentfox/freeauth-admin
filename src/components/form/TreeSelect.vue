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
      <template v-if="!multiSelect && selectedNode">
        <q-chip color="primary" text-color="white" square>
          {{ selectedNode.name }}
        </q-chip>
      </template>
      <template v-if="tickedNodes.length === 0 && !selectedNode">
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
      selectedNode: ref<QTreeNode>(),
      tickedNodes: ref<QTreeNode>([]),
    };
  },

  mounted() {
    if (!this.multiSelect && this.initialSelectedItems.length) {
      this.selectedNode = this.initialSelectedItems[0];
      this.selected = this.selectedNode ? this.selectedNode.id : null;
    }
    if (this.multiSelect && this.initialSelectedItems.length) {
      this.tickedNodes = this.initialSelectedItems;
      this.ticked = this.initialSelectedItems.map((item: QTreeNode) => item.id);
    }
  },

  methods: {
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
