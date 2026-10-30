<template>
  <section class="toolbar">
    <el-input
      :modelValue="modelValue"
      clearable
      placeholder="Поиск по торговому наименованию"
      class="toolbar__search"
      @update:model-value="$emit('update:modelValue', $event)"
      @input="$emit('search')"
    />
    <el-select
      :modelValue="prescriptionFilter"
      class="toolbar__filter"
      @update:model-value="$emit('update:prescriptionFilter', $event)"
      @change="$emit('filter')"
    >
      <el-option label="Все" value="all" />
      <el-option label="Рецептурные" value="required" />
      <el-option label="Безрецептурные" value="optional" />
    </el-select>
  </section>
</template>

<script>
export default {
  name: `PharmacyToolbar`,
  props: {
    modelValue: { type: String, default: `` },
    prescriptionFilter: { type: String, default: `all` }
  },
  emits: [
    `update:modelValue`,
    `update:prescriptionFilter`,
    `search`,
    `filter`
  ]
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;

  &__search {
    flex: 1;
  }

  &__filter {
    width: 30%;
    min-width: 220px;
  }
}

@media (max-width: 840px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;

    &__filter {
      width: 100%;
    }
  }
}
</style>
