import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/common/entity/user'

export const useUserStore = defineStore('user', () => {
  
  // 当前登录用户
  const currentUser = reactive(new User())
  // 设置用户
  function setUser(user: User) {
    Object.assign(currentUser, user);
  }
  // 重置用户
  function resetUser() {
    Object.assign(currentUser, new User());
  }
  return { currentUser, setUser, resetUser }
},{
  persist: true // 启用持久化
});
