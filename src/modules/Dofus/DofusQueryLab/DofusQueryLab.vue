<template>
  <div class="dql-container">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <!-- PUBLIC QUERUES -->
      <h3>Requêtes publiques</h3>
      <ul>
        <li
          v-for="q in publicQueries"
          :key="q.id"
          :class="['query-item', selectedQuery?.id === q.id ? 'selected' : '']"
          @click="selectQuery(q, false)"
        >
          {{ q.title }}
        </li>
      </ul>

      <!-- MY QUERUES -->
      <h3>Mes requêtes</h3>
      <ul>

        <li class="query-item add" @click="createNewQuery">
          ➕ Ajouter une requête
        </li>

        <li
          v-for="q in mineQueries"
          :key="q.id"
          :class="['query-item', selectedQuery?.id === q.id ? 'selected' : '']"
        >
          <div @click="selectQuery(q, true)" class="query-name">
            {{ q.title }}
          </div>

          <span class="delete-btn" @click.stop="deleteQuery(q)">
            🗑️
          </span>
        </li>
      </ul>
    </aside>

    <!-- MAIN PANEL -->
    <main class="editor-panel">

      <!-- DOC ACCORDION -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleDoc">
          <span>📘 Documentation</span>
          <span>{{ docOpen ? "▼" : "▲" }}</span>
        </div>

        <div v-show="docOpen" class="doc-content">

          <h4>✔ Règles générales</h4>
          <ul>
            <li>Seulement des requêtes <b>SELECT</b> sont autorisées.</li>
            <li>Les requêtes ne doivent pas modifier la base.</li>
            <li>Les alias doivent être utilisés uniquement dans <b>SELECT / ORDER BY</b>.</li>
            <li>L'utilisation du schéma est automatique : vous pouvez écrire <code>item</code> au lieu de <code>tools_dofus_unity.item</code>.</li>
          </ul>

          <h4>❌ Interdit</h4>
          <ul>
            <li>Mots-clés : <code>UPDATE</code>, <code>DELETE</code>, <code>INSERT</code>, <code>DROP</code>, <code>ALTER</code>, <code>TRUNCATE</code>…</li>
            <li>Fonctions système : <code>pg_*</code>, <code>set_config</code>, <code>current_setting</code>, etc.</li>
            <li>Commentaires SQL <code>--</code> ou point-virgule <code>;</code>.</li>
            <li>Sous-selects dangereux type <code>WITH RECURSIVE</code>.</li>
            <li>Tables non autorisées.</li>
          </ul>

          <h4>📂 Tables autorisées</h4>
          <ul>
            <li><b>item</b> — Items, ressources, équipements…</li>
            <li><b>item_type</b> — Type associé à l’item</li>
            <li><b>category</b> — Catégorie du type de l'item</li>
            <li><b>recipe</b> — Recettes de craft</li>
          </ul>

          <h4>🧩 Modèle des données (simplifié)</h4>
          <pre>
category (
  idcategory        int4          PK - Identifiant de la catégorie
  name              varchar       Nom affiché de la catégorie (ex : Ressource, Équipement)
  code              varchar       Code interne de la catégorie
)

