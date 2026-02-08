<script setup lang="ts">
import { useWorkshopDetailStore } from '@/modules/Dofus/workshop/store/workshopDetail.store';
import { storeToRefs } from 'pinia';


const store = useWorkshopDetailStore()
const { isOwner } = storeToRefs(store)

</script>

<template>
  <footer class="item-footer" v-if="isOwner">
    <button class="footer-btn">↓ 0</button>
    <button class="footer-btn">↑ max</button>
    <button class="footer-btn danger">
      <i class="mdi mdi-delete"></i>
    </button>
  </footer>
</template>

<style scoped>
.item-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--pico-muted-border-color);
  margin-top: auto;
}

.footer-btn {
  padding: 0.15rem 0.35rem;
  font-size: 0.65rem;
  line-height: 1;
  background: var(--pico-form-element-background-color);
  border: 1px solid var(--pico-form-element-border-color);
  color: var(--pico-form-element-color);
  border-radius: var(--pico-border-radius);
  cursor: pointer;
  margin: 0 !important;
  transition: all 0.15s;
}

.footer-btn:hover {
  background: var(--pico-primary-background);
  border-color: var(--pico-primary-border);
  color: var(--pico-primary-inverse);
}

.footer-btn.danger {
  background: transparent;
  color: var(--pico-del-color);
  border-color: var(--pico-muted-border-color);
}

.footer-btn.danger:hover {
  background: var(--pico-del-color);
  border-color: var(--pico-del-color);
  color: white;
}
</style>
