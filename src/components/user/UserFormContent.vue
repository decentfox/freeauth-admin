<template>
  <div class="q-gutter-md">
    <div>
      <field-label
        v-if="action === FormAction.create"
        text="登录信息"
        required
        hint="至少填写一项"
      />
      <div class="q-gutter-sm">
        <div>
          <field-label
            v-if="action === FormAction.update"
            text="用户名"
            required
            hint="可用于用户名密码登录"
          />
          <q-input
            :model-value="modelValue.username"
            filled
            dense
            placeholder="请填写用户名"
            hide-bottom-space
            class="col"
            :error="!!formError.username"
            :error-message="formError.username"
            @update:model-value="(val) => onModelUpdated('username', val)"
          />
        </div>
        <div>
          <field-label
            v-if="action === FormAction.update"
            text="手机号码"
            hint="可用于手机号验证码登录"
          />
          <q-input
            :model-value="modelValue.mobile"
            filled
            dense
            placeholder="请填写手机号"
            hide-bottom-space
            class="col"
            :error="!!formError.mobile"
            :error-message="formError.mobile"
            @update:model-value="(val) => onModelUpdated('mobile', val)"
          />
        </div>
        <div>
          <field-label
            v-if="action === FormAction.update"
            text="邮箱地址"
            hint="可用于邮箱验证码登录"
          />
          <q-input
            :model-value="modelValue.email"
            filled
            dense
            placeholder="请填写邮箱"
            hide-bottom-space
            class="col"
            :error="!!formError.email"
            :error-message="formError.email"
            @update:model-value="(val) => onModelUpdated('email', val)"
          />
        </div>
      </div>
      <div v-if="!!formError.__root__" class="error-hint text-negative">
        {{ formError.__root__ }}
      </div>
    </div>
    <div>
      <field-label
        text="用户姓名（昵称）"
        :required="action === FormAction.update"
      />
      <q-input
        :model-value="modelValue.name"
        filled
        dense
        placeholder="请填写用户姓名"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="(val) => onModelUpdated('name', val)"
      />
    </div>
    <div v-if="action === FormAction.create">
      <q-toggle
        :model-value="modelValue.reset_pwd_on_first_login"
        label="强制用户在首次登录时修改密码"
        @update:model-value="
          (val) => onModelUpdated('reset_pwd_on_first_login', val)
        "
      />
      <q-toggle
        :model-value="modelValue.send_first_login_email"
        label="通过邮件发送初始默认登录信息"
        :disable="!modelValue.email"
        @update:model-value="
          (val) => onModelUpdated('send_first_login_email', val)
        "
      >
        <q-tooltip
          v-if="!modelValue.email"
          anchor="bottom left"
          self="center start"
        >
          填写有效邮箱后才可启用
        </q-tooltip>
      </q-toggle>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { FormAction } from '../form/type';

import { UserPostData, UserPostError } from './type';

export default defineComponent({
  name: 'RoleFormContent',

  props: {
    /** 用户表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 用户表单数据结构 */
    modelValue: {
      type: Object as PropType<UserPostData>,
      default: () => {
        return {};
      },
    },
    /** 用户表单错误提示 */
    formError: {
      type: Object as PropType<UserPostError>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      FormAction,
    };
  },

  methods: {
    onModelUpdated(field: string, val: string | number | boolean | null) {
      this.$emit(
        'update:modelValue',
        Object.assign({}, this.modelValue, {
          [field]: val,
          send_first_login_email:
            field === 'email' && !val
              ? false
              : this.modelValue.send_first_login_email,
        })
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>