item_type (
  iditem_type       int4          PK - Identifiant du type d'item
  name              varchar       Nom du type (ex : Viande, Potion, Pierre d'âme)
  code              varchar       Code interne du type
  idcategory        int4          FK -> category.idcategory (catégorie associée)
)

item (
  iditem            int4          PK - Identifiant de l'item
  name              varchar       Nom de l'objet
  code              varchar       Code interne (souvent utilisé dans DofusDB)
  img               varchar       URL de l'image de l'item
  level             int4          Niveau de l'objet
  iditem_type       int4          FK -> item_type.iditem_type (détermine le type)
  average_price     float8        Prix unitaire moyen en HDV (source DofusLab)
  created_at        timestamp     Date d'insertion dans la base
  updated_at        timestamp     Dernière date de mise à jour
  price_updated_at  timestamp    Dernière mise à jour du prix (si disponible)
  url_doflex        varchar       URL public vers la fiche Doflex
  idpanoply         int4          (non utilisé pour l’instant)
  hasrecipe         bool          True si l’item est craftable
  description       text          Description de l’objet
)

recipe (
  idrecipe          int4          PK - Identifiant de la ligne recette
  idparent          int4          FK -> item.iditem (item crafté)
  idenfant          int4          FK -> item.iditem (ingrédient)
  quantity          int4          Quantité de l’ingrédient
)
          </pre>

        </div>
      </div>

      <!-- NOTHING SELECTED -->
      <div v-if="!selectedQuery" class="empty">
        Sélectionne une requête à gauche.
      </div>

      <!-- EDITOR MAIN ACCORDION -->
      <div v-else class="accordion">

        <div class="accordion-header" @click="toggleAccordion">
          <span>Requête SQL</span>
          <span>{{ accordionOpen ? "▼" : "▲" }}</span>
        </div>

        <!-- CONTENU DU FORMULAIRE -->
        <div v-show="accordionOpen" class="editor-wrapper">

          <!-- 🔥 BLOC RÉSULTAT D'EXÉCUTION -->
          <div
            v-if="showExecResult"
            :class="['exec-result-box', execResult?.success ? 'ok' : 'error']"
          >
            <div class="exec-result-text">
              <template v-if="execResult.success">
                ⏱ Exécution : {{ execResult.execution_time_ms }} ms
              </template>
              <template v-else>
                ❌ Erreur : {{ execResult.error }}
              </template>
            </div>

            <div class="exec-result-close" @click="showExecResult = false">
              ✖
            </div>
          </div>
          <!-- FIN DU BLOC -->

          <input
            type="text"
            class="title-input"
            v-model="tempTitle"
            :readonly="!isEditing"
            placeholder="Titre de la requête"
          />

          <!-- Monaco Editor -->
          <div
            class="editor-resizable"
            :style="{ height: editorHeight + 'px' }"
            @mousedown="startResizing"
          >
            <div v-if="!isEditing" class="readonly-overlay">Lecture seule</div>
            <div ref="editorRef" class="editor"></div>
            <div class="resize-handle"></div>
          </div>

          <!-- DESCRIPTION -->
          <textarea
            class="description-input"
            v-model="tempDescription"
            :readonly="!isEditing"
            placeholder="Description"
          ></textarea>

          <!-- BUTTONS -->
          <div class="buttons">

            <div class="left">
              <template v-if="selectedIsMine">
                <template v-if="!isEditing">
                  <button class="btn orange" @click="enterEditMode">
                    Modifier
                  </button>
                </template>

                <template v-else>
                  <button class="btn green" @click="saveChanges">Enregistrer</button>
                  <button class="btn red" @click="cancelEdit">Annuler</button>
                </template>
              </template>
            </div>

            <div class="center" v-if="selectedIsMine && !isEditing">
              <button class="btn blue" @click="togglePublicState">
                {{ selectedQuery.isPublic ? "Rendre privée" : "Rendre publique" }}
              </button>
            </div>

            <div class="right">
              <button v-if="!isEditing" class="btn green" @click="executeQuery">Exécuter</button>
            </div>

          </div>
        </div>
      </div>

      <!-- RIGHT PANEL (résultats) -->
      <div
        class="right-panel"
        :class="{ open: rightPanelOpen }"
        ref="rightPanelRef"
      >
        <div class="right-panel-header" @click="toggleRightPanel">
          <span>{{ rightPanelOpen ? "▶" : "◀" }}</span>
        </div>

        <div v-if="rightPanelOpen" class="right-panel-content">
          <div v-if="queryResult && queryResult.length">
            <table>
              <thead>
                <tr>
                  <th v-for="col in Object.keys(queryResult[0])" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in queryResult" :key="idx">
                  <td v-for="(col, ci) in row" :key="ci">{{ col }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-result">
            Aucun résultat à afficher
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import * as monaco from "monaco-editor"
import { useFetchGetQueriesList } from "../hooks/useFetchQueryLab"
import { useMutationCreateQuery, useMutationDeleteQuery, useMutationRunQuery, useMutationRunRawQuery, useMutationUpdateQuery } from "../hooks/useMutationQueryLab"
import toast from "@/services/toast"

// -------------------------------------------
// STATE
// -------------------------------------------
const publicQueries = ref<any[]>([])
const mineQueries = ref<any[]>([])
const selectedQuery = ref<any | null>(null)
const selectedIsMine = ref(false)

const isEditing = ref(false)
const originalSql = ref("")
const tempTitle = ref("")
const tempDescription = ref("")

const execResult = ref<any | null>(null)
const showExecResult = ref(false)

// ACCORDION
const accordionOpen = ref(true)
function toggleAccordion() {
  accordionOpen.value = !accordionOpen.value
}

// DOC
const docOpen = ref(false);
function toggleDoc() {
  docOpen.value = !docOpen.value;
}

// RIGHT RESULT PANEL
const rightPanelRef = ref<HTMLElement | null>(null)
const rightPanelOpen = ref(false)
const queryResult = ref<any[]>([])

function toggleRightPanel() {
  rightPanelOpen.value = !rightPanelOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (!rightPanelOpen.value) return

  const panel = rightPanelRef.value
  if (!panel) return

  // Si on clique DANS le panel → ne rien faire
  if (panel.contains(e.target as Node)) return

  // Sinon → fermer le panel
  rightPanelOpen.value = false
}

// Monaco
const editorRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// -------------------------------------------
// INITIAL LOAD
// -------------------------------------------
const fetchQueries = async () => {
  const { data } = await useFetchGetQueriesList()

  publicQueries.value = data.data.public
  mineQueries.value = data.data.mine
}

onMounted(async () => {
  await fetchQueries()
  document.addEventListener("mousedown", handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside)
})

// -------------------------------------------
// RESIZE EDITOR
// -------------------------------------------
const minHeight = 100
const maxHeight = 600
const editorHeight = ref(minHeight)  // hauteur par défaut
let isResizing = false

function startResizing(e: MouseEvent) {
  if (!(e.target as HTMLElement).classList.contains('resize-handle')) return
  isResizing = true

  const startY = e.clientY
  const startHeight = editorHeight.value

  function onMouseMove(ev: MouseEvent) {
    if (!isResizing) return
    const delta = ev.clientY - startY
    let newHeight = startHeight + delta

    // appliquer min/max
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    editorHeight.value = newHeight

    // met à jour le layout monaco
    editor?.layout()
  }

  function onMouseUp() {
    isResizing = false
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", onMouseUp)
  }

  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
}

// -------------------------------------------
// SELECT A QUERY
// -------------------------------------------
function selectQuery(q: any, mine: boolean) {
  selectedQuery.value = q
  selectedIsMine.value = mine
  isEditing.value = false

  tempTitle.value = q.title
  tempDescription.value = q.description

  nextTickSetupEditor(q.sqlRaw)
}

function nextTickSetupEditor(sql: string) {
  setTimeout(() => {
    if (editor) editor.dispose()

    editor = monaco.editor.create(editorRef.value!, {
      value: sql,
      language: "sql",
      readOnly: !isEditing.value,
      theme: "vs-dark",
      minimap: { enabled: false },
      automaticLayout: true
    })

    originalSql.value = sql
  }, 30)
}

// -------------------------------------------
// EDIT MODE
// -------------------------------------------
function enterEditMode() {
  isEditing.value = true
  nextTickSetupEditor(selectedQuery.value.sqlRaw)
}

function cancelEdit() {
  isEditing.value = false
  tempTitle.value = selectedQuery.value.title
  tempDescription.value = selectedQuery.value.description
  nextTickSetupEditor(originalSql.value)
}

// -------------------------------------------
// SAVE CHANGES
// -------------------------------------------
async function saveChanges() {
  if (!selectedQuery.value) return

  const newSql = editor?.getValue() || ""

  if (tempTitle.value.trim() === "") {
    toast.error("Le titre ne peut pas être vide")
    return
  }

  try {
    toast.loading("Enregistrement...")

    await useMutationUpdateQuery(selectedQuery.value.id, {
      title: tempTitle.value,
      description: tempDescription.value,
      sqlRaw: newSql,
      isPublic: selectedQuery.value.isPublic
    })

    // Mise à jour locale
    selectedQuery.value.title = tempTitle.value
    selectedQuery.value.description = tempDescription.value
    selectedQuery.value.sqlRaw = newSql

    isEditing.value = false

    // Réactualise l'affichage + readonly
    nextTickSetupEditor(newSql)

    // Force vue à réafficher la liste
    mineQueries.value = [...mineQueries.value]

    toast.success("Requête mise à jour")

  } catch (error) {
    console.error(error)
    toast.error("Erreur lors de l’enregistrement")
  } finally {
    toast.clearAll()
  }
}

// -------------------------------------------
// OTHER ACTIONS
// -------------------------------------------
async function clearResults() {
  execResult.value = null
  showExecResult.value = false
  queryResult.value = []
  rightPanelOpen.value = false
}
async function executeQuery() {
  if (!selectedQuery.value) return;

  try {
    clearResults()
    toast.loading("Exécution en cours...");

    const sqlToRun = editor?.getValue() || selectedQuery.value.sqlRaw;

    let data;

    //? La route runrawquery ne fonctionne pas bien, on bypass pour l'instant
    /* if (isEditing.value) {
      const res = await useMutationRunRawQuery(sqlToRun);
      data = res.data;
    } else { */
      const res = await useMutationRunQuery(selectedQuery.value.id);
      data = res.data;/* 
    } */

    console.log("Résultat SQL :", data);

    // Stockage complet du résultat
    execResult.value = data;
    showExecResult.value = true;

    // Stockage des rows pour le panneau latéral
    queryResult.value = data.rows || [];

    // Ouvre le panel si présence de données
    if (queryResult.value.length > 0) {
      rightPanelOpen.value = true;
    }

    toast.success("Requête exécutée");

  } catch (err: any) {
    console.error("Erreur exécution SQL :", err);

    execResult.value = {
      success: false,
      error: err?.response?.data?.error || "Erreur inconnue"
    };
    showExecResult.value = true;

    toast.error("Erreur lors de l'exécution");
  } finally {
    toast.clearAll();
  }
}

async function deleteQuery(q: any) {
  try {
    toast.loading("Suppression...")

    await useMutationDeleteQuery(q.id)

    mineQueries.value = mineQueries.value.filter(item => item.id !== q.id)

    if (selectedQuery.value?.id === q.id) {
      selectedQuery.value = null
      isEditing.value = false
      if (editor) editor.dispose()
    }

    toast.success("Requête supprimée")

  } catch (err) {
    console.error(err)
    toast.error("Erreur lors de la suppression")
  } finally {
    toast.clearAll()
  }
}

async function togglePublicState() {
  if (!selectedQuery.value) return

  const newState = !selectedQuery.value.isPublic

  try {
    toast.loading("Mise à jour de la visibilité...")

    // --- PUT avec la méthode EXISTANTE ---
    await useMutationUpdateQuery(selectedQuery.value.id, {
      sqlRaw: selectedQuery.value.sqlRaw,
      title: selectedQuery.value.title,
      description: selectedQuery.value.description,
      isPublic: newState
    })

    // --- Mise à jour locale ---
    selectedQuery.value.isPublic = newState

    // Force la réactivité
    mineQueries.value = [...mineQueries.value]

    toast.success(newState ? "Requête rendue publique" : "Requête rendue privée")

  } catch (err) {
    console.error("Erreur lors du changement de visibilité :", err)
    toast.error("Erreur lors de la mise à jour")
  } finally {
    toast.clearAll()
  }
}

async function createNewQuery() {
  try {
    toast.loading("Création de la requête...")

    const defaultPayload = {
      title: "Nouvelle requête",
      description: "",
      sqlRaw: "select count(*) from item"
    }

    // 1️⃣ Création en base
    const { data } = await useMutationCreateQuery(defaultPayload)

    const newQuery = data.data

    // 2️⃣ Ajout dans la liste mineQueries
    mineQueries.value.push(newQuery)

    // 3️⃣ Sélection automatique
    selectedQuery.value = newQuery
    selectedIsMine.value = true
    isEditing.value = false

    tempTitle.value = newQuery.title
    tempDescription.value = newQuery.description

    // 4️⃣ Recharger l’éditeur
    nextTickSetupEditor(newQuery.sqlRaw)

    // 5️⃣ Toast succès
    toast.success("Nouvelle requête créée")

  } catch (error) {
    console.error("Erreur lors de la création de la requête :", error)
    toast.error("Erreur lors de la création")
  } finally {
    toast.clearAll()
  }
}
</script>

<style scoped>
.doc-content {
  padding: 10px 14px;
  background: #252525;
  border-top: 1px solid #444;
  font-size: 14px;
  color: #ddd;
}

.doc-content h4 {
  margin-top: 10px;
  margin-bottom: 6px;
  color: #82c7ff;
}

.doc-content ul {
  margin: 0 0 10px 15px;
}

.doc-content pre {
  background: #1a1a1a;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #bfeaff;
  overflow-x: auto;
}

.dql-container {
  display: flex;
  height: 100%;
  background: #1e1e1e;
  color: white;
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  border-right: 1px solid #333;
  padding: 10px;
  overflow-y: auto;
}

.query-item {
  padding: 6px 8px;
  cursor: pointer;
  background: #2b2b2b;
  margin-bottom: 5px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}
.query-item.add {
  background: #1c3f1c;
  color: #9fff9f;
  font-weight: bold;
}
.query-item.selected {
  background: #3f3f3f;
}

.delete-btn {
  color: #ff3b3b;
  cursor: pointer;
  font-size: 18px;
}

.query-name {
  flex: 1;
}

/* MAIN PANEL */
.editor-panel {
  flex: 1;
  padding: 10px;
}

.editor-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-resizable {
  position: relative;
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
}

.editor {
  width: 100%;
  height: 100%;
}

/* Barre de redimensionnement */
.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
  background: rgba(255, 255, 255, 0.12);
}

/* READONLY OVERLAY */
.readonly-overlay {
  position: absolute;
  top: 6px;
  right: 14px;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1;
}

.accordion {
  border: 1px solid #444;
  border-radius: 6px;
  background: #222;
  margin-bottom: 15px;
  margin-right: 2rem;
}

.accordion-header {
  padding: 10px 14px;
  background: #2b2b2b;
  border-bottom: 1px solid #444;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  user-select: none;
}

.accordion-header:hover {
  background: #333;
}

.editor-wrapper {
  padding: 10px;
}

/* TITLE */
.title-input {
  margin-bottom: 10px;
  padding: 8px;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 16px;
}

/* EDITOR */
.editor {
  border: 1px solid #333;
  border-radius: 6px;
  height: 100%;
  margin-bottom: 10px;
}

/* DESCRIPTION */
.description-input {
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 8px;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  height: 90px;
  resize: none;
}

/* BUTTON BAR */
.buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.center {
  display: flex;
  gap: 10px;
}

.right-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 2rem;
  height: 100%;
  background: #1c1c1c;
  border-left: 1px solid #444;
  overflow: hidden;
  transition: width 0.25s ease;
  z-index: 4;
}

