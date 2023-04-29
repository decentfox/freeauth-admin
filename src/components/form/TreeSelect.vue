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
          {{ node.label }}
        </q-chip>
      </template>
      <template v-if="!multiSelect && selectedNode">
        <q-chip color="primary" text-color="white" square>
          {{ selectedNode['label'] }}
        </q-chip>
      </template>
      <template v-if="tickedNodes.length === 0 && !selectedNode">
        <span class="text-grey-8">请选择所属上级部门</span>
      </template>
    </div>
    <q-popup-proxy ref="popup" :breakpoint="600" fit class="q-pa-sm">
      <q-tree
        v-if="multiSelect"
        ref="popupTree"
        v-model:ticked="ticked"
        :nodes="simple"
        node-key="id"
        selected-color="white"
        default-expand-all
        tick-strategy="strict"
        @update:ticked="nodeTicked"
      />
      <q-tree
        v-else
        ref="popupTree"
        v-model:selected="selected"
        :nodes="simple"
        node-key="id"
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
    simple: {
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

  setup() {
    return {
      selected: ref(null),
      ticked: ref([]),
      selectedNode: ref<QTreeNode>(),
      tickedNodes: ref<QTreeNode>([]),
    };
  },

  mounted() {
    if (!this.multiSelect && this.initialSelectedItems.length) {
      this.selectedNode = this.initialSelectedItems[0];
      this.selected = this.selectedNode ? this.selectedNode.id : null;
    }
  },

  methods: {
    nodeSelected() {
      this.selectedNode = (this.$refs.popupTree as QTree).getNodeByKey(
        this.selected
      );
      (this.$refs.popup as QPopupProxy).hide();
    },

    nodeTicked() {
      setTimeout(() => {
        this.tickedNodes = (this.$refs.popupTree as QTree).getTickedNodes();
      });
    },
  },
});
</script>

<style lang="scss" scoped></style>