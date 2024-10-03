import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/user/entity/user'

export const useUserStore = defineStore('user', () => {
  const currentUser = reactive(new User())
  function setUser(user: User) {
    Object.assign(currentUser, user);
  }
  function resetUser() {
    const user = new User()
    Object.assign(currentUser, user);
  }
  return { currentUser, setUser, resetUser }
})
