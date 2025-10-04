<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useFetchTodolist } from "@/modules/Todolist/hooks/useFetchTodolist"
import toast from "@/services/toast"
import { useCreateTodolist, useDeleteTodolist, useUpdateTodolist } from "./hooks/useMutationTodolist"
import { isDark, isGoldConflict } from "@/utils/css"
import { useSwipe } from "@/composables/useSwipe"

const route = useRoute()
const router = useRouter()

const swipe = useSwipe(
  (id) => openActions(id),
  () => closePanel()
)

const editInputRef = ref<HTMLInputElement | null>(null)

// Liste réactive depuis l’API
const lists = ref<any[]>([])

// --- Fetch data ---
async function loadLists() {
  try {
    const { data } = await useFetchTodolist()
    if (data?.data) {
      // ajoute la clé isDark calculée
      lists.value = data.data.map((l: any) => ({
        ...l,
        isDark: isDark(l.color || "#ffffff")
      }))
    }
  } catch (err) {
    console.error("Erreur fetch todolist", err)
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick)
  loadLists()
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick)
})

// --- États ---
const openedListId = ref<number | null>(null)
const isEditing = ref(false)
const editDraft = ref<any | null>(null)
const listRefs = new Map<number, HTMLElement>()

// --- Filters & Sort ---
const filteredLists = computed(() => {
  const isArchivedView = route.name === "todolist-archived"
  const base = lists.value.filter(l =>
    isArchivedView ? !l.is_active : l.is_active
  )

  return [...base].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1
    }
    const ao = a.display_order || 0
    const bo = b.display_order || 0
    if (ao > 0 || bo > 0) {
      return ao - bo
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

// --- UI logic ---
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest(".todolist-item")) {
    if (isEditing.value && editDraft.value) {
      const list = lists.value.find(l => l.idtodolist === editDraft.value.idtodolist)
      if (list) {
        saveEdit(list)
      } else {
        closePanel()
      }
    } else {
      closePanel()
    }
  }
}
function openActions(listId: number) {
  openedListId.value = listId
  isEditing.value = false
  editDraft.value = null
}
function closePanel() {
  openedListId.value = null
  isEditing.value = false
  editDraft.value = null
}
const handleAddTodolist = async() => {
  try {
    const { data } = await useCreateTodolist()

    if (data?.idtodolist) {
      await loadLists()

      const created = lists.value.find(l => l.idtodolist === data.idtodolist)
      if (created) {
        // Ouvre direct le panneau en mode édition
        openActions(created.idtodolist)
        startEdit(created)
      }
    }
  } catch (err) {
    console.error("Erreur navigation add todolist", err)
    toast.error("Impossible d'ajouter une liste")
  }
}
async function handleToggleFavorite(list: any) {
  try {
    const newFavorite = !list.is_favorite
    await useUpdateTodolist(list.idtodolist, { is_favorite: newFavorite })
    list.is_favorite = newFavorite
  } catch (err) {
    console.error("Erreur update favorite", err)
    toast.error("Impossible de mettre à jour le favori")
  }
}
function startEdit(list: any) {
  editDraft.value = { ...list }
  openedListId.value = list.idtodolist
  isEditing.value = true
  nextTick(() => {
    const el = editInputRef.value
    if (el instanceof HTMLInputElement) {
      el.focus()
      el.select()
    }

    const domEl = listRefs.get(list.idtodolist)
    if (domEl) {
      domEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
    }
  })
}
const handleArchivedList = async (list: any) => {
  try {
    const newActive = !list.is_active

    const updates = newActive
      ? [{ is_active: true }]
      : [
          { is_active: false },
          { is_favorite: false }
        ]
    ;

    await useUpdateTodolist(list.idtodolist, updates)

    list.is_active = newActive
    closePanel()
    if (!newActive)
      list.is_favorite = false
    else
      router.push({ name: "todolist-active" })
  } catch (err) {
    console.error("Erreur archive list", err)
    toast.error("Impossible de modifier l'état archivé")
  }
}
const handleDeleteTodolist = async (list: any) => {
  try {
    await useDeleteTodolist(list.idtodolist)
    closePanel()
    await loadLists() // recharge les listes après suppression
  } catch (err) {
    console.error("Erreur suppression todolist", err)
    toast.error("Impossible de supprimer la liste")
  }
}
async function saveEdit(list: any) {
  if (!editDraft.value) return
  const trimmed = editDraft.value.name.trim()

  if (trimmed.length >= 3 && trimmed.length <= 50) {
    try {
      const updates = [
        { name: trimmed },
        { color: editDraft.value.color }
      ]

      await useUpdateTodolist(list.idtodolist, updates)

      list.name = trimmed
      list.color = editDraft.value.color
      list.isDark = isDark(editDraft.value.color)
    } catch (err) {
      console.error("Erreur update todolist", err)
      toast.error("Impossible de sauvegarder les modifications")
    }
  }
  closePanel()
}
function goToListDetail(list: any) {
  if (isEditing.value && editDraft.value && openedListId.value !== list.idtodolist) {
    const current = lists.value.find(l => l.idtodolist === editDraft.value.idtodolist)
    if (current) {
      saveEdit(current)
    }
    return
  }

  // Si un panneau est ouvert mais pas en édition → ferme simplement
  if (openedListId.value !== null && openedListId.value !== list.idtodolist) {
    closePanel()
    return
  }

  if (openedListId.value === list.idtodolist) return

  // Navigation classique
  router.push({
    name: "todolist-element",
    params: { idtodolist: list.idtodolist },
    query: { label: list.name }
  })
}

