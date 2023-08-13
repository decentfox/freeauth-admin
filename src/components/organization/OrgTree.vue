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
  <div class="q-pr-md">
    <org-type-select
      ref="orgTypeSelect"
      v-model="selectedOrgType"
      :editable="editable"
      @update:model-value="changeOrgType"
    >
      <template #create-action>
        <dropdown-button
          v-if="editable"
          btn-icon="add"
          btn-class="q-ml-sm secondary-btn"
          btn-style="width: 40px; height: 40px"
          :buttons="[
            {
              label: '组织类型',
              actionType: 'org_type',
            },
            {
              label: '企业机构',
              actionType: 'enterprise',
            },
            {
              label: '部门分支',
              actionType: 'department',
            },
          ]"
          @org-type="openOrgTypeForm()"
          @enterprise="openEnterpriseForm()"
          @department="openDepartmentForm()"
        />
      </template>
    </org-type-select>
    <q-separator spaced="sm" />
    <q-toolbar class="q-pa-none">
      <q-input
        ref="filterRef"
        v-model="filter"
        dense
        filled
        debounce="300"
        placeholder="搜索组织名称"
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
    </q-toolbar>
    <q-tab-panel
      name="structure"
      class="scroll q-px-none"
      style="height: calc(100vh - 270px)"
    >
      <q-tree
        ref="orgTree"
        :selected="selected"
        :nodes="orgTreeData"
        node-key="id"
        label-key="name"
        selected-color="white"
        :filter="filter"
        default-expand-all
        no-transition
        @update:selected="onNodeUpdated"
      >
        <template #default-header="prop">
          <div class="row items-center tree-item" style="width: 100%">
            <div class="row" style="width: calc(100% - 25px)">
              <q-icon v-if="prop.node.icon" :name="prop.node.icon" />
              <div
                class="q-pl-xs ellipsis"
                :style="prop.node.icon ? 'width: calc(100% - 25px)' : ''"
              >
                {{ prop.node.name }}
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
                  anchor="bottom right"
                  self="top right"
                  @hide="toggleMenu(prop.node.id)"
                >
                  <q-list dense>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="openDepartmentForm(undefined, prop.node.id)"
                    >
                      <q-item-section> 添加分支 </q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="
                        prop.node.is_enterprise
                          ? openEnterpriseForm(prop.node.id)
                          : openDepartmentForm(
                              prop.node.id,
                              prop.node.parent_id
                            )
                      "
                    >
                      <q-item-section> 编辑该项 </q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="
                        selected === prop.node.id
                          ? deleteOrganization(
                              prop.node,
                              refreshAfterDeletingSelectedOrg
                            )
                          : deleteOrganization(prop.node, refreshEnterprise)
                      "
                    >
                      <q-item-section> 删除该项 </q-item-section>
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
  <enterprise-form
    ref="enterpriseForm"
    :selected-org-type-id="selectedOrgType.id"
    @enterprise-updated="refreshEnterprise"
  />
  <department-form
    ref="departmentForm"
    :selected-org-type-id="selectedOrgType.id"
    @department-updated="loadOrgTree"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QInput, QTree, QTreeNode } from 'quasar';

import { OrgOperationsMixin } from './OrgOperations';
import {
  DepartmentFormComponent,
  EnterpriseFormComponent,
  OrgType,
  OrgTypeSelectComponent,
} from './type';

export default defineComponent({
  name: 'OrgTree',

  mixins: [OrgOperationsMixin],

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:selectNode', 'update:orgType', 'refresh'],

  setup() {
    return {
      // org selector
      selectedOrgType: ref<OrgType>({
        id: '',
        name: '',
      }),

      // tree
      selected: ref(''),
      filter: ref(''),
      filterRef: ref(null),
      orgTreeData: ref<QTreeNode[]>([]),
    };
  },

  methods: {
    async loadOrgTree(resetSelectedNode = false) {
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgType.id}/organization_tree`
      );
      this.orgTreeData = resp.data;
      setTimeout(() => {
        (this.$refs.orgTree as QTree).expandAll();
        if (resetSelectedNode) {
          this.onNodeUpdated(resp.data.length > 0 ? resp.data[0].id : '');
        }
      }, 20);
    },

    resetOrgFilter() {
      this.filter = '';
      (this.$refs.filterRef as QInput).focus();
    },

    toggleMenu(nodeId: string) {
      const moreBtn: HTMLElement | null = document.getElementById(
        'more' + nodeId
      );
      if (moreBtn) {
        moreBtn.style.visibility =
          moreBtn.style.visibility === 'visible' ? '' : 'visible';
      }
    },

    /** organization type related methods */
    openOrgTypeForm() {
      (this.$refs.orgTypeSelect as OrgTypeSelectComponent).openOrgTypeForm();
    },

    /** enterprise related methods */
    openEnterpriseForm(enterpriseId?: string) {
      (this.$refs.enterpriseForm as EnterpriseFormComponent).show(enterpriseId);
    },

    /** department or department related methods */
    openDepartmentForm(nodeId?: string, parentId?: string) {
      const node = (this.$refs.orgTree as QTree).getNodeByKey(parentId);
      (this.$refs.departmentForm as DepartmentFormComponent).show(nodeId, node);
    },

    refreshAfterDeletingSelectedOrg() {
      this.$emit('refresh', 'enterprise');
      this.loadOrgTree(true);
    },

    refreshEnterprise() {
      this.$emit('refresh', 'enterprise');
      this.loadOrgTree();
    },

    onNodeUpdated(selected: string) {
      if (!!selected) {
        this.selected = selected;
        const node = (this.$refs.orgTree as QTree).getNodeByKey(selected);
        this.$emit('update:selectNode', node);
      }
    },

    changeOrgType(selected: OrgType) {
      this.loadOrgTree(true);
      this.$emit('update:orgType', selected);
    },
  },
});
</script>

<style lang="scss" scoped>
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
</style>
