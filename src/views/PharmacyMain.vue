<template>
  <div class="page-header">
    <h1>Аптека</h1>
    <el-button
      type="primary"
      size="large"
      @click="openCreateDialog">
      Добавить препарат
    </el-button>
  </div>

  <main class="pharmacy-main">
    <PharmacyToolbar
      v-model="searchTerm"
      v-model:prescription-filter="prescriptionFilter"
      @search="resetPage"
      @filter="resetPage"
    />

    <PharmacyTable
      :data="paginatedMedicines"
      :loading="loading"
      :error="error"
      :currentPage="currentPage"
      :pageSize="pageSize"
      :total="filteredMedicines.length"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
      @retry="loadMedicines"
      @update:current-page="currentPage = $event"
      @update:page-size="handlePageSizeChange"
    />

    <OpenMedDialog
      v-model:visible="dialogVisible"
      :medicine="editingMedicine"
      :isEditing="isEditing"
      :saveSubmitting="saveSubmitting"
      @save="submitForm"
    />

    <DeleteMedDialog
      v-model:visible="deleteDialogVisible"
      :medicine="deletingMedicine"
      :deleteSubmitting="deleteSubmitting"
      @confirm="confirmDelete"
    />
  </main>
</template>

<script>
import { ElMessage } from 'element-plus';

import mockedFetch from '@/backend';
import DeleteMedDialog from '@/components/DeleteMedDialog.vue';
import OpenMedDialog from '@/components/OpenMedDialog.vue';
import PharmacyTable from '@/components/PharmacyTable.vue';
import PharmacyToolbar from '@/components/PharmacyToolbar.vue';
import { EDITABLE_MED_FORM_FIELDS } from '@/utils/Constants';
import { hasFormChanges, normalizeForm, parseResponseJson } from '@/utils/Helpers.js';

export default {
  name: `PharmacyMain`,
  components: {
    PharmacyTable,
    PharmacyToolbar,
    DeleteMedDialog,
    OpenMedDialog,
  },
  data() {
    return {
      medicines: [],
      searchTerm: ``,
      prescriptionFilter: `all`,
      pageSize: 10,
      currentPage: 1,
      loading: false,
      error: ``,

      dialogVisible: false,
      isEditing: false,
      editingMedicine: null,
      saveSubmitting: false,

      deleteDialogVisible: false,
      deletingMedicine: null,
      deleteSubmitting: false,
    };
  },
  computed: {
    filteredMedicines() {
      const term = this.searchTerm.trim().toLowerCase();
      return this.medicines.filter((medicine) => {
        const matchesTerm = !term || medicine.tradeName.toLowerCase().includes(term);
        const matchesPrescription =
          this.prescriptionFilter === `all` ||
          (this.prescriptionFilter === `required` && medicine.prescriptionRequired) ||
          (this.prescriptionFilter === `optional` && !medicine.prescriptionRequired);
        return matchesTerm && matchesPrescription;
      });
    },
    paginatedMedicines() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredMedicines.slice(startIndex, startIndex + this.pageSize);
    }
  },
  watch: {
    searchTerm() {
      this.resetPage();
    },
    prescriptionFilter() {
      this.resetPage();
    },
    pageSize() {
      this.resetPage();
    },
    filteredMedicines() {
      const totalPages = Math.max(1, Math.ceil(this.filteredMedicines.length / this.pageSize));
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
    }
  },
  mounted() {
    this.loadMedicines();
  },
  methods: {
    resetPage() {
      this.currentPage = 1;
    },
    async loadMedicines() {
      this.loading = true;
      this.error = ``;
      const errorMessage = `Ошибка загрузки данных`;

      try {
        const response = await mockedFetch(`/api/medicines`);
        const payload = await parseResponseJson(response);

        if (!response.ok) {
          throw new Error(payload?.error?.message || errorMessage);
        }

        this.medicines = Array.isArray(payload?.items) ? payload.items : [];
      } catch (loadError) {
        this.medicines = [];
        this.error = loadError?.message || errorMessage;
      } finally {
        this.loading = false;
      }
    },

    async submitForm(preparedData) {
      const saveErrorMsg = `Не удалось сохранить препарат`;

      if (this.isEditing && this.editingMedicine) {
        const original = normalizeForm(this.editingMedicine);
        const hasChanges = hasFormChanges(original, preparedData, EDITABLE_MED_FORM_FIELDS);

        if (!hasChanges) {
          ElMessage.info(`Изменений не внесено.`);
          this.dialogVisible = false;
          return;
        }
      }

      this.saveSubmitting = true;
      try {
        const method = this.isEditing ? `PATCH` : `POST`;
        const url = this.isEditing
          ? `/api/medicines/${this.editingMedicine.id}`
          : `/api/medicines`;

        const response = await mockedFetch(url, {
          method,
          headers: { 'Content-Type': `application/json` },
          body: JSON.stringify(preparedData),
        });
        const payload = await parseResponseJson(response);

        if (!response.ok) {
          throw new Error(payload?.error?.message || saveErrorMsg);
        }

        this.dialogVisible = false;
        await this.loadMedicines();
        ElMessage.success(this.isEditing ? `Препарат обновлён` : `Препарат добавлен`);
      } catch (submitError) {
        ElMessage.error(submitError?.message || saveErrorMsg);
      } finally {
        this.saveSubmitting = false;
      }
    },

    async confirmDelete(payload) {
      const deleteErrorMsg = `Не удалось удалить препарат`;
      this.deleteSubmitting = true;
      try {
        const response = await mockedFetch(`/api/medicines/${this.deletingMedicine.id}`, {
          method: `DELETE`,
          headers: { 'Content-Type': `application/json` },
          body: JSON.stringify(payload),
        });
        const parsed = await parseResponseJson(response);

        if (!response.ok) {
          throw new Error(parsed?.error?.message || deleteErrorMsg);
        }

        this.deleteDialogVisible = false;
        await this.loadMedicines();
        ElMessage.success(`Препарат удалён`);
      } catch (deleteError) {
        ElMessage.error(deleteError?.message || deleteErrorMsg);
      } finally {
        this.deleteSubmitting = false;
      }
    },

    openCreateDialog() {
      this.isEditing = false;
      this.editingMedicine = null;
      this.dialogVisible = true;
    },

    openEditDialog(medicine) {
      this.isEditing = true;
      this.editingMedicine = medicine;
      this.dialogVisible = true;
    },

    openDeleteDialog(medicine) {
      this.deletingMedicine = medicine;
      this.deleteDialogVisible = true;
    },

    handlePageSizeChange(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
    }
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
}
.pharmacy-main {
  box-sizing: border-box;
  min-height: 100%;
  padding: 12px;
}
</style>
