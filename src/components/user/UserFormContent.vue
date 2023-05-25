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
            :model-value="formData.username"
            filled
            dense
            placeholder="请填写用户名"
            hide-bottom-space
            class="col"
            :error="!!formError.username"
            :error-message="formError.username"
            @update:model-value="
              (value) => {
                $emit('update:username', value);
              }
            "
          />
        </div>
        <div>
          <field-label
            v-if="action === FormAction.update"
            text="手机号码"
            hint="可用于手机号验证码登录"
          />
          <q-input
            :model-value="formData.mobile"
            filled
            dense
            placeholder="请填写手机号"
            hide-bottom-space
            class="col"
            :error="!!formError.mobile"
            :error-message="formError.mobile"
            @update:model-value="
              (value) => {
                $emit('update:mobile', value);
              }
            "
          />
        </div>
        <div>
          <field-label
            v-if="action === FormAction.update"
            text="邮箱地址"
            hint="可用于邮箱验证码登录"
          />
          <q-input
            :model-value="formData.email"
            filled
            dense
            placeholder="请填写邮箱"
            hide-bottom-space
            class="col"
            :error="!!formError.email"
            :error-message="formError.email"
            @update:model-value="
              (value) => {
                updateEmail(value);
              }
            "
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
        :model-value="formData.name"
        filled
        dense
        placeholder="请填写用户姓名"
        hide-bottom-space
        :error="!!formError.name"
        :error-message="formError.name"
        @update:model-value="
          (value) => {
            $emit('update:name', value);
          }
        "
      />
    </div>
    <div v-if="action === FormAction.create">
      <q-toggle
        v-model="passwordChangingRequired"
        label="强制用户在首次登录时修改密码"
      />
      <q-toggle
        v-model="firstLoginNotification"
        label="通过邮件发送初始默认登录信息"
        :disable="!formData.email"
      >
        <q-tooltip
          v-if="!formData.email"
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
import { defineComponent, PropType, ref } from 'vue';

import { UserPostData, UserPostError } from 'pages/user/type';

import { FormAction } from '../form/type';

export default defineComponent({
  name: 'RoleFormContent',

  props: {
    /** 角色表单操作类型：创建或更新 */
    action: {
      type: String as PropType<FormAction>,
      default: FormAction.create,
    },
    /** 角色表单数据结构 */
    formData: {
      type: Object as PropType<UserPostData>,
      default: () => {
        return {};
      },
    },
    /** 角色表单错误提示 */
    formError: {
      type: Object as PropType<UserPostError>,
      default: () => {
        return {};
      },
    },
  },

  emits: ['update:username', 'update:name', 'update:mobile', 'update:email'],

  setup() {
    return {
      FormAction,
      firstLoginNotification: ref(false),
      passwordChangingRequired: ref(false),
    };
  },

  methods: {
    updateEmail(val: string | number | null) {
      this.$emit('update:email', val);
      if (!this.formData.email) this.firstLoginNotification = false;
    },
  },
});
</script>

<style lang="scss" scoped></style>
