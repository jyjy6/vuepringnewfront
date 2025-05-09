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
    component: () =>
      import(/* webpackChunkName: "division" */ "../pages/division.vue"),
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
      {
        path: "newswrite",
        name: "AdminNewsWrite",
        component: () =>
          import(
            /* webpackChunkName: "adminnewswrite" */ "../pages/admin/newswrite.vue"
          ),
      },
      {
        path: "shopinput",
        name: "AdminShopInput",
        component: () =>
          import(
            /* webpackChunkName: "adminshopinput" */ "../pages/admin/shopinput.vue"
          ),
      },
      {
        path: "homevideoinput",
        name: "AdminHomeVideoInput",
        component: () =>
          import(
            /* webpackChunkName: "adminhomevideoinput" */ "../pages/admin/homevideoinput.vue"
          ),
      },
      {
        path: "allorders",
        name: "AdminAllOrders",
        component: () =>
          import(
            /* webpackChunkName: "adminallorders" */ "../pages/admin/allorders.vue"
          ),
      },
      {
        path: "allchat",
        name: "AdminAllChat",
        component: () =>
          import(
            /* webpackChunkName: "adminallchat" */ "../pages/admin/allchat.vue"
          ),
      },
    ],
  },
  {
    path: "/shop",
    name: "Shop",
    component: () => import(/* webpackChunkName: "shop" */ "../pages/shop.vue"),
    children: [
      {
        path: "detail/:id",
        name: "ShopDetail",
        component: () =>
          import(
            /* webpackChunkName: "shopdetail" */ "../components/ShopDetailComponent.vue"
          ),
        props: true,
      },
    ],
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import(/* webpackChunkName: "cart" */ "../pages/cart.vue"),
  },
  {
    path: "/order",
    name: "Order",
    component: () =>
      import(/* webpackChunkName: "order" */ "../pages/order.vue"),
  },
  {
    path: "/auth/google-callback",
    name: "Google-Callback",
    component: () =>
      import(
        /* webpackChunkName: "google-callback" */ "../pages/auth/google-callback.vue"
      ),
  },
  {
    path: "/mypage",
    name: "MyPage",
    component: () =>
      import(/* webpackChunkName: "admin" */ "../pages/mypage/index.vue"),
    children: [
      {
        path: "modify", // '/mypage/modify'로 접근 가능
        name: "MyPageModify",
        component: () =>
          import(
            /* webpackChunkName: "mypagemodify" */ "../pages/mypage/modify.vue"
          ),
      },
    ],
  },
  {
    path: "/chat",
    name: "Chat",
    component: () =>
      import(/* webpackChunkName: "chat" */ "../pages/chat/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
