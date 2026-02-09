<!-- settings/AccountProfileSection.vue -->
<script setup lang="ts">
type Props = {
  displayName?: string
  email?: string
  avatarUrl?: string | null
}

defineProps<Props>()
</script>

<template>
  <section class="account-profile">
    <header class="section-header">
      <h2>Profil</h2>
      <p class="section-subtitle">Avatar, nom, pseudo</p>
    </header>

    <div class="card">
      <div class="row">
        <div class="avatar">
          <div class="avatar-placeholder">IMG</div>
        </div>

        <div class="content">
          <div class="line">
            <span class="label">Nom</span>
            <span class="value">{{ displayName ?? '—' }}</span>
          </div>

          <div class="line">
            <span class="label">Email</span>
            <span class="value">{{ email ?? '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---- layout global ---- */
.account-profile {
  padding-right: 1rem;
}

/* ---- header ---- */
.section-header {
  margin-bottom: 1rem;
}

.section-subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.75;
  font-size: 0.9rem;
}

/* ---- card ---- */
.card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem;

  /* desktop lisible, aligné à gauche */
  max-width: 640px;
}

/* ---- row ---- */
.row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

/* ---- avatar ---- */
.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 1px solid #ddd;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  opacity: 0.8;
  flex-shrink: 0;
}

/* ---- content ---- */
.content {
  flex: 1;
  min-width: 0; /* CRITIQUE : empêche le scroll horizontal */
}

.line {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.35rem 0;
  border-bottom: 1px dashed #eee;
}

.line:last-child {
  border-bottom: none;
}

.label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.value {
  font-weight: 600;
  overflow-wrap: anywhere;
}

/* ---- desktop only ---- */
@media (min-width: 768px) {
  .line {
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
  }

  .label {
    white-space: nowrap;
  }

  .value {
    text-align: right;
  }
}
</style>
