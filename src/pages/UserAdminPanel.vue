<template>
  <q-page class="full-width q-pa-md">
    <data-table
      :rows="users"
      :columns="columns"
      sticky-action-column
      :actions="['批量禁用', '批量启用', '批量删除']"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            :label="props.row.status ? '正常' : '禁用'"
            class="text-weight-bold q-pa-sm"
            :class="props.row.status ? 'chip-status-on' : 'chip-status-off'"
          />
        </q-td>
      </template>

      <template #table-action>
        <q-btn unelevated label="创建用户" class="q-ml-md primary-btn" />
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="text-grey-8 q-gutter-xs">
            <q-btn size="12px" flat dense icon="more_horiz" class="flat-btn">
              <q-menu class="q-px-xs actions-menu">
                <q-list dense>
                  <q-item
                    v-if="props.row.status"
                    v-close-popup
                    clickable
                    class="q-my-xs"
                    @click="blockUser(props.row.name)"
                  >
                    <q-item-section avatar>
                      <q-icon name="remove_circle_outline" size="16px" />
                    </q-item-section>
                    <q-item-section> 禁用账号 </q-item-section>
                  </q-item>
                  <q-item
                    v-else
                    v-close-popup
                    clickable
                    class="q-my-xs"
                    @click="blockUser(props.row.name)"
                  >
                    <q-item-section avatar>
                      <q-icon name="task_alt" size="16px" />
                    </q-item-section>
                    <q-item-section> 启用账号 </q-item-section>
                  </q-item>
                  <!-- <q-separator inset /> -->
                  <q-item v-close-popup clickable class="q-my-xs">
                    <q-item-section avatar>
                      <q-icon name="delete_outline" size="16px" />
                    </q-item-section>
                    <q-item-section>删除账号</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>
    </data-table>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { QTableProps } from 'quasar';

import DataTable from 'components/table/DataTable.vue';

import { User } from './type';

const userData: User[] = [
  {
    id: 1,
    name: '王伟力',
    mobile: '15701259715',
    username: 'un1',
    status: true,
  },
  {
    id: 2,
    name: 'Xenia',
    mobile: '15901259713',
    email: 'xenia.lyy@gmail.com',
    username: 'un2',
    status: true,
  },
  {
    id: 3,
    name: 'Daisy',
    mobile: '15901259713',
    email: 'daichen.daisy@gmail.com',
    username: 'un3',
    status: true,
  },
  {
    id: 4,
    name: '王川',
    mobile: '13801259713',
    username: 'un4',
    status: true,
  },
  {
    id: 5,
    name: 'Mico',
    email: 'mico@decentfox.com',
    username: 'un5',
    status: true,
  },
  {
    id: 6,
    name: '王昕',
    mobile: '15901259713',
    username: 'un6',
    status: true,
  },
  {
    id: 7,
    name: '小明',
    mobile: '15701259714',
    username: 'un7',
    status: true,
  },
  {
    id: 8,
    name: '小丽',
    mobile: '15901259712',
    email: 'xen@gmail.com',
    username: 'un8',
    status: true,
  },
  {
    id: 9,
    name: '小红',
    mobile: '15901259711',
    email: 'dai@gmail.com',
    username: 'un9',
    status: false,
  },
  {
    id: 10,
    name: '小青',
    mobile: '13801259710',
    username: 'un10',
    status: true,
  },
  {
    id: 11,
    name: '小方',
    email: 'mico@decent.com',
    username: 'un11',
    status: false,
  },
  {
    id: 12,
    name: '阿强',
    mobile: '15901359713',
    username: 'un12',
    status: true,
  },
];

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name',
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: 'username',
  },
  {
    name: 'mobile',
    label: '手机号',
    align: 'left',
    field: 'mobile',
  },
  {
    name: 'email',
    label: '邮箱',
    align: 'left',
    field: 'email',
  },
  {
    name: 'status',
    label: '状态',
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
    field: 'actions',
  },
];

export default defineComponent({
  name: 'UserAdminPanel',

  components: { DataTable },

  setup() {
    return {
      users: userData,
      columns: columns,
    };
  },

  methods: {
    blockUser(name: string) {
      console.error(name);
    },
  },
});
</script>

<style lang="scss">
.actions-menu .q-item__section--avatar {
  min-width: 28px;
  padding-right: 0;
}
</style>
