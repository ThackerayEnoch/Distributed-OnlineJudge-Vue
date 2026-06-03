import { createRouter, createWebHistory } from 'vue-router';
import notFoundRoute from '@/common/routes/notFoundRoutes';
import layoutRoutes from '@/common/routes/layoutRoutes';
import authRoutes from '@/auth/routes/authRoutes';
import adminRoutes from '@/admin/routes/adminRoutes';
function getVpnPrefix() {
  const path = window.location.pathname;
  console.log("basePath: "+path);
  const match = path.match(/^\/http\/[0-9a-f]+\/app/);
  console.log("finalPath: "+(match ? match[0] : '/app'));
  return match ? match[0] : '/app';
}

const router = createRouter({
  history: createWebHistory(getVpnPrefix()),
  // history: createWebHistory(),
  routes: [
    ...layoutRoutes,
    ...authRoutes,
    ...adminRoutes,
    notFoundRoute
  ]
});

export default router;