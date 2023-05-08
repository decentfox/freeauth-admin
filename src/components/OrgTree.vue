<template>
  <div class="q-px-md q-py-sm">
    <q-toolbar class="q-pa-none">
      <q-select
        ref="orgTypeSelect"
        v-model="selectedOrgType"
        :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
        style="word-break: break-all"
        dense
        filled
        class="full-width"
        :options="orgTypeOptions"
        option-label="name"
        option-value="id"
        @popup-show="
          selectWidth = ($refs.orgTypeSelect as QSelect).$el.offsetWidth
        "
        @update:model-value="changeOrgType"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <div
                class="row no-wrap"
                :style="`width: ${selectWidth * 0.8}px;`"
              >
                <q-item-label
                  :class="
                    selectedOrgType.id === scope.opt.id
                      ? `text-weight-bold`
                      : ``
                  "
                  lines="1"
                >
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
                :style="`width: ${selectWidth * 0.8}px;`"
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
            actionType: 'department',
          },
        ]"
        @menu-click="startToCreateObject"
      />
    </q-toolbar>
    <div class="q-pa-xs row q-gutter-xs">
      <q-badge
        align="middle"
        :label="!selectedOrgType.is_deleted ? '正常' : '停用'"
        :class="
          !selectedOrgType.is_deleted ? 'chip-status-on' : 'chip-status-off'
        "
        class="q-pa-sm"
      />
      <q-badge
        :label="`代码：${selectedOrgType.code}`"
        class="q-pa-sm q-ml-xs bg-secondary text-black-white cursor-pointer"
        @click="$utils.copyToClipboard(selectedOrgType.code)"
      >
        <q-tooltip anchor="bottom left" self="top start">
          组织类型的唯一标识符，可用于获取组织类型信息
        </q-tooltip>
      </q-badge>
    </div>
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
      style="height: calc(100vh - 240px)"
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
        :duration="1"
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
                      @click="deleteOrganization(prop.node.id)"
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
          <field-label name="组织类型名称" required />
          <q-input
            v-model="orgTypeFormData.name"
            filled
            dense
            placeholder="请填写组织类型名称，如：合作商家"
            hide-bottom-space
            :error="!!orgTypeFormError.name"
            :error-message="orgTypeFormError.name"
          />
        </div>
        <div>
          <field-label
            name="组织类型 Code"
            required
            hint="组织类型的唯一标识符，可用于获取组织类型信息"
          />
          <q-input
            v-model="orgTypeFormData.code"
            filled
            dense
            placeholder="请填写组织类型代码"
            hide-bottom-space
            :error="!!orgTypeFormError.code"
            :error-message="orgTypeFormError.code"
          />
        </div>
        <div>
          <field-label name="组织类型描述" />
          <q-input
            v-model="orgTypeFormData.description"
            filled
            dense
            type="textarea"
            placeholder="请填写组织类型描述"
            hide-bottom-space
          />
        </div>
        <div v-if="operatedOrgType.id">
          <q-toggle
            v-model="orgTypeFormData.is_deleted"
            label="是否标记为停用"
            :disable="operatedOrgType.is_protected"
          >
            <q-tooltip
              v-if="operatedOrgType.is_protected"
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
    ref="enterpriseDialog"
    v-model="enterpriseForm"
    title="企业机构"
    width="450px"
    @confirm="saveEnterpriseForm"
    @close="resetEnterpriseForm"
  >
    <template #form-content>
      <div class="q-gutter-md q-pa-md">
        <div>
          <field-label name="企业机构名称" required />
          <q-input
            v-model="enterpriseFormData.name"
            filled
            dense
            placeholder="请填写企业名称"
            hide-bottom-space
            :error="!!enterpriseFormError.name"
            :error-message="enterpriseFormError.name"
          />
        </div>
        <div>
          <field-label
            name="企业机构 Code"
            hint="企业机构的唯一标识符，同一组织类型下唯一，可用于获取企业信息"
          />
          <q-input
            v-model="enterpriseFormData.code"
            filled
            dense
            placeholder="请填写企业代码"
            hide-bottom-space
            :error="!!enterpriseFormError.code"
            :error-message="enterpriseFormError.code"
          />
        </div>
        <div>
          <field-label name="企业税务信息" />
          <q-input
            v-model="enterpriseFormData.tax_id"
            filled
            dense
            placeholder="请填写 15、18 或 20 位纳税识别号"
            hide-bottom-space
            :error="!!enterpriseFormError.tax_id"
            :error-message="enterpriseFormError.tax_id"
          />
        </div>

        <div>
          <field-label name="企业银行信息" />
          <div class="q-gutter-sm">
            <q-input
              v-model="enterpriseFormData.issuing_bank"
              filled
              dense
              placeholder="请填写开户行名称"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="enterpriseFormData.bank_account_number"
              filled
              dense
              placeholder="请填写银行账号"
              hide-bottom-space
              class="col"
            />
          </div>
        </div>

        <div>
          <field-label name="企业办公信息" />
          <div class="q-gutter-sm">
            <q-input
              v-model="enterpriseFormData.contact_address"
              filled
              dense
              placeholder="请填写办公地址"
              hide-bottom-space
              class="col"
            />
            <q-input
              v-model="enterpriseFormData.contact_phone_num"
              filled
              dense
              placeholder="请填写办公电话"
              hide-bottom-space
              class="col"
            />
          </div>
        </div>
      </div>
    </template>
  </form-dialog>
  <form-dialog
    ref="departmentDialog"
    v-model="departmentForm"
    title="部门分支"
    width="450px"
    @confirm="saveDepartmentForm"
    @close="resetDepartmentForm"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <div>
          <field-label name="所属上级部门" required />
          <tree-select
            v-model="departmentFormData.parent_id"
            :nodes="orgTreeData"
            :initial-selected-items="parentDepartment"
          />
          <div
            v-if="!!departmentFormError.parent_id"
            class="error-hint text-negative"
          >
            {{ departmentFormError.parent_id }}
          </div>
        </div>
        <div>
          <field-label name="部门名称" required />
          <q-input
            v-model="departmentFormData.name"
            filled
            dense
            placeholder="请填写部门名称"
            hide-bottom-space
            :error="!!departmentFormError.name"
            :error-message="departmentFormError.name"
          />
        </div>
        <div>
          <field-label
            name="部门 Code"
            hint="部门分支的唯一标识符，同一企业机构下唯一，可用户获取部门信息"
          />
          <q-input
            v-model="departmentFormData.code"
            filled
            dense
            placeholder="请填写部门代码"
            hide-bottom-space
            :error="!!departmentFormError.code"
            :error-message="departmentFormError.code"
          />
        </div>
        <div>
          <field-label name="部门描述" />
          <q-input
            v-model="departmentFormData.description"
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
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QInput, QSelect, QTree, QTreeNode } from 'quasar';
import {
  Department,
  DepartmentPostData,
  DepartmentPostError,
  Enterprise,
  EnterprisePostData,
  EnterprisePostError,
  OrgTypeOption,
  OrgTypePostData,
  OrgTypePostError,
} from 'src/pages/type';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';
import FormDialog from 'components/dialog/FormDialog.vue';
import DropdownButton from 'components/DropdownButton.vue';
import FieldLabel from 'components/form/FieldLabel.vue';
import TreeSelect from 'components/form/TreeSelect.vue';

