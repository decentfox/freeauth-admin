<template>
  <q-page class="full-width">
    <q-splitter
      v-model="splitterModel"
      class="q-py-sm"
      unit="px"
      :limits="[250, 500]"
    >
      <!--the first splitted screen-->
      <template #before>
        <div class="q-px-md q-py-sm">
          <q-toolbar class="q-pa-none">
            <q-input
              ref="filterRef"
              v-model="filter"
              dense
              filled
              debounce="300"
              placeholder="搜索页面"
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
                  @click="resetFilter"
                />
              </template>
            </q-input>
            <q-space />
            <q-btn
              unelevated
              dense
              class="q-ml-sm secondary-btn"
              style="width: 75px; height: 40px"
            >
              <q-icon size="18px" name="add" />页面
            </q-btn>
          </q-toolbar>
          <q-tab-panel
            name="structure"
            class="scroll q-px-none"
            style="height: calc(100vh - 140px)"
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
                  <div v-if="!prop.node.disable" class="absolute-right">
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
                          <q-item v-close-popup clickable class="q-my-xs">
                            <q-item-section> 添加子页 </q-item-section>
                          </q-item>
                          <q-item v-close-popup clickable class="q-my-xs">
                            <q-item-section> 删除页面 </q-item-section>
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
      <template #separator>
        <div class="splitter-drag-icon">
          <q-icon name="drag_indicator" color="primary" />
        </div>
      </template>
      <template #after>
        <div class="q-px-md q-py-sm scroll" style="height: calc(100vh - 80px)">
          <q-toolbar class="q-px-xs">
            <q-item-label class="text-weight-bold text-subtitle1">
              用户管理
            </q-item-label>
            <q-space />
            <q-btn unelevated dense class="q-px-md primary-btn">
              <q-icon size="18px" name="edit_note" />编辑
            </q-btn>
          </q-toolbar>
          <q-separator />
          <q-card flat class="q-my-md q-pa-none">
            <q-item>
              <q-item-section>
                <q-item-label class="text-caption hint-label">
                  页面名称
                </q-item-label>
                <q-input v-model="pageSettings.name" dense filled disable />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption hint-label">
                  页面代码
                </q-item-label>
                <q-input v-model="pageSettings.code" dense filled disable />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption hint-label">
                  资源路径
                </q-item-label>
                <q-input v-model="pageSettings.path" dense filled disable />
              </q-item-section>
            </q-item>
            <q-item>
              <q-toggle
                v-model="pageSettings.isMenu"
                label="是否为菜单入口"
                class="text-weight-bold"
                disable
              />
            </q-item>
          </q-card>
          <q-separator />
          <data-table
            :rows="permissions"
            :columns="permissionColumns"
            sticky-action-column
            hide-filter
            hide-export
            hide-import
            selection="none"
            class="q-py-md"
          >
            <template #table-action>
              <q-btn unelevated dense class="q-px-md primary-btn">
                <q-icon size="18px" name="add" />权限
              </q-btn>
            </template>
          </data-table>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QInput, QTableProps, QTreeNode } from 'quasar';
import { Permission } from 'src/pages/type';

import DataTable from 'components/table/DataTable.vue';

const pageStructure: QTreeNode[] = [
  {
    label: '页面层级定义', // 操作权限：编辑保存
    id: 0,
    icon: 'layers',
    disable: true,
    children: [
      {
        label: '定制登录', // 操作权限：编辑保存
        id: 10,
        children: [],
      },
      {
        label: '用户管理', // 操作权限：停用、启用、删除、创建、导入、导出、查看用户详情？
        id: 20,
        children: [
          {
            label: '用户详情', // 操作权限：编辑用户信息
            id: 21,
          },
        ],
      },
      {
        label: '审计日志', // 操作权限：导出
        id: 30,
        children: [],
      },
      {
        label: '组织管理', // 操作权限：编辑组织类型、编辑组织架构
        id: 40,
        children: [
          {
            label: '企业信息', // 操作权限：停用、启用、删除、创建、导入、导出
            id: 41,
          },
          {
            label: '成员列表', // 操作权限：停用、启用、添加成员、查看用户详情？
            id: 42,
            children: [
              {
                label: '用户详情', // 操作权限：编辑用户信息
                id: 43,
              },
            ],
          },
        ],
      },
      {
        label: '角色管理',
        id: 50,
        children: [
          {
            label: '角色详情',
            id: 51,
          },
          {
            label: '配置权限',
            id: 52,
          },
        ],
      },
      {
        label: '权限管理',
        id: 60,
        children: [],
      },
    ],
  },
];

const permissionData: Permission[] = [
  { name: '修改用户状态', code: 'user_status', path: 'api/user_status' },
  { name: '删除用户', code: 'user_delete', path: 'api/user_delete' },
  { name: '创建用户', code: 'user_create', path: 'api/user_create' },
  { name: '导入用户', code: 'user_import' },
  { name: '导出用户', code: 'user_export' },
  { name: '查看用户详情', code: 'user_details', path: 'api/user_details' },
];

const permissionColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '权限名称',
    align: 'left',
    field: 'name',
  },
  {
    name: 'desc',
    label: '权限说明',
    align: 'left',
    field: 'desc',
  },
  {
    name: 'code',
    label: '权限代码',
    align: 'left',
    field: 'code',
  },
  {
    name: 'path',
    label: '资源路径',
    align: 'left',
    field: 'path',
  },
];

export default defineComponent({
  name: 'IndexPage',

  components: { DataTable },

  setup() {
    return {
      splitterModel: 350,

      // tree
      ticked: ref([]),
      selected: ref(null),
      filter: ref(''),
      filterRef: ref(null),
      simple: pageStructure,

      permissions: permissionData,
      permissionColumns: permissionColumns,
      pageSettings: ref({
        isMenu: false,
        code: 'user_management',
        name: '用户管理',
        path: 'user_list',
      }),
    };
  },

  methods: {
    resetFilter() {
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
  },
});
</script>

<style lang="scss" scoped></style>
