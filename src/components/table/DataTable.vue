<template>
  <q-table
    flat
    class="sticky-table selectable"
    :class="{ 'sticky-action-cell': stickyActionColumn }"
    :rows="rows"
    :columns="columns"
    row-key="id"
    selection="multiple"
    :pagination="pagination"
    :rows-per-page-options="[5, 10, 50, 100]"
  >
    <template #top>
      <q-input
        v-model="keyword"
        dense
        filled
        debounce="300"
        style="width: 280px"
        :placeholder="searchPlaceholder"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-icon
            v-if="keyword !== ''"
            name="close"
            size="xs"
            class="cursor-pointer"
            @click="keyword = ''"
          />
        </template>
      </q-input>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn unelevated color="secondary" text-color="grey-9" label="导入" />
        <q-btn unelevated color="secondary" text-color="grey-9" label="导出" />
      </div>
    </template>

    <template
      v-for="(_, name) in ($slots as Readonly<QTableSlots>)"
      #[name]="slotData"
    >
      <slot :name="name" v-bind="slotData || {}" />
    </template>
    <template #no-data="{ icon, message }">
      <div class="full-width row flex-center q-gutter-sm text-grey-6">
        <q-icon :name="icon" />
        <span>
          {{ message }}
        </span>
      </div>
    </template>

    <template #bottom>
      <q-space />
      <div class="row q-py-md">
        <q-pagination
          v-model="current"
          active-design="unelevated"
          active-color="info"
          color="grey-8"
          active-text-color="primary"
          :max="10"
          :max-pages="6"
          boundary-numbers
          direction-links
          icon-prev="arrow_left"
          icon-next="arrow_right"
          gutter="2px"
        />
        <q-separator vertical />
        <q-select
          v-model="pagination.rowsPerPage"
          outlined
          dense
          :options="[5, 7, 10]"
          class="q-ml-md rows-per-page"
        >
          <template #append>
            <q-item-label class="text-body2">/ 页</q-item-label>
          </template>

          <template #option="scope">
            <q-item
              v-bind="scope.itemProps"
              style="height: 36px; min-height: 36px"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { QTableColumn, QTableSlots } from 'quasar';

import { Pagination } from 'components/table/type';

const defaultPagination: Pagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  last: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
};

export default defineComponent({
  name: 'DataTable',

  props: {
    rows: {
      type: Array<unknown>,
      default: () => [],
    },
    columns: {
      type: Array as PropType<QTableColumn[]>,
      default: () => [],
    },
    searchPlaceholder: {
      type: String,
      default: '搜索',
    },
    stickyActionColumn: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    return {
      keyword: ref(''),
      pagination: ref(defaultPagination),
      current: ref(6),
    };
  },
});
</script>

<style lang="scss">
.sticky-table {
  max-height: calc(100vh - 84px);

  .q-table__top {
    padding: 12px 0 6px 0;
  }

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #ffffff;
  }

  thead tr th {
    position: sticky;
    z-index: 2;
    font-size: small;
  }

  thead tr:first-child th {
    top: 0;
  }

  &.q-table--loading thead tr:last-child th {
    top: 48px;
  }
}

.selectable {
  .q-checkbox__inner {
    font-size: 28px;

    .q-checkbox__bg {
      border: 1px solid $grey-6;
    }
  }
}

.sticky-action-cell {
  tr > td:last-child {
    background-color: white;
    position: sticky;
    right: 0;
    z-index: 1;
  }

  thead tr:first-child th:last-child {
    right: 0;
  }
}

.rows-per-page {
  min-height: 30px;
  height: 30px;

  .q-field__control,
  .q-field__native,
  .q-field__marginal {
    min-height: 30px !important;
    height: 30px !important;
  }
}
</style>
