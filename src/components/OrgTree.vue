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
        option-label="name"
        option-value="id"
        @popup-show="width = ($refs.orgTypeSelect as QSelect).$el.offsetWidth"
        @update:model-value="changeOrgType"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <div class="row no-wrap" :style="`width: ${width * 0.8}px;`">
                <q-item-label lines="1">
                  {{ scope.opt.name }}
                </q-item-label>
                <q-badge
                  v-if="scope.opt.is_deleted"
                  align="top"
                  :label="!scope.opt.is_deleted ? '正常' : '停用'"
                  :class="
                    !scope.opt.is_deleted ? 'chip-status-on' : 'chip-status-off'
                  "
                  class="q-ml-xs"
                />
              </div>
              <q-item-label
                caption
                lines="1"
                class="q-mt-xs"
                :style="`width: ${width * 0.8}px;`"
              >
                {{ scope.opt.description }}
              </q-item-label>
              <dropdown-button
                v-if="editable"
                class="absolute-right q-pa-sm"
                :buttons="[
                  {
                    label: '编辑类型',
                    actionType: 'edit_type',
                  },
                  {
                    label: '删除类型',
                    actionType: 'delete_type',
                    disable: scope.opt.is_protected,
                    disableHint: scope.opt.is_protected
                      ? '系统内置类型，不支持删除'
                      : '',
                  },
                ]"
                @click.stop
                @menu-click="startToManageOrgType($event, scope.opt)"
              />
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
        @menu-click="startToCreateObject"
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
    ref="orgTypeDialog"
    v-model="orgTypeForm"
    title="组织类型"
    width="450px"
    @confirm="saveOrgTypeForm"
    @close="resetOrgTypeForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <q-item-label class="text-caption hint-label">
            组织类型名称
          </q-item-label>
          <q-input
            v-model="orgTypeData.name"
            filled
            dense
            placeholder="请填写组织类型名称，如：合作商家"
            hide-bottom-space
            :error="!!orgTypeFormError.name"
            :error-message="orgTypeFormError.name"
          />
        </div>
        <div>
          <q-item-label class="text-caption hint-label">
            组织类型描述
          </q-item-label>
          <q-input
            v-model="orgTypeData.description"
            filled
            dense
            type="textarea"
            placeholder="请填写组织类型描述"
            hide-bottom-space
          />
        </div>
        <div v-if="orgTypeData.id">
          <q-toggle
            v-model="orgTypeData.is_deleted"
            label="是否标记为停用"
            :disable="orgTypeData.is_protected"
          >
            <q-tooltip
              v-if="orgTypeData.is_protected"
              anchor="bottom left"
              self="center start"
            >
              该组织类型为系统内置类型，您可以更名，但无法停用
            </q-tooltip>
          </q-toggle>
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
  OrgTypePostError,
} from 'src/pages/type';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import TreeSelect from 'components/form/TreeSelect.vue';

import { FormDialogComponent } from './dialog/type';

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
      orgTypeOptions: ref<OrgTypeOption[]>([]),
      selectedOrgType: ref<OrgTypeOption>({
        id: '',
        name: '',
        is_deleted: false,
        is_protected: false,
      }),
      width: 0,

      // tree
      selected: ref(null),
      filter: ref(''),
      filterRef: ref(null),

      // form dialog
      orgTypeForm: ref(false),
      orgTypeFormError: ref<OrgTypePostError>({}),
      orgTypeData: ref<OrgTypePostData>({}),

      createEnterpriseForm: ref(false),
      newEnterprise: ref<EnterprisePostData>({}),

      createBranchForm: ref(false),
      newBranch: ref<BranchPostData>({}),
      editedBranch: ref<QTreeNode[]>(),
    };
  },

  mounted() {
    this.loadOrgTypes();
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

    startToCreateObject(evt: Event) {
      if (evt.type === 'org_type') {
        this.openOrgTypeForm();
      } else if (evt.type === 'enterprise') {
        this.createEnterprise();
      } else if (evt.type === 'branch') {
        this.createBranch();
      }
    },

    /** organization type related methods */

    startToManageOrgType(evt: Event, orgType: OrgTypeOption) {
      if (evt.type === 'edit_type') {
        this.openOrgTypeForm(orgType);
      } else if (evt.type === 'delete_type') {
        this.deleteOrgType(orgType);
      }
    },

    openOrgTypeForm(orgType?: OrgTypeOption) {
      if (orgType) {
        this.orgTypeData = {
          id: orgType.id,
          name: orgType.name,
          description: orgType.description,
          is_deleted: orgType.is_deleted,
          is_protected: orgType.is_protected,
        };
      }
      this.orgTypeForm = true;
    },

    async saveOrgTypeForm() {
      try {
        this.orgTypeFormError = {};
        if (!this.orgTypeData.id) {
          await this.$api.post('/org_types', this.orgTypeData, {
            successMsg: '组织类型创建成功',
          });
        } else {
          await this.$api.put(
            `/org_types/${this.orgTypeData.id}`,
            this.orgTypeData,
            {
              successMsg: '组织类型更新成功',
            }
          );
        }
        (this.$refs.orgTypeDialog as FormDialogComponent).hide();
        this.resetOrgTypeForm();
      } catch (e) {
        this.orgTypeFormError = (e as Error).cause || {};
      } finally {
        this.loadOrgTypes(false);
      }
    },

    resetOrgTypeForm() {
      this.orgTypeFormError = {};
      this.orgTypeData = {};
    },

    async loadOrgTypes(initSelected = true) {
      const resp = await this.$api.get('/org_types');
      this.orgTypeOptions = resp.data.org_types;
      if (initSelected) {
        this.selectedOrgType = this.orgTypeOptions[0];
        this.changeOrgType(this.selectedOrgType);
      }
    },

    deleteOrgType(orgType: OrgTypeOption) {
      const orgName = orgType.name;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除组织类型',
            content: `操作后，该组织类型【${orgName}】下的所有企业将一并执行删除；与这些企业相关联的用户将自动与企业解绑，但仍可继续正常使用。请问您确认要执行删除吗？`,
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
        .onOk(async ({ type }) => {
          if (type === 'delete') {
            try {
              await this.$api.request({
                method: 'DELETE',
                url: '/org_types',
                data: { ids: [orgType.id] },
                successMsg: '组织类型删除成功',
              });
            } finally {
              this.loadOrgTypes(this.selectedOrgType.id === orgType.id);
            }
          }
        });
    },

    /** enterprise related methods */

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

    /** branch or department related methods */

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
      this.$emit('update:changeOrgType', selected.name);
    },

    expandTree() {
      (this.$refs.orgTree as QTree).expandAll();
    },
  },
});
</script>

<style lang="scss" scoped></style>
