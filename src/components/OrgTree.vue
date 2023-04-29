<template>
  <div class="q-px-md q-py-sm">
    <q-toolbar class="q-pa-none">
      <q-select
        ref="orgTypeSelect"
        v-model="selectedOrgType"
        :popup-content-style="`width: ${width}px; word-break: break-all;`"
        style="word-break: break-all"
        dense
        filled
        class="full-width"
        :options="orgTypeOptions"
        @popup-show="width = ($refs.orgTypeSelect as QSelect).$el.offsetWidth"
        @update:model-value="changeOrgType"
      >
        <template #before-options>
          <q-item v-if="editable" clickable>
            <q-item-section>
              <q-item-label caption lines="1">
                <q-icon size="16px" name="edit_note" />
                管理组织类型
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
      <q-space />
      <dropdown-button
        v-if="editable"
        btn-label="创建"
        btn-icon="add"
        btn-class="q-ml-sm secondary-btn"
        btn-style="width: 75px; height: 40px"
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
            actionType: 'branch',
          },
        ]"
        @menu-click="createObject"
      />
    </q-toolbar>
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
                  anchor="bottom right"
                  self="top right"
                  @hide="toggleMenu(prop.node.id)"
                >
                  <q-list dense>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="createBranch(prop.node.id)"
                    >
                      <q-item-section> 添加分支 </q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="
                        prop.node.enterpriseId
                          ? editEnterprise(prop.node.enterpriseId)
                          : editBranch(prop.node.id)
                      "
                    >
                      <q-item-section> 编辑该项 </q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      class="q-my-xs"
                      @click="deleteBranch(prop.node.id)"
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
  <form-dialog
    ref="createOrgTypeDialog"
    v-model="createOrgTypeForm"
    title="组织类型"
    width="450px"
  >
    <template #form-content>
      <div class="q-col-gutter-sm q-pa-md">
        <div>
          <q-item-label class="text-caption hint-label">
            组织类型名称
          </q-item-label>
          <q-input
            v-model="newOrgType.name"
            filled
            dense
            placeholder="请填写组织类型名称，如：合作商家"
            hide-bottom-space
          />
        </div>
        <div>
          <q-item-label class="text-caption hint-label">
            组织类型描述
          </q-item-label>
          <q-input
            v-model="newOrgType.desc"
            filled
            dense
            type="textarea"
            placeholder="请填写组织类型描述"
            hide-bottom-space
          />
        </div>
      </div>
    </template>
  </form-dialog>
  <form-dialog
    ref="createEnterpriseDialog"
    v-model="createEnterpriseForm"
    title="企业机构"
    width="450px"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <q-item-section>
          <q-item-label class="text-caption hint-label">
            企业税务信息
          </q-item-label>
          <div class="q-gutter-sm">
            <q-input
              v-model="newEnterprise.name"
              filled
              dense
              placeholder="请填写企业名称"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="newEnterprise.taxId"
              filled
              dense
              placeholder="请填写15、18或20位纳税识别号"
              hide-bottom-space
              class="col"
            />
          </div>
        </q-item-section>
        <q-separator />
        <q-item-section>
          <q-item-label class="text-caption hint-label">
            企业银行信息
          </q-item-label>
          <div class="q-gutter-sm">
            <q-input
              v-model="newEnterprise.issuingBank"
              filled
              dense
              placeholder="请填写开户行名称"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="newEnterprise.bankAccountNumber"
              filled
              dense
              placeholder="请填写银行账号"
              hide-bottom-space
              class="col"
            />
          </div>
        </q-item-section>
        <q-separator />
        <q-item-section>
          <q-item-label class="text-caption hint-label">
            企业办公信息
          </q-item-label>
          <div class="q-gutter-sm">
            <q-input
              v-model="newEnterprise.contactAddress"
              filled
              dense
              placeholder="请填写办公地址"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="newEnterprise.contactPhoneNum"
              filled
              dense
              placeholder="请填写办公电话"
              hide-bottom-space
              class="col"
            />
          </div>
        </q-item-section>
      </div>
    </template>
  </form-dialog>
  <form-dialog
    ref="createBranchDialog"
    v-model="createBranchForm"
    title="部门分支"
    width="450px"
  >
    <template #form-content>
      <div class="q-col-gutter-sm q-pa-md">
        <div>
          <q-item-label class="text-caption hint-label">
            上级部门
          </q-item-label>
          <tree-select
            :simple="simple"
            :initial-selected-items="editedBranch"
          />
        </div>
        <div>
          <q-item-label class="text-caption hint-label">
            部门名称
          </q-item-label>
          <q-input
            v-model="newBranch.name"
            filled
            dense
            placeholder="请填写部门名称"
            hide-bottom-space
          />
        </div>
        <div>
          <q-item-label class="text-caption hint-label">
            部门描述
          </q-item-label>
          <q-input
            v-model="newBranch.desc"
            filled
            dense
            type="textarea"
            placeholder="请填写部门描述"
            hide-bottom-space
          />
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QInput, QSelect, QTree, QTreeNode } from 'quasar';
import {
  BranchPostData,
  EnterprisePostData,
  OrgTypeOption,
  OrgTypePostData,
} from 'src/pages/type';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import TreeSelect from 'components/form/TreeSelect.vue';

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
  name: 'OrgTree',

  components: { DropdownButton, FormDialog, TreeSelect },

  props: {
    simple: {
      type: Array as PropType<QTreeNode[]>,
      default: () => {
        return [];
      },
    },

    editable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:selectNode', 'update:changeOrgType'],

  setup() {
    return {
      // org selector
      orgTypeOptions: ref<OrgTypeOption[]>(orgData),
      selectedOrgType: ref(orgData[0]),
      width: 0,

      // tree
      selected: ref(null),
      filter: ref(''),
      filterRef: ref(null),

      // form dialog
      createOrgTypeForm: ref(false),
      newOrgType: ref<OrgTypePostData>({}),

      createEnterpriseForm: ref(false),
      newEnterprise: ref<EnterprisePostData>({}),

      createBranchForm: ref(false),
      newBranch: ref<BranchPostData>({}),
      editedBranch: ref<QTreeNode[]>(),
    };
  },

  methods: {
    resetOrgFilter() {
      this.filter = '';
      (this.$refs.filterRef as QInput).focus();
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

    createObject(evt: Event) {
      if (evt.type === 'org_type') {
        this.createOrgType();
      } else if (evt.type === 'enterprise') {
        this.createEnterprise();
      } else if (evt.type === 'branch') {
        this.createBranch();
      }
    },

    createOrgType() {
      this.createOrgTypeForm = true;
    },

    editOrgType() {
      // TODO
    },

    deleteOrgType() {
      // TODO
    },

    createEnterprise() {
      this.createEnterpriseForm = true;
    },

    editEnterprise(enterpriseId: string) {
      this.createEnterpriseForm = true;
      console.error(`start to edit enterprise ${enterpriseId}!`);
    },

    deleteEnterprise(enterpriseId: string) {
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除企业',
            content:
              '操作后，该企业下的所有部门将一并执行删除；与其关联的用户将自动与企业解绑，但仍可继续正常使用。请问您确认要执行删除吗？',
            buttons: [
              { label: '取消' },
              {
                label: '删除',
                actionType: 'delete',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(({ type }) => {
          if (type === 'delete') {
            console.error(`enterprise ${enterpriseId} delete done!`);
          }
        });
    },

    createBranch(nodeId?: number) {
      if (nodeId) {
        const node = (this.$refs.orgTree as QTree).getNodeByKey(nodeId);
        this.editedBranch = node ? [node] : [];
      }
      this.createBranchForm = true;
    },

    editBranch(nodeId: number) {
      const node = (this.$refs.orgTree as QTree).getNodeByKey(nodeId);
      this.editedBranch = [
        (this.$refs.orgTree as QTree).getNodeByKey(node.parentId),
      ];
      this.createBranchForm = true;
    },

    deleteBranch(nodeId: number) {
      const node = (this.$refs.orgTree as QTree).getNodeByKey(nodeId);
      const deptName = node.label;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: node.enterpriseId ? '删除企业' : '删除部门',
            content: `操作后，【${deptName}】的下属部门将一并执行删除；与其关联的用户将自动解绑，但仍可继续正常使用。请问您确认要执行删除吗？`,
            buttons: [
              { label: '取消' },
              {
                label: '删除',
                actionType: 'delete',
                class: 'accent-btn',
              },
            ],
          },
        })
        .onOk(({ type }) => {
          if (type === 'delete') {
            console.error('delete done!');
          }
        });
    },

    onNodeUpdated(selected: number) {
      const node = (this.$refs.orgTree as QTree).getNodeByKey(selected);
      this.$emit('update:selectNode', node);
    },

    changeOrgType(selected: OrgTypeOption) {
      this.$emit('update:changeOrgType', selected.value);
    },

    expandTree() {
      (this.$refs.orgTree as QTree).expandAll();
    },
  },
});
</script>

<style lang="scss" scoped></style>
