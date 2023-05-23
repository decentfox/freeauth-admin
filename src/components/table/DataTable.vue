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
    :selection="selection"
    binary-state-sort
    :filter="keyword"
    :loading="loading"
    @request="onRequest"
  >
    <template #top>
      <slot name="type-select"></slot>
      <q-input
        v-model="keyword"
        dense
        filled
        debounce="300"
        style="width: 280px"
        :placeholder="searchPlaceholder"
        class="q-mr-sm"
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
      <filter-panel
        v-if="filterColumns?.length > 0"
        :columns="filterColumns"
        @filtered="onFiltered"
      />
      <slot name="extra-filters"></slot>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn
          v-if="!hideImport"
          unelevated
          dense
          class="secondary-btn q-px-md"
        >
          <q-icon size="18px" name="upload" />导入
          <q-tooltip>敬请期待</q-tooltip>
        </q-btn>
        <q-btn
          v-if="!hideExport"
          unelevated
          dense
          class="secondary-btn q-px-md"
        >
          <q-icon size="18px" name="download" />导出
          <q-tooltip>敬请期待</q-tooltip>
        </q-btn>
      </div>
      <slot name="table-action"></slot>

      <q-slide-transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div
          v-if="batchActions && selected.length > 0"
          class="row col-12 justify-center"
        >
          <q-card flat>
            <q-btn
              v-for="(action, i) in batchActions"
              :key="i"
              unelevated
              :label="action"
              class="primary-btn q-ma-sm"
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
          :color="$q.dark.isActive ? 'grey-1' : 'grey-10'"
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
import { QTable, QTableColumn, QTableProps } from 'quasar';

import { FilterColumn, FilterCondition, Pagination, QueryData } from './type';

export default defineComponent({
  name: 'DataTable',

  props: {
    /** 获取数据接口 URL */
    apiUrl: {
      type: String,
      default: null,
    },
    /** 获取数据接口方法，默认为 GET */
    apiMethod: {
      type: String,
      default: 'GET',
    },
    /** 列表字段定义 */
    columns: {
      type: Array as PropType<QTableColumn[]>,
      default: () => [],
    },
    /** 搜索输入框提示文字，默认为 "搜索" */
    searchPlaceholder: {
      type: String,
      default: '搜索',
    },
    /** 是否固定操作列，默认为 false，设置为 true 时，会将列表最后一列固定 */
    stickyActionColumn: {
      type: Boolean,
      default: false,
    },
    /** 批量操作定义 */
    batchActions: {
      type: Array as PropType<string[]>,
      default: null,
    },
    /** 筛选条件定义 */
    filterColumns: {
      type: Array as PropType<FilterColumn[]>,
      default: () => [],
    },
    /** 是否隐藏导出按钮 */
    hideExport: {
      type: Boolean,
      default: false,
    },
    /** 是否隐藏导入按钮 */
    hideImport: {
      type: Boolean,
      default: false,
    },
    /** 是否可以勾选表格行 */
    selection: {
      type: QTable['selection'],
      default: 'none',
    },
  },

  setup() {
    return {
      // API related
      url: ref(''),
      method: ref(''),

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
    };
  },

  mounted() {
    this.setApiInfo(this.apiUrl, this.apiMethod);
    this.fetchRows();
  },

  methods: {
    async fetchRows() {
      if (!this.url || this.loading) {
        return;
      }
      this.loading = true;
      try {
        const resp = await this.$api.request({
          url: this.url,
          method: this.method,
          data: this.method === 'POST' ? this.queryData : null,
          params: this.method === 'GET' ? this.queryData : null,
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

    onFiltered(filters: FilterCondition[]) {
      this.queryData.filter_by = filters;
      this.fetchRows();
    },

    onExternalFiltered(key: string, value: string | boolean) {
      this.queryData[key] = value;
      this.fetchRows();
    },

    removeExternalFilter(key: string) {
      delete this.queryData[key];
      this.fetchRows();
    },

    setApiInfo(apiUrl: string, apiMethod: string) {
      this.url = apiUrl;
      this.method = apiMethod;
    },

    clearRows() {
      this.rows = [];
      this.setApiInfo('', 'GET');
    },
  },
});
</script>

<style lang="scss">
.sticky-table {
  max-height: calc(100vh - 84px);

  .q-table__top {
    padding: 5px;
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
