<template>
  <q-table
    v-model:pagination="pagination"
    v-model:selected="selected"
    flat
    class="sticky-table selectable"
    :class="{ 'sticky-action-cell': stickyActionColumn }"
    :rows="rows"
    :columns="columns"
    row-key="id"
    selection="multiple"
    binary-state-sort
    :filter="keyword"
    :loading="loading"
    @request="onRequest"
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
      <q-btn
        unelevated
        dense
        icon="tune"
        class="q-ml-sm"
        :class="hasBeenFiltered ? 'primary-btn' : 'flat-btn'"
      >
        <q-menu class="q-pa-sm" anchor="bottom left" self="top middle">
          <div
            v-for="(conditoin, idx) in filters"
            :key="idx"
            class="row no-wrap q-py-sm text-h6"
            style="width: 560px"
          >
            <div class="col-4 q-px-xs">
              <q-select
                v-model="conditoin.field"
                filled
                dense
                :options="['姓名', '用户名', '手机号']"
                label="选择字段"
                stack-label
              >
              </q-select>
            </div>
            <div class="col-3 q-px-xs">
              <q-select
                v-model="conditoin.operator"
                filled
                dense
                :options="['等于', '不等于']"
                label="选择运算符"
                stack-label
              >
              </q-select>
            </div>
            <div class="col-5 q-px-xs">
              <div class="row">
                <q-input
                  v-model="conditoin.value"
                  dense
                  filled
                  class="col"
                  label="数值"
                  stack-label
                />
                <q-btn
                  v-if="filters.length > 1"
                  flat
                  dense
                  size="10px"
                  icon="remove_circle_outline"
                  class="flat-btn q-ml-xs"
                  @click="removeFilter(idx)"
                />
              </div>
            </div>
          </div>
          <div class="row no-wrap q-px-xs q-my-sm" style="width: 560px">
            <q-btn flat class="flat-btn" @click="addFilter">
              <q-icon size="18px" name="add_circle_outline" class="q-mr-xs" />
              添加筛选条件
            </q-btn>
            <q-space />
            <q-btn
              unelevated
              class="secondary-btn"
              color="secondary"
              @click="resetFilter"
            >
              <q-icon size="18px" name="restart_alt" />重置
            </q-btn>
            <q-btn unelevated class="q-ml-sm primary-btn" @click="search">
              <q-icon size="18px" name="search" />搜索
            </q-btn>
          </div>
        </q-menu>
      </q-btn>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn unelevated class="secondary-btn" color="secondary">
          <q-icon size="18px" name="upload" />导入
        </q-btn>
        <q-btn unelevated class="secondary-btn" color="secondary">
          <q-icon size="18px" name="download" />导出
        </q-btn>
      </div>
      <slot name="table-action"></slot>

      <q-slide-transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div
          v-if="actions && selected.length > 0"
          class="row col-12 justify-center"
        >
          <q-card class="bg-secondary">
            <q-btn
              v-for="(action, i) in actions"
              :key="i"
              unelevated
              :label="action"
              class="q-ma-sm"
              @click="$emit(action.replace(' ', '-'), selected)"
            />
          </q-card>
        </div>
      </q-slide-transition>
    </template>

    <template
      v-for="(_, name) in ($slots as Readonly<unknown>)"
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
          v-model="pagination.page"
          active-design="unelevated"
          active-color="primary"
          :color="$q.dark.isActive ? 'grey-2' : 'grey-10'"
          active-text-color="white"
          :max="pagination.last"
          :max-pages="6"
          boundary-numbers
          direction-links
          icon-prev="arrow_left"
          icon-next="arrow_right"
          gutter="2px"
          @update:model-value="onPaginate"
        />
        <q-separator vertical />
        <q-select
          v-model="pagination.rowsPerPage"
          outlined
          dense
          :options="[5, 7, 10]"
          class="q-ml-md rows-per-page"
          @update:model-value="onPaginate"
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
import { QTableColumn, QTableProps } from 'quasar';

import { FilterCondition, Pagination, QueryData } from 'components/table/type';

export default defineComponent({
  name: 'DataTable',

  props: {
    apiUrl: {
      type: String,
      default: null,
    },
    apiMethod: {
      type: String,
      default: 'GET',
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
    actions: {
      type: [Array, Object],
      default: null,
    },
  },

  setup() {
    return {
      // Server side request
      loading: ref(false),
      queryData: ref<QueryData>({
        page: 1,
        per_page: 10,
      }),
      rows: ref([]),

      // Search
      keyword: ref(''),

      // Pagination
      pagination: ref<Pagination>({
        sortBy: '',
        descending: false,
        page: 1,
        last: 1,
        rowsPerPage: 10,
        rowsNumber: 0,
      }),

      // Row Check
      selected: ref([]),

      // Filter
      filters: ref<FilterCondition[]>([
        { field: null, operator: null, value: null },
      ]),
      hasBeenFiltered: ref(false),
    };
  },

  mounted() {
    this.fetchRows();
  },

  methods: {
    async fetchRows() {
      if (!this.apiUrl || this.loading) {
        return;
      }
      this.loading = true;
      try {
        const resp = await this.$api.request({
          url: this.apiUrl,
          method: this.apiMethod,
          data: this.apiMethod === 'POST' ? this.queryData : null,
          params: this.apiMethod === 'GET' ? this.queryData : null,
          hideProgress: true,
        });
        const data = resp.data;
        this.rows = data.rows;
        this.pagination = Object.assign({}, this.pagination, {
          page: data.page,
          rowsPerPage: data.per_page,
          rowsNumber: data.total,
          last: data.last,
        });
      } catch (e) {
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async onRequest(
      props: Parameters<NonNullable<QTableProps['onRequest']>>[0]
    ) {
      const { sortBy, descending } = props.pagination;
      this.queryData.q = props.filter;
      this.queryData.order_by = !!sortBy
        ? [`${descending ? '-' : ''}${sortBy}`]
        : [];
      this.pagination.sortBy = sortBy;
      this.pagination.descending = descending;
      this.fetchRows();
    },

    onPaginate() {
      this.queryData.page = this.pagination.page;
      this.queryData.per_page = this.pagination.rowsPerPage;
      this.fetchRows();
    },

    addFilter() {
      this.filters.push({ field: null, operator: null, value: null });
    },

    removeFilter(index: number) {
      this.filters.splice(index, 1);
    },

    resetFilter() {
      this.filters = [{ field: null, operator: null, value: null }];
      this.hasBeenFiltered = false;
    },

    search() {
      this.hasBeenFiltered = true;
    },
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

body.body--dark {
  .sticky-table {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: $dark;
    }
  }

  .sticky-action-cell {
    tr > td:last-child {
      background-color: $dark;
    }
  }
}
</style>
