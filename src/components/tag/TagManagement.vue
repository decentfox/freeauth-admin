<template>
  <q-dialog ref="dialog" persistent @hide="onDialogHide">
    <q-card :style="`width: ${width}; max-width: 800px`">
      <q-item>
        <q-item-section class="q-pa-sm">
          <q-item-label class="text-weight-bold text-subtitle1">
            {{ title }}
          </q-item-label>
        </q-item-section>
        <q-space />
        <q-btn
          v-close-popup
          dense
          flat
          no-hover
          size="sm"
          icon="close"
          class="no-hover-btn"
        />
      </q-item>
      <q-separator />
      <q-card-section
        style="max-height: 80vh; min-height: 40vh"
        class="q-pa-md scroll"
      >
        <draggable
          :list="list"
          item-key="name"
          @start="dragging = true"
          @end="dragging = false"
        >
          <template #item="{ element }">
            <q-item class="bg-secondary draggable-item">
              <q-item-section avatar>
                <q-icon size="xs" name="menu" />
              </q-item-section>
              <q-item-section>
                {{ element.name }}
              </q-item-section>
              <q-space />
              <q-item-section side>
                <div class="row">
                  <q-icon
                    size="xs"
                    name="edit_note"
                    class="cursor-pointer q-mx-sm"
                    @click="openTagForm(element)"
                  />
                  <q-icon
                    size="xs"
                    name="delete_outline"
                    class="cursor-pointer"
                    @click="deleteTag(element)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
        </draggable>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-mx-sm">
        <q-btn
          flat
          label="添加标签"
          class="primary-btn"
          @click="openTagForm()"
        />
        <q-space />
        <q-btn v-close-popup flat label="关闭" class="secondary-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <form-dialog
    ref="tagDialog"
    v-model="tagForm"
    :title="tagFormData.id ? '修改标签名称' : '添加标签'"
    width="450px"
    @confirm="saveTagForm"
    @close="resetTagForm"
  >
    <template #form-content>
      <div class="q-col-gutter-md q-pa-md">
        <div>
          <field-label text="标签名称" required />
          <q-input
            v-model="tagFormData.name"
            filled
            dense
            placeholder="请填写标签名称"
            hide-bottom-space
            :error="!!tagFormError.name"
            :error-message="tagFormError.name"
          />
        </div>
      </div>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import draggable from 'vuedraggable';
import { QDialog } from 'quasar';

import ConfirmDialog from 'components/dialog/ConfirmDialog.vue';

import { FormDialogComponent } from '../dialog/type';

import { Tag, TagUpdateData, TagUpdateError } from './type';

export default defineComponent({
  name: 'TagManagement',

  components: {
    draggable,
  },

  props: {
    title: {
      type: String,
      default: '弹窗',
    },
    width: {
      type: String,
      default: '400px',
    },
    content: {
      type: String,
      default: '描述',
    },
  },

  emits: ['ok', 'hide'],

  setup() {
    return {
      tagManagement: ref(false),
      tagForm: ref(false),
      tagFormData: ref<TagUpdateData>({}),
      tagFormError: ref<TagUpdateError>({}),
    };
  },

  data() {
    return {
      list: [],
      dragging: false,
    };
  },

  watch: {
    dragging() {
      if (!this.dragging) {
        this.reorderTags();
      }
    },
  },

  methods: {
    show() {
      (this.$refs['dialog'] as QDialog).show();
      this.loadTags();
    },

    hide() {
      (this.$refs['dialog'] as QDialog).hide();
    },

    onDialogHide() {
      this.$emit('hide');
    },

    async loadTags() {
      const resp = await this.$api.get('/permission_tags');
      this.list = resp.data.permission_tags;
    },

    async reorderTags() {
      await this.$api.post(
        '/permission_tags/reorder',
        { ids: this.list.map((t: Tag) => t.id) },
        {
          successMsg: '标签排序更新成功',
        }
      );
    },

    openTagForm(tag?: Tag) {
      this.tagForm = true;
      if (tag) {
        this.tagFormData.name = tag.name;
        this.tagFormData.id = tag.id;
      }
    },

    async saveTagForm() {
      try {
        this.tagFormError = {};
        if (this.tagFormData.id) {
          await this.$api.put(
            `/permission_tags/${this.tagFormData.id}`,
            this.tagFormData,
            {
              successMsg: '标签更新成功',
            }
          );
        } else {
          await this.$api.post('/permission_tags', this.tagFormData, {
            successMsg: '标签创建成功',
          });
        }
        (this.$refs.tagDialog as FormDialogComponent).hide();
        this.loadTags();
        this.tagFormError = {};
      } catch (e) {
        this.tagFormError = (e as Error).cause || {};
      }
    },

    resetTagForm() {
      this.tagFormData = {};
      this.tagFormError = {};
    },

    deleteTag(tag: Tag) {
      this.$q
        .dialog({
          component: ConfirmDialog,
          componentProps: {
            title: '删除标签',
            content: `您正在请求删除标签【${tag.name}】，数据删除后将无法进行恢复，您确认要继续删除吗？`,
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
                url: '/permission_tags',
                data: { ids: [tag.id] },
                successMsg: '删除标签成功',
              });
            } finally {
              this.loadTags();
            }
          }
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.draggable-item {
  margin-bottom: 3px;
  cursor: move;
}
</style>
