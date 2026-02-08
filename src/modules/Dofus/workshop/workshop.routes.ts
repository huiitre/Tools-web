export const routes = [
  {
    name: 'dofus-workshop',
    path: 'workshop',
    component: () => import('@/modules/Dofus/workshop/views/Workshop.vue'),
    meta: {
      label: 'Atelier',
    },
    redirect: { name: 'dofus-workshop-list' },
    children: [
      {
        path: '',
        name: 'dofus-workshop-list',
        component: () =>
          import('@/modules/Dofus/workshop/views/WorkshopListPage.vue'),
      },
      {
        path: 'archive',
        name: 'dofus-workshop-archive',
        component: () =>
          import('@/modules/Dofus/workshop/views/WorkshopListPage.vue'),
      },
      {
        path: 'tag/:tagId',
        name: 'dofus-workshop-tag',
        component: () =>
          import('@/modules/Dofus/workshop/views/WorkshopListPage.vue'),
        props: true,
      },
      {
        path: ':workshopId',
        name: 'dofus-workshop-detail',
        component: () =>
          import('@/modules/Dofus/workshop/views/WorkshopDetailPage.vue'),
        props: true,
      },
    ],
  },
]