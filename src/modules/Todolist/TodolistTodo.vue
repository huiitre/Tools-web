<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from "vue"
import { useRoute } from "vue-router"
import toast from "@/services/toast"

// Hooks API
import { useFetchTodosByList } from "@/modules/Todolist/hooks/useFetchTodo"
import { useUpdateTodo, useDeleteTodo, useCreateTodo } from "@/modules/Todolist/hooks/useMutationTodo"
import { useFetchTodolistById } from "./hooks/useFetchTodolist"
import { hexToRgba } from "@/utils/css"
import { useSwipe } from "@/composables/useSwipe"

const route = useRoute()

watch(
  () => route.params.idtodolist,
  (newId) => {
    if (newId) {
      loadTodos()
      loadTodolist()
    }
  }
)

const swipe = useSwipe(
  (id: number) => openActions(id),
  () => closePanel()
)

// --- Données ---
const todos = ref<any[]>([])
const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1
    }

    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})
const openedTodoId = ref<number | null>(null)
const isEditing = ref(false)
const editDraft = ref<any | null>(null)
const editInputRef = ref<HTMLInputElement | null>(null)
const todolist = ref<any | null>(null)

// --- Chargement ---
async function loadTodos() {
  try {
    const { data } = await useFetchTodosByList(Number(route.params.idtodolist))
    todos.value = data?.data || []
  } catch (err) {
    console.error("Erreur fetch todos", err)
    toast.error("Impossible de charger les tâches")
  }
}
async function loadTodolist() {
  try {
    const { data } = await useFetchTodolistById(Number(route.params.idtodolist))
    todolist.value = data?.data || null
  } catch (err) {
    console.error("Erreur fetch todolist", err)
    toast.error("Impossible de charger la liste")
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick)
  loadTodolist()
  loadTodos()
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick)
})

