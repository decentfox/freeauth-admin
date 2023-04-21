<template>
  <q-btn
    unelevated
    dense
    icon="tune"
    class="q-ml-sm"
    :class="hasBeenFiltered ? 'primary-btn' : 'text-black-white'"
  >
    <q-tooltip>设置过滤条件</q-tooltip>
    <q-menu
      v-model="showing"
      class="q-pa-sm"
      anchor="bottom left"
      self="top middle"
    >
      <q-form ref="form" greedy>
        <div
          v-for="(condition, idx) in filters"
          :key="idx"
          class="row no-wrap q-py-sm text-h6"
          style="width: 560px"
        >
          <div class="col-4 q-px-xs">
            <q-select
              v-model="condition.field"
              filled
              dense
              hide-bottom-space
              :options="fieldOptions"
              label="选择字段"
              stack-label
              emit-value
              map-options
              lazy-rules="ondemand"
              :rules="[(val) => !!val || '请选择字段']"
              @update:model-value="(val) => resetCondition(idx, val)"
            >
            </q-select>
          </div>
          <div class="col-3 q-px-xs">
            <q-select
              v-model="condition.operator"
              filled
              dense
              hide-bottom-space
              :options="getOperatorOptions(condition.field)"
              label="选择运算符"
              stack-label
              emit-value
              map-options
              lazy-rules="ondemand"
              :rules="[(val) => !!val || '请选择运算符']"
            >
            </q-select>
          </div>
          <div class="col-5 q-px-xs">
            <div class="row">
              <q-input
                v-if="getConditionType(condition.field) === 'input'"
                v-model="condition.value"
                dense
                filled
                class="col"
                label="数值"
                stack-label
                hide-bottom-space
                lazy-rules="ondemand"
                :rules="[(val) => !!val || '请输入数值']"
              />
              <date-select
                v-else-if="
                  ['date', 'datetime'].includes(
                    getConditionType(condition.field)
                  )
                "
                v-model="condition.value"
                label="日期"
                dense
                filled
                class="col"
                stack-label
                hide-bottom-space
                lazy-rules="ondemand"
                :rules="[(val: any) => !!val || '请选择日期']"
              />
              <q-select
                v-else-if="getConditionType(condition.field) === 'select'"
                v-model="condition.value"
                label="请选择"
                :options="getConditionOptions(condition.field)"
                dense
                filled
                class="col"
                stack-label
                emit-value
                map-options
                hide-bottom-space
                lazy-rules="ondemand"
                :rules="[(val) => !!val || val === false || '请选择选项']"
              />
              <q-btn
                v-if="filters.length > 1"
                flat
                dense
                size="10px"
                icon="remove_circle_outline"
                class="text-black-white q-ml-xs"
                @click="removeFilter(idx)"
              />
            </div>
          </div>
        </div>
        <div class="row no-wrap q-px-xs q-my-sm" style="width: 560px">
          <q-btn flat class="text-black-white" @click="addFilter">
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
      </q-form>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { date, QForm } from 'quasar';

import DateSelect from 'components/form/DateSelect.vue';

import {
  FilterColumn,
  FilterCondition,
  FilterOperator,
  FilterOperatorMap,
} from './type';

export default defineComponent({
  name: 'FilterPanel',

  components: { DateSelect },

  props: {
    columns: {
      type: Array as PropType<FilterColumn[]>,
      default: () => [],
    },
  },

  emits: ['filtered'],

  setup() {
    return {
      filters: ref<FilterCondition[]>([]),
      filterErrors: ref({}),
      hasBeenFiltered: ref(false),
      showing: ref(false),
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

  mounted() {
    this.addFilter();
  },

  methods: {
    getOperatorOptions(field?: string) {
      let operators: FilterOperator[] = [
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
      return operators.map((o) => ({ value: o, label: FilterOperatorMap[o] }));
    },

    getConditionType(field?: string) {
      if (!!field) {
        return this.columns.filter((c) => c.field === field)[0].type || 'input';
      }
      return 'input';
    },

    getConditionOptions(field?: string) {
      if (!!field) {
        return this.columns.filter((c) => c.field === field)[0].options || [];
      }
      return [];
    },

    addFilter() {
      this.filters.push({});
    },

    removeFilter(index: number) {
      this.filters.splice(index, 1);
    },

    resetFilter() {
      this.filters = [{}];
      this.hasBeenFiltered = false;
      (this.$refs.form as QForm).resetValidation();
      this.$emit('filtered', []);
    },

    resetCondition(idx: number, field: string) {
      this.filters[idx] = { field: field };
    },

    getFilters() {
      let filters: FilterCondition[] = [];
      this.filters.forEach((f) => {
        const type = this.getConditionType(f.field);
        const field = Object.assign({}, f);
        if (type !== 'datetime') {
          filters.push(field);
        } else if (f.value && f.operator) {
          const value = f.value.split('-');
          const dtStart = date.buildDate(
            {
              year: parseInt(value[0]),
              month: parseInt(value[1]),
              date: parseInt(value[2]),
              hours: 0,
              minutes: 0,
              seconds: 0,
            },
            false
          );
          const dtEnd = date.addToDate(dtStart, { days: 1 });
          if (f.operator === FilterOperator.eq) {
            filters.push({
              field: f.field,
              operator: FilterOperator.gte,
              value: dtStart.toISOString(),
            });
            filters.push({
              field: f.field,
              operator: FilterOperator.lt,
              value: dtEnd.toISOString(),
            });
          } else if (f.operator === FilterOperator.neq) {
            filters.push({
              field: f.field,
              operator: FilterOperator.lt,
              value: dtStart.toISOString(),
            });
            filters.push({
              field: f.field,
              operator: FilterOperator.gte,
              value: dtEnd.toISOString(),
            });
          } else if (f.operator === FilterOperator.gt) {
            filters.push({
              field: f.field,
              operator: FilterOperator.gte,
              value: dtEnd.toISOString(),
            });
          } else if (f.operator === FilterOperator.gte) {
            filters.push({
              field: f.field,
              operator: FilterOperator.gte,
              value: dtStart.toISOString(),
            });
          } else if (f.operator === FilterOperator.lte) {
            filters.push({
              field: f.field,
              operator: FilterOperator.lt,
              value: dtEnd.toISOString(),
            });
          } else {
            filters.push({
              field: f.field,
              operator: FilterOperator.lte,
              value: dtStart.toISOString(),
            });
          }
        }
      });
      return filters;
    },

    async search() {
      const valid = await (this.$refs.form as QForm).validate(true);
      if (!valid) {
        return;
      }

      this.$emit('filtered', this.getFilters());
      this.hasBeenFiltered = true;
      this.showing = false;
    },
  },
});
</script>
