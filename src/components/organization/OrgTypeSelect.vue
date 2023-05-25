<template>
  <div class="full-width">
    <q-toolbar class="q-pa-none">
      <q-select
        ref="select"
        v-model="selectedOrgType"
        :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
        style="word-break: break-all"
        dense
        filled
        class="full-width"
        :options="orgTypeOptions"
        option-label="name"
        option-value="id"
        @popup-show="selectWidth = ($refs.select as QSelect).$el.offsetWidth"
        @update:model-value="
          (value) => {
            $emit('update:modelValue', value);
          }
        "
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <div
                class="row no-wrap items-center"
                :style="`width: ${selectWidth * 0.8}px;`"
              >
                <q-item-label
                  :class="
                    selectedOrgType.id === scope.opt.id
                      ? `text-weight-bold`
                      : ``
                  "
                  class="q-mr-xs"
                  lines="1"
                >
                  {{ scope.opt.name }}
                </q-item-label>
                <boolean-chip
                  v-if="scope.opt.is_deleted"
                  :value="!scope.opt.is_deleted"
                  dense
                  true-label="正常"
                  false-label="禁用"
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
            </q-item-section>
            <q-item-section side>
              <dropdown-button
                v-if="editable"
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
                @edit-type="openOrgTypeForm(scope.opt)"
                @delete-type="deleteOrgType(scope.opt)"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-space />
      <slot name="create-action">
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
          ]"
          @org-type="openOrgTypeForm()"
        />
      </slot>
    </q-toolbar>
    <div class="q-pa-xs row q-gutter-xs items-center">
      <boolean-chip
        :value="!selectedOrgType.is_deleted"
        true-label="正常"
        false-label="禁用"
      />
      <q-chip
        :label="`代码：${selectedOrgType.code}`"
        square
        class="q-pa-sm q-ml-xs bg-secondary text-black-white cursor-pointer"
        @click="$utils.copyToClipboard(selectedOrgType.code)"
      >
        <q-tooltip anchor="bottom left" self="top start">
          组织类型的唯一标识符，可用于获取组织类型信息
        </q-tooltip>
      </q-chip>
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
            <field-label text="组织类型名称" required />
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
              text="组织类型 Code"
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
            <field-label text="组织类型描述" />
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QSelect } from 'quasar';

import { OrgType, OrgTypePostData, OrgTypePostError } from 'pages/type';

import ConfirmDialog from '../dialog/ConfirmDialog.vue';
import { FormDialogComponent } from '../dialog/type';

export default defineComponent({
  name: 'UserForm',

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      // org selector
      orgTypeOptions: ref<OrgType[]>([]),
      selectedOrgType: ref<OrgType>({
        id: '',
        name: '',
      }),
      selectWidth: 0,

      orgTypeForm: ref(false),
      orgTypeFormError: ref<OrgTypePostError>({}),
      orgTypeFormData: ref<OrgTypePostData>({}),
      operatedOrgType: ref<OrgType>({
        id: '',
        name: '',
      }),
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
      this.$emit('update:modelValue', this.selectedOrgType);
    },

    async openOrgTypeForm(orgType?: OrgType) {
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
        this.loadOrgTypes();
        this.resetOrgTypeForm();
      } catch (e) {
        this.orgTypeFormError = (e as Error).cause || {};
      }
    },

    resetOrgTypeForm() {
      this.orgTypeFormError = {};
      this.orgTypeFormData = {};
      this.operatedOrgType = {
        id: '',
        name: '',
      };
    },

    deleteOrgType(orgType: OrgType) {
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
  },
});
</script>

<style lang="scss" scoped></style>
