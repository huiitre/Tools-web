export const valorantRoutes = [
  {
    name: 'riot-valorant-shop',
    path: 'valorant-daily-shop',
    component: () => import('@/modules/Riot/valorant/views/ValorantDailyShop.vue'),
    meta: {
      label: 'Valorant Shop',
    },
  },
]