import { FormDialogComponent } from './dialog/type';

export default defineComponent({
  name: 'OrgTree',

  components: { DropdownButton, FieldLabel, FormDialog, TreeSelect },

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:selectNode', 'update:changeOrgType', 'refresh'],

  setup() {
    return {
      // org selector
      orgTypeOptions: ref<OrgTypeOption[]>([]),
      selectedOrgType: ref<OrgTypeOption>({
        id: '',
        name: '',
        code: '',
        is_deleted: false,
        is_protected: false,
      }),
      selectWidth: 0,

      // tree
      selected: ref(''),
      filter: ref(''),
      filterRef: ref(null),
      orgTreeData: ref<QTreeNode[]>([]),

      // form dialog
      orgTypeForm: ref(false),
      orgTypeFormError: ref<OrgTypePostError>({}),
      orgTypeFormData: ref<OrgTypePostData>({}),
      operatedOrgType: ref<OrgTypeOption>({
        id: '',
        name: '',
        code: '',
        is_deleted: false,
        is_protected: false,
      }),

      enterpriseForm: ref(false),
      enterpriseFormError: ref<EnterprisePostError>({}),
      enterpriseFormData: ref<EnterprisePostData>({}),
      operatedEnterprise: ref<Enterprise>({
        id: '',
        name: '',
      }),

      departmentForm: ref(false),
      departmentFormData: ref<DepartmentPostData>({}),
      departmentFormError: ref<DepartmentPostError>({}),
      operatedDepartment: ref<Department>({
        id: '',
        name: '',
        parent_id: '',
      }),

      parentDepartment: ref<QTreeNode[]>(),
    };
  },

  mounted() {
    this.loadOrgTypes();
  },

  methods: {
    async loadOrgTypes() {
      const resp = await this.$api.get('/org_types');
      this.orgTypeOptions = resp.data.org_types;
      const selected = this.orgTypeOptions.filter(
        (t) => t.id === this.selectedOrgType.id
      );
      this.selectedOrgType =
        selected.length === 1 ? selected[0] : this.orgTypeOptions[0];
      this.changeOrgType(this.selectedOrgType);
    },

    async loadOrgTree() {
      const resp = await this.$api.get(
        `/org_types/${this.selectedOrgType.id}/organization_tree`
      );
      this.orgTreeData = resp.data;
      setTimeout(() => {
        (this.$refs.orgTree as QTree).expandAll();
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

    startToCreateObject(evt: Event) {
      if (evt.type === 'org_type') {
        this.openOrgTypeForm();
      } else if (evt.type === 'enterprise') {
        this.openEnterpriseForm();
      } else if (evt.type === 'department') {
        this.openDepartmentForm();
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

    async openOrgTypeForm(orgType?: OrgTypeOption) {
      if (orgType) {
        const resp = await this.$api.get(`/org_types/${orgType.id}`);
        this.operatedOrgType = resp.data;
        this.orgTypeFormData = {
          name: resp.data.name,
          code: resp.data.code,
          description: resp.data.description,
          is_deleted: resp.data.is_deleted,
        };
      }
      this.orgTypeForm = true;
    },

    async saveOrgTypeForm() {
      try {
        this.orgTypeFormError = {};
        if (!this.operatedOrgType.id) {
          await this.$api.post('/org_types', this.orgTypeFormData, {
            successMsg: '组织类型创建成功',
          });
        } else {
          await this.$api.put(
            `/org_types/${this.operatedOrgType.id}`,
            this.orgTypeFormData,
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
        this.loadOrgTypes();
      }
    },

    resetOrgTypeForm() {
      this.orgTypeFormError = {};
      this.orgTypeFormData = {};
      this.operatedOrgType = {
        id: '',
        name: '',
        code: '',
        is_deleted: false,
        is_protected: false,
      };
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
              { label: '取消', class: 'secondary-btn' },
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
              this.loadOrgTypes();
            }
          }
        });
    },

    /** enterprise related methods */

    async openEnterpriseForm(enterpriseId?: string) {
      if (enterpriseId) {
        const resp = await this.$api.get(`/enterprises/${enterpriseId}`);
        this.operatedEnterprise = resp.data;
        this.enterpriseFormData = {
          name: resp.data.name,
          code: resp.data.code,
          tax_id: resp.data.tax_id,
          issuing_bank: resp.data.issuing_bank,
          bank_account_number: resp.data.bank_account_number,
          contact_address: resp.data.contact_address,
          contact_phone_num: resp.data.contact_phone_num,
        };
      }
      this.enterpriseForm = true;
    },

    async saveEnterpriseForm() {
      try {
        this.enterpriseFormError = {};
        this.enterpriseFormData.org_type_id = this.selectedOrgType.id;
        if (!this.operatedEnterprise.id) {
          await this.$api.post('/enterprises', this.enterpriseFormData, {
            successMsg: '企业机构创建成功',
          });
        } else {
          await this.$api.put(
            `/enterprises/${this.operatedEnterprise.id}`,
            this.enterpriseFormData,
            {
              successMsg: '企业机构更新成功',
            }
          );
        }
        (this.$refs.enterpriseDialog as FormDialogComponent).hide();
        this.resetEnterpriseForm();
      } catch (e) {
        this.enterpriseFormError = (e as Error).cause || {};
      } finally {
        this.$emit('refresh', 'enterprise');
        this.loadOrgTree();
      }
    },

    resetEnterpriseForm() {
      this.enterpriseFormError = {};
      this.enterpriseFormData = {};
      this.operatedEnterprise = {
        id: '',
        name: '',
      };
    },

    /** department or department related methods */

    async openDepartmentForm(nodeId?: string, parentId?: string) {
      if (parentId) {
        const node = (this.$refs.orgTree as QTree).getNodeByKey(parentId);
        this.departmentFormData.parent_id = parentId;
        this.parentDepartment = [node];
      }
      if (nodeId) {
        const resp = await this.$api.get(`/departments/${nodeId}`);
        this.operatedDepartment = resp.data;
        this.departmentFormData = {
          name: resp.data.name,
          description: resp.data.description,
          parent_id: resp.data.parent.id,
          code: resp.data.code,
        };
      }
      this.departmentForm = true;
    },

    async saveDepartmentForm() {
      try {
        this.departmentFormError = {};
        if (!this.operatedDepartment.id) {
          await this.$api.post('/departments', this.departmentFormData, {
            successMsg: '部门分支创建成功',
          });
        } else {
          await this.$api.put(
            `/departments/${this.operatedDepartment.id}`,
            this.departmentFormData,
            {
              successMsg: '部门分支更新成功',
            }
          );
        }
        (this.$refs.departmentDialog as FormDialogComponent).hide();
        this.resetDepartmentForm();
      } catch (e) {
        this.departmentFormError = (e as Error).cause || {};
      } finally {
        this.loadOrgTree();
      }
    },

    resetDepartmentForm() {
      this.departmentFormError = {};
      this.departmentFormData = {};
      this.parentDepartment = [];
      this.operatedDepartment = {
        id: '',
        name: '',
        parent_id: '',
      };
    },

    deleteOrganization(orgId: string) {
      const node = (this.$refs.orgTree as QTree).getNodeByKey(orgId);
      const orgName = node.name;
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: node.is_enterprise ? '删除企业' : '删除部门',
            content: `操作后，【${orgName}】的下属部门将一并执行删除；与其关联的用户将自动解绑，但仍可继续正常使用。请问您确认要执行删除吗？`,
            buttons: [
              { label: '取消', class: 'secondary-btn' },
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
                url: '/organizations',
                data: { ids: [orgId] },
                successMsg: node.is_enterprise
                  ? '企业删除成功'
                  : '部门删除成功',
              });
            } finally {
              this.$emit('refresh', 'enterprise');
              this.loadOrgTree();
            }
          }
        });
    },

    onNodeUpdated(selected: string) {
      if (selected !== null) {
        this.selected = selected;
        const node = (this.$refs.orgTree as QTree).getNodeByKey(selected);
        this.$emit('update:selectNode', node);
      }
      return;
    },

    changeOrgType(selected: OrgTypeOption) {
      this.loadOrgTree();
      this.selected = '';
      this.$emit('update:changeOrgType', selected.id);
    },
  },
});
</script>

<style lang="scss" scoped></style>
