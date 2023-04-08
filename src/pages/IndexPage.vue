<template>
  <q-page class="full-width">
    <div class="row q-col-gutter-sm q-mx-auto q-pa-lg">
      <div class="col-6">
        <CascadeSelect
          v-model="selectedDept"
          required
          label="请选择部门（示例）"
          :options="departments"
          opt-label="name"
          opt-value="id"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import CascadeSelect from 'components/form/CascadeSelect.vue';
import { CascadeOption } from 'components/form/type';

const deptOptions: CascadeOption[] = [
  {
    name: '1. 北京分公司',
    id: 1,
    icon: 'corporate_fare',
    children: [
      {
        name: '1.1 产品部门',
        id: 2,
        children: [
          {
            name: '1.1.1 产品设计部门',
            id: 3,
          },
          {
            name: '1.1.2 产品研发部门',
            id: 4,
          },
        ],
      },
      {
        name: '1.2 成本部门',
        id: 5,
      },
      {
        name: '1.3 销售部门',
        id: 6,
      },
    ],
  },
];

export default defineComponent({
  name: 'IndexPage',

  components: { CascadeSelect },

  setup() {
    return {
      departments: deptOptions,
      selectedDept: ref<CascadeOption[]>([]),
    };
  },
});
</script>
