<template>
  <section class="pharmacy-table-wrapper" v-loading="loading">

    <template v-if="error">
      <div class="status-message status-message_error">
        <p>{{ error }}</p>
        <el-button
          type="primary"
          @click="$emit('retry')">
          Загрузить данные
        </el-button>
      </div>
    </template>

    <template v-else>
      <el-table
        :data="data"
        stripe
        border
        highlightCurrentRow
        class="pharmacy-table"
        emptyText="Нет данных"
      >

        <el-table-column
          prop="tradeName"
          label="Торговое наименование"
          minWidth="150"
        />

        <el-table-column
          prop="dosageForm"
          label="Форма"
          minWidth="100"
        >
          <template #default="{ row }">
            {{ getLabelByValue(dosageFormOptions, row.dosageForm) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="dosage"
          label="Дозировка"
          minWidth="100"
        />

        <el-table-column label="Упаковка" minWidth="120">
          <template #default="{ row }">
            {{ row.packageQuantity }} {{ getLabelByValue(packageUnitOptions, row.packageUnit) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="manufacturer"
          label="Производитель"
          minWidth="150"
        />

        <el-table-column label="Страна" minWidth="100">
          <template #default="{ row }">
            {{ getLabelByValue(countryOptions, row.country) }}
          </template>
        </el-table-column>

        <el-table-column label="Рецептурный отпуск" minWidth="130">
          <template #default="{ row }">
            {{ row.prescriptionRequired ? 'Да' : 'Нет' }}
          </template>
        </el-table-column>

        <el-table-column
          label="Действия"
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="pharmacy-table__actions">
              <el-button
                type="primary"
                :icon="Edit"
                circle
                @click="$emit('edit', row)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="$emit('delete', row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="data.length" class="pharmacy-table__pagination">
        <el-pagination
          :currentPage="currentPage"
          :pageSize="pageSize"
          :pageSizes="[10, 20, 50]"
          :total="total"
          layout="sizes, prev, pager, next, total"
          background
          @update:current-page="$emit('update:current-page', $event)"
          @update:page-size="$emit('update:page-size', $event)"
        />
      </div>
    </template>
  </section>
</template>

<script>
import { markRaw } from 'vue';

import { Delete, Edit } from '@element-plus/icons-vue';

import {
  COUNTRY_OPTIONS,
  DOSAGE_FORM_OPTIONS,
  PACKAGE_UNIT_OPTIONS,
} from '@/utils/Constants';
import { getLabelByValue } from '@/utils/Helpers';

export default {
  name: `PharmacyTable`,
  props: {
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: String, default: `` },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 }
  },
  emits: [
    `edit`,
    `delete`,
    `retry`,
    `update:current-page`,
    `update:page-size`
  ],
  data() {
    return {
      countryOptions: COUNTRY_OPTIONS,
      dosageFormOptions: DOSAGE_FORM_OPTIONS,
      packageUnitOptions: PACKAGE_UNIT_OPTIONS,
      getLabelByValue,
      Edit: markRaw(Edit),
      Delete: markRaw(Delete),
    };
  }
};
</script>

<style lang="scss" scoped>
.pharmacy-table-wrapper {
  padding: 16px;
}

.pharmacy-table {
  width: 100%;

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}

.status-message {
  padding: 24px;
  text-align: center;
  color: #606266;

  &_error {
    color: #f56c6c;
    border: 1px dashed #f56c6c;
    border-radius: 4px;
    background: #fef0f0;
  }
}
</style>