// --- UI LOGIC ---
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest(".todo-item")) {
    if (isEditing.value && editDraft.value) {
      const todo = todos.value.find(t => t.idtodo === editDraft.value.idtodo)
      if (todo) {
        saveEdit(todo)
      } else {
        closePanel()
      }
    } else {
      closePanel()
    }
  }
}
function openActions(todoId: number) {
  openedTodoId.value = todoId
  isEditing.value = false
  editDraft.value = null
}
function closePanel() {
  openedTodoId.value = null
  isEditing.value = false
  editDraft.value = null
}
function startEdit(todo: any) {
  editDraft.value = { ...todo }
  openedTodoId.value = todo.idtodo
  isEditing.value = true
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

// --- Actions ---
async function handleComplete(todo: any) {
  try {
    const newState = !todo.is_completed
    await useUpdateTodo(todo.idtodo, { is_completed: newState })
    todo.is_completed = newState
    closePanel()
  } catch {
    toast.error("Impossible de changer l'état de la tâche")
  }
}
const handleAddTodo = async () => {
  try {
    const idtodolist = Number(route.params.idtodolist)

    // On crée le todo → l'API renvoie { idtodo, msg, status }
    const { data } = await useCreateTodo(idtodolist)

    if (data?.idtodo) {
      // Recharge les todos
      await loadTodos()

      // Trouve le nouveau todo et ouvre son panel
      const created = todos.value.find(t => t.idtodo === data.idtodo)
      if (created) {
        openActions(created.idtodo)
        startEdit(created)
      }
    }
  } catch (err) {
    console.error("Erreur création todo", err)
    toast.error("Impossible de créer la tâche")
  }
}
const handleItemClick = (todoId: number) => {
  // Si on est en édition sur un autre todo
  if (isEditing.value && editDraft.value && openedTodoId.value !== todoId) {
    const current = todos.value.find(t => t.idtodo === editDraft.value.idtodo)
    if (current) {
      saveEdit(current) // ⚡ sauvegarde avant de changer
    } else {
      closePanel()
    }
    return
  }

  // Si un panneau est juste ouvert (non édition) → ferme
  if (openedTodoId.value && openedTodoId.value !== todoId) {
    closePanel()
    return
  }
}
async function handleDelete(todo: any) {
  try {
    await useDeleteTodo(todo.idtodo)
    todos.value = todos.value.filter(t => t.idtodo !== todo.idtodo)
    closePanel()
  } catch {
    toast.error("Impossible de supprimer la tâche")
  }
}
async function saveEdit(todo: any) {
  if (!editDraft.value) return
  const trimmed = editDraft.value.name.trim()
  if (trimmed.length >= 3 && trimmed.length <= 100) {
    try {
      await useUpdateTodo(todo.idtodo, {
        name: trimmed,
        description: editDraft.value.description,
        priority: editDraft.value.priority
      })
      todo.name = trimmed
      todo.description = editDraft.value.description
      todo.priority = editDraft.value.priority
    } catch {
      toast.error("Impossible de sauvegarder la tâche")
    }
  }
  closePanel()
}

// --- Priorités ---
const priorities = [
  { value: 0, label: "Normal", color: "#2196F3" }, // Bleu
  { value: 1, label: "Haut", color: "#FF9800" },  // Orange
  { value: 2, label: "Urgent", color: "#E53935" } // Rouge
]

function getTodoStyles(todo: any) {
  // Si édition sur cet élément → on prend editDraft.priority (temporaire)
  if (isEditing.value && editDraft.value?.idtodo === todo.idtodo) {
    const prioColor = priorities.find(p => p.value === editDraft.value.priority)?.color || "#ccc"
    return {
      border: `2px solid ${prioColor}`,
      backgroundColor: hexToRgba(prioColor, 0.15),
      opacity: 1
    }
  }

  if (todo.is_completed) {
    return {
      border: "2px solid #BDBDBD",
      backgroundColor: hexToRgba("#BDBDBD", 0.3),
      opacity: 0.6
    }
  }

  const prioColor = priorities.find(p => p.value === todo.priority)?.color || "#ccc"
  return {
    border: `2px solid ${prioColor}`,
    backgroundColor: hexToRgba(prioColor, 0.15),
    opacity: 1
  }
}
</script>

<template>
  <div class="todo-list">

    <!-- Titre de la liste -->
    <h2 v-if="todolist" class="todolist-title">
      {{ todolist.name }}
    </h2>

    <div v-if="todolist" class="todolist-separator"></div>

    <div v-if="todolist && todolist.is_active" class="todo-item add-item" v-on:click="handleAddTodo">
      <div class="todolist-header">
        <span class="todolist-fav"><i class="fa fa-plus"></i></span>
        <span class="todolist-name">Ajouter une tâche</span>
      </div>
    </div>

    <div
      v-for="todo in sortedTodos"
      :key="todo.idtodo"
      class="todo-item"
      :style="getTodoStyles(todo)"
      @touchstart="swipe.onTouchStart"
      @touchend="swipe.onTouchEnd($event, todo.idtodo)"
      @click="handleItemClick(todo.idtodo)"
    >
      <!-- Affichage normal -->
      <div v-if="openedTodoId !== todo.idtodo" class="todo-header">
        <div class="todo-text">
          <span class="todo-name">{{ todo.name }}</span>
          <small v-if="todo.description" class="todo-desc">{{ todo.description }}</small>
        </div>
        <span class="todo-actions" @click.stop="openActions(todo.idtodo)">
          <i class="fa fa-ellipsis-h"></i>
        </span>
      </div>

      <!-- Panel actions -->
      <div v-else-if="!isEditing" class="todo-actions-panel">
        <i class="fa fa-edit action-icon edit"
           @click.stop="startEdit(todo)"></i>
        <i class="fa fa-check-circle action-icon complete"
           @click.stop="handleComplete(todo)"></i>
        <i class="fa fa-trash action-icon delete"
           @click.stop="handleDelete(todo)"></i>
      </div>

      <!-- Édition -->
      <div v-else class="todo-edit-panel">
        <div class="edit-inputs">
          <input
            :ref="(el: any) => { if (el) editInputRef = el as HTMLInputElement }"
            v-model="editDraft.name"
            class="edit-input"
            type="text"
            maxlength="100"
          />
          <textarea
            v-model="editDraft.description"
            class="edit-textarea"
            placeholder="Description (optionnel)"
          ></textarea>
          <select v-model="editDraft.priority" class="priority-select">
            <option v-for="p in priorities" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>
        <div class="edit-actions">
          <i class="fa fa-times action-icon cancel" @click.stop="closePanel()"></i>
          <i class="fa fa-check action-icon validate" @click.stop="saveEdit(todo)"></i>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;

  & .todolist-title {
    font-size: 1.6rem;
    font-weight: bold;
    margin: 0;
    padding-left: 4px;
    color: #333;
  }

  & .todolist-separator {
    height: 3px;
    background: linear-gradient(90deg, #000000, #000000);
    border-radius: 2px;
    margin: 0.5rem 0 1.2rem 4px;
  }

  .todo-item {
    width: 100%;
    min-height: 4rem;
    max-width: 400px;
    border-radius: 12px;
    padding: 1rem;
    font-size: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;

    &.add-item {
      background: #a5d6a7;
      color: #1b5e20;
      cursor: pointer;
      border: 3px solid #81c784;
      font-size: 1.2rem;
      transition: all 0.2s ease;
      & .todolist-header { justify-content: center; }
      .fa-plus { color: #1b5e20; }
    }

    .todo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .todo-text {
      display: flex;
      flex-direction: column;

      .todo-name {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .todo-desc {
        font-size: 0.9rem;
        opacity: 0.7;
      }
    }

    .todo-actions {
      font-size: 20px;
      cursor: pointer;
    }

    .todo-actions-panel {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 1rem;
    }

    .todo-edit-panel {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .edit-input,
      .edit-textarea,
      .priority-select {
        width: 100%;
        padding: 0.5rem;
        border: 2px solid #ccc;
        border-radius: 6px;
        background: none; /* 🔥 supprime le fond gris */
        outline: none;
        font-size: 15px;
      }

      .edit-input {
        margin-bottom: 0.5rem; /* 🔥 espace sous le champ nom */
      }

      .edit-textarea {
        margin-bottom: 0.5rem; /* 🔥 espace sous le champ description */
        min-height: 70px;
        resize: vertical;
      }

      .priority-select {
        cursor: pointer;
      }
    }

    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 2rem;
    }
    .action-icon {
      font-size: 2rem;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.2);
      }

      &.edit {
        color: #ffa000;
      }

      &.complete {
        color: #4caf50;
      }

      &.delete {
        color: #e53935;
      }

      &.validate {
        color: #008000;
        /* align-self: flex-end; */
      }
      &.cancel {
        color: #731818;
        /* align-self: flex-end; */
      }
    }
  }
}
</style>
