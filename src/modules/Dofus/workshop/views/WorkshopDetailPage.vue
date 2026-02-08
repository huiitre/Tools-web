<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store'
import WorkshopSummary from '@/modules/Dofus/workshop/components/workshopdetail/workshopsummary/WorkshopSummary.vue';
import WorkshopItemsList from '@/modules/Dofus/workshop/components/workshopdetail/workshopitem/WorkshopItemsList.vue';
import WorkshopReadonlyBanner from '@/modules/Dofus/workshop/components/workshopdetail/WorkshopReadonlyBanner.vue';
import { storeToRefs } from 'pinia';

const router = useRouter()
const store = useWorkshopDetailStore()
const { isOwner } = storeToRefs(store)
const route = useRoute()
const workshopId = Number(route.params.workshopId)

onMounted(async() => {
  try {
    await store.open(workshopId)
  } catch (error) {
    router.replace({ name: 'dofus-workshop-list' })
  }
})

onUnmounted(() => {
  store.close()
})

</script>

<template>
  <div class="workshop-detail">

    <WorkshopReadonlyBanner :show="!isOwner" />

    <!-- ===== SUMMARY ===== -->
    <WorkshopSummary />

    <!-- ===== ITEMS ===== -->
    <WorkshopItemsList />

  </div>
</template>

<style scoped>
.workshop-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
