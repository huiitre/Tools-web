<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

// STORE
const store = useStore()

// On récupère les 3 dernières notes du store Core
const lastNotes = computed(() => {
  const notes = store.getters["Core/getReleasesNote"] || []
  return notes.slice(0, 3)
})
console.log("%c Home.vue #13 || lastNotes : ", 'background:red;color:#fff;font-weight:bold;', lastNotes.value);
</script>

<template>
  <div id="home">

    <!-- SECTION NOTES DE MISE À JOUR -->
    <section class="update-notes">
      <h2 class="section-title">Dernières mises à jour</h2>

      <div class="notes-list">
        <div v-for="note in lastNotes" :key="note.id" class="note-card">

          <div class="note-header">
            <span class="note-version">{{ note.version }}</span>
            <span class="note-module">{{ note.module }}</span>
          </div>

          <p class="note-description">
            {{ note.description }}
          </p>

          <p class="note-date">
            {{ new Date(note.created_at).toLocaleDateString("fr-FR") }}
          </p>
        </div>
      </div>
    </section>

    <!-- TITRE PRINCIPAL -->
    <section class="servers-section">
      <h2 class="main-title">Viens t'amuser avec Huihui</h2>

      <!-- LISTE DES SERVEURS -->
      <div class="servers-grid">

        <!-- SERVEUR 7 DAYS TO DIE -->
        <div class="server-card">
          <h3 class="server-title">Si t'es un homme, tu viens !</h3>

          <div class="banner-wrapper">
            <a href="https://www.gametracker.com/server_info/90.66.181.5:26900/" target="_blank">
              <img
                src="https://cache.gametracker.com/server_info/90.66.181.5:26900/b_560_95_1.png"
                alt="7 Days to Die Server Banner"
                class="server-banner"
              />
            </a>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<style lang="scss" scoped>
#home {
  width: 100%;
  margin: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

/* ----------------------------- */
/* SECTION NOTES DE MISE À JOUR */
/* ----------------------------- */

.update-notes {
  width: 100%;
  max-width: 1000px;
  padding: 0 1rem;

  .section-title {
    font-size: 1.6rem;       /* réduit */
    font-weight: 700;
    margin-bottom: 1rem;     /* réduit */
    text-align: center;
    opacity: 0.9;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem; /* compact */

    .note-card {
      padding: 0.6rem 0.9rem; /* compact */
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      backdrop-filter: blur(3px);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(255,255,255,0.12);
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      }

      .note-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;

        .note-version {
          font-size: 1rem;
          font-weight: 600;
        }

        .note-module {
          opacity: 0.7;
          font-size: 0.8rem;
        }
      }

      .note-description {
        font-size: 0.9rem;
        opacity: 0.85;
        margin-bottom: 0.2rem;

        /* compact sur une seule ligne */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .note-date {
        font-size: 0.75rem;
        opacity: 0.55;
        text-align: right;
      }
    }
  }
}

/* ----------------------------- */
/* SECTION SERVEURS */
/* ----------------------------- */

.servers-section {
  width: 100%;
  max-width: 1000px;
  padding: 0 1rem;

  .main-title {
    font-size: 1.8rem;         /* réduit */
    font-weight: 700;          /* moins massif */
    text-align: center;
    margin-bottom: 1.6rem;     /* plus compact */
    opacity: 0.9;              /* moins "criard" */
    letter-spacing: 0.3px;     /* look plus moderne */
  }
}

.servers-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.server-card {
  padding: 1.8rem;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(6px);
  transition: all 0.25s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.25);
  }

  .server-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
  }

  .banner-wrapper {
    display: flex;
    justify-content: center;

    .server-banner {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.25s ease;

      &:hover {
        transform: scale(1.025);
      }
    }
  }
}
</style>
