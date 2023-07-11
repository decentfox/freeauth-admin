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
          (value: OrgType) => {
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
                      ? '系统内置组织类型，不支持删除'
                      : '',
                  },
                ]"
                @click.stop
                @edit-type="openOrgTypeForm(scope.opt)"
                @delete-type="deleteOrgType(scope.opt, loadOrgTypes)"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-space />
      <slot name="create-action">
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
        clickable
        class="q-pa-sm bg-secondary"
        @click="$utils.copyToClipboard(selectedOrgType.code)"
      >
        <q-tooltip anchor="bottom left" self="top start">
          组织类型的唯一标识符，可用于获取组织类型信息
        </q-tooltip>
      </q-chip>
    </div>
    <org-type-form ref="orgTypeForm" @org-type-updated="loadOrgTypes" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QSelect } from 'quasar';

import { OrgOperationsMixin } from './OrgOperations';
import { OrgType, OrgTypeFormComponent } from './type';

export default defineComponent({
  name: 'OrgTypeSelect',

  mixins: [OrgOperationsMixin],

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
      (this.$refs.orgTypeForm as OrgTypeFormComponent).show(orgType);
    },
  },
});
</script>

<style lang="scss" scoped></style>
