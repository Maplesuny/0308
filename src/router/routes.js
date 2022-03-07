const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "/test1", component: () => import("components/dialog.vue") },
      { path: "/CZ", component: () => import("pages/CZ.vue") },
      { path: "/A1_A2", component: () => import("pages/A1_A2.vue") },
      {
        path: "/Double_Banana",
        component: () => import("pages/Double_Banana.vue"),
      },
      { path: "/total", component: () => import("pages/total.vue") },
      { path: "/todo", component: () => import("components/TODO.vue") },
      { path: "/tt", component: () => import("pages/tt.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
