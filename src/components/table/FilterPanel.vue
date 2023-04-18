<template>
  <q-btn
    unelevated
    dense
    icon="tune"
    class="q-ml-sm"
    :class="hasBeenFiltered ? 'primary-btn' : 'flat-btn'"
  >
    <q-tooltip>设置过滤条件</q-tooltip>
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
            :options="fieldOptions"
            label="选择字段"
            stack-label
            emit-value
            map-options
          >
          </q-select>
        </div>
        <div class="col-3 q-px-xs">
          <q-select
            v-model="conditoin.operator"
            filled
            dense
            :options="getOperatorOptions(conditoin.field)"
            label="选择运算符"
            stack-label
            emit-value
            map-options
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
        <q-btn unelevated class="secondary-btn" @click="resetFilter">
          <q-icon size="18px" name="restart_alt" />重置
        </q-btn>
        <q-btn unelevated class="q-ml-sm primary-btn" @click="search">
          <q-icon size="18px" name="search" />搜索
        </q-btn>
      </div>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { FilterColumn, FilterCondition, FilterOperator } from './type';

export default defineComponent({
  name: 'FilterPanel',

  props: {
    columns: {
      type: Array as PropType<FilterColumn[]>,
      default: () => [],
    },
  },

  setup() {
    return {
      filters: ref<FilterCondition[]>([]),
      hasBeenFiltered: ref(false),
    };
  },

  computed: {
    fieldOptions() {
      return this.columns.map((c) => ({
        value: c.field,
        label: c.label,
      }));
    },
  },

  methods: {
    getOperatorOptions(field: string | null) {
      let operators = [
        FilterOperator.eq,
        FilterOperator.neq,
        FilterOperator.gt,
        FilterOperator.gte,
        FilterOperator.lt,
        FilterOperator.lte,
        FilterOperator.ct,
        FilterOperator.nct,
      ];
      if (!!field) {
        operators =
          this.columns.filter((c) => c.field === field)[0].operatorOptions ||
          operators;
      }
      return operators;
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
