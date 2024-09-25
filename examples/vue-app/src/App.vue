<template>
  <ImexportTable @imported="importedHandler" :info="info" ref="imexportTableRef" v-show="false" />
  <button @click="createTemplate()">CreateTemplate</button><br />
  <button @click="exportWithData()">ExportWithData</button><br />
  <button @click="importData()">ImportData</button>

</template>

<script setup lang="ts">
import { ImexportTable } from '@senlinz/import-export-vue';
import { onMounted, ref } from 'vue';

const imexportTableRef = ref<InstanceType<typeof ImexportTable>>();

const info = {
  name: 'Pet',
  sheetName: 'pet_sheet',
  columns: [
    {
      key: 'name',
      name: 'Name'
    },
    {
      key: 'age',
      name: 'Age'
    },
    {
      key: 'type',
      name: 'Type'
    }
  ]
}


function getImexportTableEl() {
  return imexportTableRef.value!.$el as HTMLImexportTableElement;
}

const importedHandler = (e: any) => {
  console.log('imported', e.detail);
}

function createTemplate() {
  getImexportTableEl().exportExcelTemplate();
}

function exportWithData() {
  getImexportTableEl().exportExcel([
    { name: 'Tom', age: 3, type: 'Cat' },
    { name: 'Jerry', age: null, type: 'Mouse' }
  ]);
}

function importData() {
  getImexportTableEl().importExcel({});
}

onMounted(() => {
  console.log(imexportTableRef.value);
});
</script>