// --- Bouton ajouter ---
const showAddButton = computed(() => route.name === "todolist-active")
</script>
 
<template>
  <div class="todolist-list">
    <!-- Ajouter une liste -->
    <div v-if="showAddButton" class="todolist-item add-item" v-on:click="handleAddTodolist">
      <div class="todolist-header">
        <span class="todolist-fav"><i class="fa fa-plus"></i></span>
        <span class="todolist-name">Ajouter une liste</span>
      </div>
    </div>

    <!-- Listes -->
    <div
      v-for="list in filteredLists"
      :key="list.idtodolist"
      class="todolist-item"
      :style="{
        backgroundColor: (openedListId === list.idtodolist && isEditing && editDraft) 
          ? editDraft.color 
          : list.color,
        color: list.isDark ? '#fff' : '#000'
      }"
      @touchstart="swipe.onTouchStart"
      @touchend="swipe.onTouchEnd($event, list.idtodolist)"
      @click="goToListDetail(list)"
      :ref="(el: any) => { if (el) listRefs.set(list.idtodolist, el) }"
    >
      <!-- état normal -->
      <div v-if="openedListId !== list.idtodolist" class="todolist-header">
        <span 
          v-if="route.name !== 'todolist-archived'" 
          class="todolist-fav" 
          @click.stop="handleToggleFavorite(list)"
        >
          <i 
            class="fa fa-star"
            :style="{
              color: list.is_favorite 
                ? (isGoldConflict(list.color) ? '#fff' : 'gold')
                : (list.isDark ? 'rgba(255,255,255,0.5)' : '#ccc')
            }"
          ></i>
        </span>
        <span class="todolist-name">{{ list.name }}</span>
        <span class="todolist-actions" @click.stop="openActions(list.idtodolist)">
          <i class="fa fa-ellipsis-h"></i>
        </span>
      </div>

      <!-- état actions -->
      <div v-else-if="!isEditing" class="todolist-actions-panel">
        <i
          class="fa fa-edit action-icon edit"
          @click.stop="startEdit(list)"
          :style="{ color: list.isDark ? '#fff' : '#ffa000' }"
        ></i>
        <i
          class="fa fa-archive action-icon archive"
          @click.stop="handleArchivedList(list)"
          :style="{ color: list.isDark ? '#fff' : '#1976d2' }"
        ></i>
        <i
          class="fa fa-trash action-icon delete"
          @click.stop="handleDeleteTodolist(list)"
          :style="{ color: list.isDark ? '#fff' : '#e53935' }"
        ></i>
      </div>

      <!-- état édition -->
      <div v-else class="todolist-edit-panel">
        <div class="edit-input-wrapper">
          <input
            :ref="(el: any) => { if (el) editInputRef = el as HTMLInputElement }"
            v-model="editDraft.name"
            class="edit-input"
            type="text"
            maxlength="50"
            :style="{ color: editDraft.isDark ? '#fff' : '#000' }"
          />
          <span
            class="char-counter"
            :class="{
              error:
                editDraft.name.trim().length < 3 ||
                editDraft.name.trim().length > 50,
            }"
            :style="{ color: editDraft.isDark ? '#fff' : '#000' }"
          >
            {{ editDraft.name.trim().length }}/50
          </span>
        </div>
        <input
          v-model="editDraft.color"
          class="color-input"
          type="color"
          @input="editDraft.isDark = isDark(editDraft.color)"
        />
        <i
          class="fa fa-check action-icon validate"
          @click.stop="saveEdit(list)"
          :style="{ color: editDraft.isDark ? '#fff' : '#008000' }"
        ></i>
        <i
          class="fa fa-times action-icon cancel"
          @click.stop="closePanel()"
          :style="{ color: editDraft.isDark ? '#fff' : '#e53935' }"
        ></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todolist-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  min-height: 100vh;
  background: #f9f9f9;

  i.fa-star {
    font-size: 30px;
    cursor: pointer;
  }

  .todolist-item {
    width: 100%;
    min-height: 4rem;
    max-width: 400px;
    border-radius: 12px;
    padding: 0 1rem;
    font-size: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;

    display: flex;
    align-items: stretch;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }

    .todolist-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      span:not(:last-child) {
        margin-right: 1rem;
        cursor: pointer;
      }
    }

    .todolist-name {
      font-weight: bold;
      flex: 1;
      min-width: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .todolist-actions {
      margin-left: auto;
      cursor: pointer;
      font-size: 22px;
      flex-shrink: 0;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .todolist-actions-panel {
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: rgba(0, 0, 0, 0.05);
      animation: slideIn 0.3s forwards;

      .action-icon {
        font-size: 2rem;
        cursor: pointer;
        transition: transform 0.2s;
        &:hover { transform: scale(1.2); }
        &.edit { color: #ffa000; text-shadow: 0 0 3px #000; }
        &.archive { color: #1976d2; text-shadow: 0 0 3px #000; }
        &.delete { color: #e53935; text-shadow: 0 0 3px #000; }
      }
    }

    .todolist-edit-panel {
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.05);
      gap: 0.5rem;

      .action-icon {
        font-size: 2rem;
        cursor: pointer;
        text-shadow: 0 0 2px #000;
        flex: 0 0 auto;

        &.validate {
          margin-right: 0.5rem;
        }
      }
    }

    .edit-input-wrapper {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      position: relative;
      min-width: 0;
    }

    .edit-input {
      flex: 1 1 auto;
      padding: 0.4rem;
      border: 2px solid #ccc;
      border-radius: 6px;
      background-color: #0000001a;
      min-width: 0;
    }

    .char-counter {
      margin-left: 0.5rem;
      font-size: 0.8rem;
      opacity: 0.8;
      white-space: nowrap;
    }

    .char-counter.error { color: red; font-weight: bold; }

    .color-input {
      width: 40px;
      height: 40px;
      border: none;
      padding: 0;
      background: none;
      cursor: pointer;
      flex: 0 0 auto;
    }
  }

  .add-item {
    background: #a5d6a7;
    color: #1b5e20;
    cursor: pointer;
    border: 3px solid #81c784;
    font-size: 1.2rem;
    transition: all 0.2s ease;
    & .todolist-header { justify-content: center; }
    .fa-plus { color: #1b5e20; }
  }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
