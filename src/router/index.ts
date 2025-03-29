import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: "home" */ "../pages/index.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../pages/login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () =>
      import(/* webpackChunkName: "Register" */ "../pages/register.vue"),
  },
  {
    path: "/news",
    name: "News",
    component: () => import(/* webpackChunkName: "news" */ "../pages/news.vue"),
  },
  {
    path: "/p4p",
    name: "P4P",
    component: () => import(/* webpackChunkName: "p4p" */ "../pages/p4p.vue"),
  },
  {
    path: "/:division",
    name: "Division",
    component: import(
      /* webpackChunkName: "division" */ "../pages/division.vue"
    ),
    props: true, // URL 파라미터를 컴포넌트의 props로 전달
  },
  {
    path: "/admin",
    name: "AdminPage",
    component: () =>
      import(/* webpackChunkName: "admin" */ "../pages/admin/index.vue"),
    children: [
      {
        path: "boxerinput", // '/admin/boxerinput'으로 접근 가능
        name: "AdminBoxerInput",
        component: () =>
          import(
            /* webpackChunkName: "adminboxerinput" */ "../pages/admin/boxerinput.vue"
          ),
      },
      {
        path: "boxermodify/:id",
        name: "AdminBoxerModify",
        component: () =>
          import(
            /* webpackChunkName: "adminboxermodify" */ "../pages/admin/boxermodify.vue"
          ),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