.right-panel.open {
  width: 45%; /* largeur ouverte */
}

/* Barre verticale cliquable */
.right-panel-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 2rem;            /* poignée visible */
  height: 100%;
  background: #2b2b2b;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #444;
  user-select: none;
}

.right-panel-header:hover {
  background: #3b3b3b;
}

/* Contenu du panel */
.right-panel-content {
  margin-left: 14px;         /* laisse la barre visible */
  padding: 10px;
  overflow: auto;
  height: 100%;
}

.empty-result {
  color: #aaa;
  padding: 10px;
}

table {
  border-collapse: collapse;
  width: 100%;
  background: #222;
  color: white;
}

th, td {
  padding: 6px 8px;
  border: 1px solid #444;
}

.exec-result-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
  color: white;
}

.exec-result-box.ok {
  background: #155724;
  border: 1px solid #1b5e20;
}

.exec-result-box.error {
  background: #7f1d1d;
  border: 1px solid #b71c1c;
}

.exec-result-close {
  cursor: pointer;
  font-size: 16px;
  padding-left: 10px;
  user-select: none;
}

.exec-result-close:hover {
  color: #eee;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  border: none;
}
.btn.orange { background: #b86800; }
.btn.green  { background: #2f8f2f; }
.btn.red    { background: #b42424; }
.btn.blue   { background: #2468b9; }
</style>
