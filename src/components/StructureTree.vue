<template>
  <div class="q-px-md q-py-sm">
    <q-toolbar class="q-pa-none">
      <q-select
        ref="select"
        v-model="currentOrgType"
        :popup-content-style="`width: ${width}px; word-break: break-all;`"
        style="word-break: break-all"
        dense
        filled
        class="full-width"
        :options="orgTypeOptions"
        @popup-show="width = ($refs.select as QSelect).$el.offsetWidth"
        @update:model-value="changeOrgType"
      >
        <template #before-options>
          <q-item v-if="editable" clickable>
            <q-item-section>
              <q-item-label caption lines="1">
                <q-icon name="add" />
                添加组织类型
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption lines="1">
                {{ scope.opt.desc }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-toolbar>
    <q-separator spaced="sm" />

    <q-toolbar class="q-pa-none">
      <q-input
        ref="filterRef"
        v-model="filter"
        dense
        filled
        debounce="300"
        placeholder="搜索组织"
        class="full-width"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-icon
            v-if="filter !== ''"
            name="close"
            size="xs"
            class="cursor-pointer"
            @click="resetOrgFilter"
          />
        </template>
      </q-input>
      <q-space />
      <q-btn
        v-if="editable"
        unelevated
        class="q-ml-sm secondary-btn"
        label="创建"
        style="width: 75px; height: 40px"
      >
        <q-tooltip>新增组织</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-tab-panel
      name="structure"
      class="scroll q-px-none"
      style="height: calc(100vh - 200px)"
    >
      <q-tree
        ref="orgTree"
        v-model:selected="selected"
        :nodes="simple"
        node-key="id"
        selected-color="white"
        :filter="filter"
        default-expand-all
      >
        <template #default-header="prop">
          <div class="row items-center tree-item" style="width: 100%">
            <div class="row" style="width: calc(100% - 25px)">
              <q-icon v-if="prop.node.icon" :name="prop.node.icon" />
              <div
                class="q-pl-xs ellipsis"
                :style="prop.node.icon ? 'width: calc(100% - 25px)' : ''"
              >
                {{ prop.node.label }}
              </div>
            </div>
            <div v-if="editable" class="absolute-right">
              <q-btn
                :id="'more' + prop.node.id"
                icon="more_horiz"
                dense
                unelevated
                class="more-icon"
                size="xs"
                @click="toggleMenu(prop.node.id)"
                @click.stop
              >
                <q-menu
                  class="q-px-xs"
                  anchor="bottom left"
                  self="top middle"
                  @hide="toggleMenu(prop.node.id)"
                >
                  <q-list dense>
                    <q-item v-close-popup clickable class="q-my-xs">
                      <q-item-section> 添加分支 </q-item-section>
                    </q-item>
                    <!-- <q-separator inset /> -->
                    <q-item v-close-popup clickable class="q-my-xs">
                      <q-item-section> 编辑组织 </q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable class="q-my-xs">
                      <q-item-section> 删除组织 </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </template>
      </q-tree>
    </q-tab-panel>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QInput, QSelect, QTree } from 'quasar';
import { OrgTreeStructure, OrgTypeOption } from 'src/pages/type';

const structureData: OrgTreeStructure[] = [
  {
    label: '1. 北京分公司',
    id: 1,
    icon: 'account_balance',
    children: [
      {
        label: '1.1 产品部门',
        id: 2,
        children: [
          {
            label: '1.1.1 产品设计部门',
            id: 3,
          },
          {
            label: '1.1.2 产品研发部门',
            id: 4,
          },
        ],
      },
      {
        label: '1.2 成本部门',
        id: 5,
      },
      {
        label: '1.3 销售部门',
        id: 6,
      },
    ],
  },

  {
    label: '2. 上海分公司',
    id: 101,
    icon: 'account_balance',
    children: [
      {
        label: '2.1 产品部门',
        id: 102,
        children: [
          {
            label: '2.1.1 产品设计部门',
            id: 103,
            children: [
              {
                label: '2.1.1.1 视觉设计部',
                id: 104,
              },
              {
                label: '2.1.1.2 交互设计部',
                id: 107,
              },
            ],
          },
          {
            label: '2.1.2 产品研发部门',
            id: 111,
          },
        ],
      },
      {
        label: '2.2 市场部门',
        id: 112,
      },
      {
        label: '2.3 销售部门',
        id: 113,
      },
    ],
  },
];

const structureData2: OrgTreeStructure[] = [
  {
    label: '北京亚奥之星汽车服务有限公司',
    id: 21,
    icon: 'account_balance',
    children: [
      {
        label: '1.1 售前部门',
        id: 24,
      },
      {
        label: '1.2 售后部门',
        id: 25,
      },
      {
        label: '1.3 维修部门',
        id: 26,
      },
    ],
  },

  {
    label: '利星行平治（北京）汽车有限公司',
    id: 201,
    icon: 'account_balance',
    children: [
      {
        label: '2.1 销售部门',
        id: 211,
      },
      {
        label: '2.2 市场部门',
        id: 212,
      },
      {
        label: '2.3 机修部门',
        id: 213,
      },
    ],
  },
  {
    label: '盛元书院科技有限公司',
    id: 202,
    icon: 'account_balance',
  },
];

const orgData: OrgTypeOption[] = [
  {
    value: 1,
    label: '集团',
    desc: '亦庄盛元集团亦庄盛元集团亦庄盛元集团亦庄盛元集团亦庄盛元集团',
  },
  {
    value: 2,
    label: '经销商',
  },
  {
    value: 3,
    label: '物流商',
    desc: '合作的物流商',
  },
];

export default defineComponent({
  name: 'StructureTree',

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    return {
      // org selector
      orgTypeOptions: ref<OrgTypeOption[]>(orgData),
      currentOrgType: ref(orgData[0]),
      width: 0,

      // tree
      selected: ref(null),
      filter: ref(''),
      filterRef: ref(null),
      simple: ref<OrgTreeStructure[]>(structureData),
    };
  },

  methods: {
    resetOrgFilter() {
      this.filter = '';
      (this.$refs.filterRef as QInput).focus();
    },

    changeOrgType() {
      if (this.currentOrgType.value === 1) {
        this.simple = structureData;
      } else {
        this.simple = structureData2;
      }
      setTimeout(() => {
        (this.$refs.orgTree as QTree).expandAll();
      }, 20);
    },

    toggleMenu(nodeId: number) {
      const moreBtn: HTMLElement | null = document.getElementById(
        'more' + nodeId
      );
      if (moreBtn) {
        moreBtn.style.visibility =
          moreBtn.style.visibility === 'visible' ? '' : 'visible';
      }
    },
  },
});
</script>

<style lang="scss">
.splitter-drag-icon {
  height: 30px;
  display: flex;
  align-items: center;
  background-color: $info;
  border-radius: 2px;
}

.tree-item {
  .more-icon {
    visibility: hidden;
    right: 2px;
    top: 2px;
    background-color: rgba(255, 255, 255, 0.07);
  }

  &:hover {
    .more-icon {
      visibility: visible;
    }
  }
}

.q-tree__node--selected {
  background-color: $primary;
}

.frame-table {
  .sticky-table {
    max-height: 100%;
  }
}
</style>
