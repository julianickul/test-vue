<template>
  <el-dialog
    :modelValue="visible"
    title="Удаление препарата"
    width="620px"
    destroyOnClose
    @update:model-value="$emit('update:visible', $event)"
    @closed="resetForm"
  >
    <dl class="delete-info" v-if="medicine">
      <dt class="delete-info__term">Название</dt>
      <dd class="delete-info__desc">{{ medicine.tradeName }}</dd>
      <dt class="delete-info__term">Дозировка</dt>
      <dd class="delete-info__desc">{{ medicine.dosage }}</dd>
      <dt class="delete-info__term">Производитель</dt>
      <dd class="delete-info__desc">{{ medicine.manufacturer }}</dd>
    </dl>

    <el-form
      ref="deleteFormRef"
      :model="deleteForm"
      :rules="deleteRules"
      labelWidth="180px"
      labelPosition="top"
    >
      <el-form-item label="Причина" prop="reason">
        <el-radio-group
          v-model="deleteForm.reason"
          class="radio-group"
        >
          <el-radio value="duplicate">Дублирующая запись</el-radio>
          <el-radio value="incorrect_entry">Карточка создана ошибочно</el-radio>
          <el-radio value="discontinued">Препарат больше не используется в каталоге аптеки</el-radio>
          <el-radio value="other">Другая причина</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="Комментарий"
        prop="comment"
        :required="deleteForm.reason === 'other'"
      >
        <el-input
          v-model="deleteForm.comment"
          type="textarea"
          :rows="4"
          maxlength="500"
          :showWordLimit="true"
          placeholder="Укажите комментарий"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="$emit('update:visible', false)">Отмена</el-button>
        <el-button
          type="danger"
          :loading="deleteSubmitting"
          :disabled="!canConfirmDelete"
          @click="handleConfirm"
        >
          Подтвердить удаление
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { trimValue } from '@/utils/Helpers';

export default {
  name: `DeleteMedDialog`,
  props: {
    visible: { type: Boolean, default: false },
    medicine: { type: Object, default: null },
    deleteSubmitting: { type: Boolean, default: false }
  },
  emits: [`update:visible`, `confirm`],
  data() {
    return {
      deleteForm: { reason: ``, comment: `` },
      deleteRules: {
        reason: [
          { required: true, message: `Укажите причину удаления`, trigger: `change` }
        ],
        comment: [
          {
            validator: (rule, value, callback) => {
              const trimmed = trimValue(value) || ``;

              if (this.deleteForm.reason === `other`) {
                if (trimmed.length < 10 || trimmed.length > 500) {
                  callback(new Error(`Комментарий должен содержать от 10 до 500 символов`));
                  return;
                }
              } else {
                if (trimmed.length > 500) {
                  callback(new Error(`Комментарий должен содержать не более 500 символов`));
                  return;
                }
              }

              callback();
            },
            trigger: [`blur`, `change`]
          }
        ]
      }
    };
  },
  computed: {
    isDeleteFormValid() {
      const reason = this.deleteForm.reason;
      const comment = trimValue(this.deleteForm.comment) || ``;

      if (!reason) {
        return false;
      }

      if (reason === `other`) {
        if (comment.length < 10 || comment.length > 500) {
          return false;
        }
      } else {
        if (comment.length > 500) {
          return false;
        }
      }

      return true;
    },

    canConfirmDelete() {
      return !this.deleteSubmitting && this.isDeleteFormValid;
    }
  },
  watch: {
    'deleteForm.reason'(newReason) {
      if (newReason !== `other` && this.$refs.deleteFormRef) {
        this.$refs.deleteFormRef.clearValidate(`comment`);
      }
    },
    visible(newVal) {
      if (!newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.deleteForm = { reason: ``, comment: `` };
      this.$nextTick(() => {
        if (this.$refs.deleteFormRef) {
          this.$refs.deleteFormRef.clearValidate();
        }
      });
    },
    async handleConfirm() {
      try {
        await this.$refs.deleteFormRef.validate();

        this.$emit(`confirm`, {
          reason: this.deleteForm.reason,
          comment: trimValue(this.deleteForm.comment) || undefined
        });
      } catch {
        // Валидация не прошла. Элементы формы уже подсвечены красным.
        // Диалог остается открытым, кнопка заблокирована.
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.delete-info {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f6f9ff;
  border: 1px solid #dbe9ff;
  color: #2d3a4a;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;

  &__desc {
    font-weight: bold;
    margin: 0;
  }
}

.radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
