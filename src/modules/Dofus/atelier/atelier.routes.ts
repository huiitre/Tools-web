export const routes = [
  {
    name: 'dofus-atelier',
    path: 'atelier',
    component: () => import('@/modules/Dofus/atelier/views/Atelier.vue'),
    meta: {
      label: 'Atelier',
    },
  }
]