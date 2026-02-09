<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useWorkshopStore } from '@/modules/Dofus/workshop/store/workshop.store'
import toast from '@/services/toast'
import { Workshop } from '@/modules/Dofus/workshop/types/workshop.types'

const props = defineProps<{
  workshop: Workshop
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const store = useWorkshopStore()

/* =========================
   EDIT
========================= */
const name = ref(props.workshop.name)

const startEdit = async () => {
  await nextTick()
  const el = document.getElementById('edit-workshop-name') as HTMLInputElement
  el?.focus()
  el?.select()
}

startEdit()

const save = async () => {
  if (!name.value.trim()) return

  try {
    await store.updateWorkshop(props.workshop.id, {
      name: name.value.trim(),
      active: props.workshop.active
    })
    emit('close')
  } catch (e: any) {
    toast.error(e instanceof Error ? e.message : 'Erreur lors de la modification')
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="popup">
      <div class="row">
        <input
          id="edit-workshop-name"
          v-model="name"
          placeholder="Nom de l’atelier"
          @keyup.enter="save"
        />

        <span
          class="mdi mdi-check action"
          @click="save"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background: var(--pico-card-background-color);
  border-radius: var(--pico-border-radius);
  width: 320px;
  padding: 0.5rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem;

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--pico-color);
    font-size: 0.9rem;
    margin: 0;
  }
}

.action {
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
}
</style>
