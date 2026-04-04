export const settingTabs = [
  {
    value: 'contacts',
    icon: 'lucide:users',
    label: '通訊錄',
    description: '管理獸裝夥伴的社群帳號',
  },
  {
    value: 'roles',
    icon: 'lucide:tag',
    label: '角色定位',
    description: '定義拍攝者、夥伴等角色標籤',
  },
  {
    value: 'styles',
    icon: 'lucide:palette',
    label: '提示詞風格',
    description: '管理 AI 生成說明文字時所使用的風格範本',
  },
  {
    value: 'apikeys',
    icon: 'lucide:key',
    label: 'API 金鑰',
    description: '設定 API 金鑰',
  },
] as const;

export type SettingTabValue = typeof settingTabs[number]['value'] | 'setting-home';

const activeTab = ref("setting-home");

export function useSettingTabs() {
  const navigate = (value: string) => {
    activeTab.value = value;
  };

  return { activeTab, tabs: settingTabs, navigate };
}
