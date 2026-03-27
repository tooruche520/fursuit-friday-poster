import type { RoleDefinition } from '~/types'

export function useRoles() {
  // 預設角色定位（初始值）
  const defaultRoles: RoleDefinition[] = [
    { id: 'photography', name: '攝影', displayName: '攝影', icon: 'lucide:camera' },
    { id: 'fursuit-maker', name: '毛裝工作室', displayName: '毛裝工作室', icon: 'lucide:scissors' },
    { id: 'partner', name: '搭檔', displayName: '搭檔', icon: 'lucide:paw-print' },
    { id: 'special-thanks', name: '特別感謝', displayName: '特別感謝', icon: 'lucide:heart' },
  ]

  // 自訂角色（儲存在 localStorage）
  const roles = useLocalStorage<RoleDefinition[]>('fursuit-friday-roles', defaultRoles)

  // 新增角色
  const addRole = (role: RoleDefinition) => {
    const exists = roles.value.some(r => r.id === role.id)
    if (!exists) {
      roles.value = [...roles.value, role]
    }
  }

  // 更新角色
  const updateRole = (id: string, updates: Partial<RoleDefinition>) => {
    const index = roles.value.findIndex(r => r.id === id)
    if (index >= 0) {
      roles.value = [
        ...roles.value.slice(0, index),
        { ...roles.value[index]!, ...updates },
        ...roles.value.slice(index + 1)
      ]
    }
  }

  // 刪除角色
  const deleteRole = (id: string) => {
    roles.value = roles.value.filter(r => r.id !== id)
  }

  // 取得角色
  const getRole = (id: string): RoleDefinition | undefined => {
    return roles.value.find(r => r.id === id)
  }

  // 根據顯示名稱查找角色
  const getRoleByName = (name: string): RoleDefinition | undefined => {
    return roles.value.find(r => r.name === name)
  }

  return {
    roles,
    addRole,
    updateRole,
    deleteRole,
    getRole,
    getRoleByName,
  }
}
