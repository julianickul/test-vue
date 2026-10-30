<template>
  <el-dialog
    :modelValue="visible"
    :title="isEditing ? 'Редактирование препарата' : 'Добавление препарата'"
    width="620px"
    destroyOnClose
    @update:model-value="$emit('update:visible', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      labelWidth="220px"
      labelPosition="left"
    >

      <el-form-item label="Торговое наименование" prop="tradeName">
        <el-input
          v-model="form.tradeName"
          maxlength="200"
          :showWordLimit="true" />
      </el-form-item>

      <el-form-item label="Форма" prop="dosageForm">
        <el-select
          v-model="form.dosageForm"
          placeholder="Выберите форму">
          <el-option
            v-for="opt in dosageFormOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="Дозировка" prop="dosage">
        <el-input
          v-model="form.dosage"
          maxlength="100"
          :showWordLimit="true" />
      </el-form-item>

      <el-form-item label="Количество в упаковке" prop="packageQuantity">
        <el-input-number
          v-model="form.packageQuantity"
          :min="1"
          :max="1000"
          :precision="0" />
      </el-form-item>

      <el-form-item label="Единица упаковки" prop="packageUnit">
        <el-select
          v-model="form.packageUnit"
          placeholder="Выберите единицу">
          <el-option
            v-for="opt in packageUnitOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="Производитель" prop="manufacturer">
        <el-input
          v-model="form.manufacturer"
          maxlength="200"
          :showWordLimit="true" />
      </el-form-item>

      <el-form-item label="Страна" prop="country">
        <el-select
          v-model="form.country"
          placeholder="Выберите страну">
          <el-option
            v-for="opt in countryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="Рецептурный отпуск" prop="prescriptionRequired">
        <el-radio-group v-model="form.prescriptionRequired">
          <el-radio :value="true">Да</el-radio>
          <el-radio :value="false">Нет</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Регистрационный номер" prop="registrationNumber">
        <el-input
          v-model="form.registrationNumber"
          maxlength="100"
          clearable />
      </el-form-item>

      <el-form-item label="Примечания" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          maxlength="1000"
          :showWordLimit="true" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="$emit('update:visible', false)">Отмена</el-button>
        <el-button
          type="primary"
          :loading="saveSubmitting"
          :disabled="!canSave"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Сохранить' : 'Добавить' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  COUNTRY_OPTIONS,
  DOSAGE_FORM_OPTIONS,
  EDITABLE_MED_FORM_FIELDS,
  PACKAGE_UNIT_OPTIONS
} from '@/utils/Constants';
import {
  hasFormChanges,
  normalizeForm,
  trimValue
} from '@/utils/Helpers';

const INITIAL_MED_FORM_VALUES = {
  tradeName: ``,
  dosageForm: `tablet`,
  dosage: ``,
  packageQuantity: 1,
  packageUnit: `tablet`,
  manufacturer: ``,
  country: `RU`,
  registrationNumber: ``,
  prescriptionRequired: false,
  notes: ``,
};

export default {
  name: `OpenMedDialog`,
  props: {
    visible: { type: Boolean, default: false },
    medicine: { type: Object, default: null },
    isEditing: { type: Boolean, default: false },
    saveSubmitting: { type: Boolean, default: false }
  },
  emits: [`update:visible`, `save`],
  data() {
    return {
      form: { ...INITIAL_MED_FORM_VALUES },
      countryOptions: COUNTRY_OPTIONS,
      dosageFormOptions: DOSAGE_FORM_OPTIONS,
      packageUnitOptions: PACKAGE_UNIT_OPTIONS,
      formRules: {
        tradeName: [
          { required: true, message: `Укажите торговое наименование`, trigger: `blur` },
          {
            validator: (rule, value, callback) => {
              const trimmed = trimValue(value);
              if (trimmed.length < 2 || trimmed.length > 200) {
                callback(new Error(`От 2 до 200 символов`));
              } else {
                callback();
              }
            },
            trigger: [`blur`, `change`]
          }
        ],
        dosageForm: [{ required: true, message: `Укажите форму препарата`, trigger: `change` }],
        dosage: [{ required: true, message: `Укажите дозировку`, trigger: `blur` }],
        packageQuantity: [{ required: true, message: `Укажите количество`, trigger: `change` }],
        packageUnit: [{ required: true, message: `Укажите единицу упаковки`, trigger: `change` }],
        manufacturer: [{ required: true, message: `Укажите производителя`, trigger: `blur` }],
        country: [{ required: true, message: `Выберите страну`, trigger: `change` }]
      }
    };
  },
  computed: {
    isFormDirty() {
      if (!this.isEditing || !this.medicine) {
        return true;
      }
      const initial = normalizeForm(this.medicine);
      const current = normalizeForm(this.form);
      return hasFormChanges(initial, current, EDITABLE_MED_FORM_FIELDS);
    },

    isFormValid() {
      const values = normalizeForm(this.form);

      return (
        values.tradeName.length >= 2 &&
        values.tradeName.length <= 200 &&
        values.dosageForm &&
        values.dosage.length > 0 &&
        values.dosage.length <= 100 &&
        values.packageQuantity >= 1 &&
        values.packageQuantity <= 1000 &&
        values.packageUnit &&
        values.manufacturer.length >= 2 &&
        values.manufacturer.length <= 200 &&
        values.country &&
        (values.registrationNumber === null || values.registrationNumber.length <= 100) &&
        (values.notes === null || values.notes.length <= 1000)
      );

    },

    canSave() {
      return !this.saveSubmitting && this.isFormValid && this.isFormDirty;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        if (this.isEditing && this.medicine) {
          this.form = {
            ...this.medicine,
            registrationNumber: this.medicine.registrationNumber ?? ``,
            notes: this.medicine.notes ?? ``
          };
        } else {
          this.resetForm();
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.form = { ...INITIAL_MED_FORM_VALUES };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    async handleSubmit() {
      try {
        await this.$refs.formRef.validate();
        this.$emit(`save`, normalizeForm(this.form));
      } catch {
        // ошибки выводятся стандартными средствами компонентов формы
      }
    }
  }
};
</script>

<style scoped>
.dialog-actions {
  display: flex;
  justify-content:
  flex-end;
  gap: 12px;
}
</style>
