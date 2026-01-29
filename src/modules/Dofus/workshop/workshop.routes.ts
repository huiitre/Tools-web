export const routes = [
  {
    name: 'dofus-workshop',
    path: 'workshop',
    component: () => import('@/modules/Dofus/workshop/views/Workshop.vue'),
    meta: {
      label: 'Atelier',
    },
  }
]