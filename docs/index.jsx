import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Image as ImageIcon, Copy, Check, 
  Twitter, Instagram, Hash, Users, Trash2, Plus, LayoutTemplate,
  Book, Save, Edit2, ChevronLeft, AtSign, MessageCircle, Globe, Facebook,
  MessageSquare, UserPlus, GripVertical, X
} from 'lucide-react';

// --- 模擬 shadcn UI 基礎元件 ---
const Card = ({ className = '', children }) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`}>{children}</div>
);
const Label = ({ className = '', children }) => (
  <label className={`text-sm font-medium leading-none text-slate-700 ${className}`}>{children}</label>
);
const Input = ({ className = '', ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:border-transparent transition-all disabled:opacity-50 ${className}`} {...props} />
);
const Textarea = ({ className = '', ...props }) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 transition-all disabled:opacity-50 ${className}`} {...props} />
);
const Button = ({ className = '', variant = 'default', size = 'default', ...props }) => {
  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-sm',
    outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
    secondary: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
  };
  const sizes = { default: 'h-10 px-4 py-2', sm: 'h-9 rounded-md px-3', icon: 'h-10 w-10' };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
};

// --- 平台設定與圖示輔助 ---
const PLATFORMS = [
  { id: 'twitter', name: 'X (Twitter)', icon: <Twitter className="w-4 h-4 text-sky-500" /> },
  { id: 'ig', name: 'Instagram', icon: <Instagram className="w-4 h-4 text-pink-600" /> },
  { id: 'bsky', name: 'Bluesky', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.905C2.566 1.075 0 2.227 0 5.422c0 3.393 1.282 8.358 2.016 9.423.734 1.066 1.636 1.045 2.622.844C8.59 14.885 12 10.8 12 10.8zm0 0c1.087-2.114 4.046-6.053 6.798-7.905C21.434 1.075 24 2.227 24 5.422c0 3.393-1.282 8.358-2.016 9.423-.734 1.066-1.636 1.045-2.622.844-3.951-.804-7.362-4.885-7.362-4.885zm-4.382 6.425c3.21 2.25 4.382 4.14 4.382 4.14s1.172-1.89 4.382-4.14c2.81-1.968 4.414-2.126 5.37-.506.956 1.62-.705 3.996-3.766 5.337-3.06 1.34-5.986 1.34-5.986 1.34s-2.926 0-5.986-1.34c-3.06-1.34-4.722-3.717-3.766-5.337.956-1.62 2.56-1.462 5.37.506z"/></svg> },
  { id: 'threads', name: 'Threads', icon: <AtSign className="w-4 h-4 text-slate-900" /> },
  { id: 'plurk', name: 'Plurk', icon: <MessageCircle className="w-4 h-4 text-orange-500" /> },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-4 h-4 text-blue-600" /> },
  { id: 'custom', name: '自訂', icon: <Globe className="w-4 h-4 text-emerald-600" /> },
];

const getPlatform = (id) => PLATFORMS.find(p => p.id === id) || PLATFORMS.find(p => p.id === 'custom');

// --- 支援搜尋的 Combobox 元件 (重構為更通用的 onChange 模式) ---
const TagNameAutocomplete = ({ name, onUpdate, contacts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(name || '');
  const wrapperRef = useRef(null);

  useEffect(() => { setSearch(name || ''); }, [name]);
  
  useEffect(() => {
    function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        placeholder="搜尋通訊錄或直接輸入..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onUpdate({ name: e.target.value });
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {filtered.map(c => (
            <div
              key={c.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex justify-between items-center border-b border-slate-50 last:border-0"
              onClick={() => {
                onUpdate({ 
                  name: c.name, 
                  role: c.role, 
                  platforms: JSON.parse(JSON.stringify(c.platforms)) 
                });
                setIsOpen(false);
              }}
            >
              <span className="font-medium text-slate-800">{c.name}</span>
              <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{c.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 動態平台輸入區塊共用元件 ---
const PlatformListEditor = ({ platforms, onChange }) => {
  const addPlatform = () => {
    onChange([...platforms, { id: Math.random().toString(36).substr(2, 9), type: 'twitter', handle: '', customName: '' }]);
  };
  const updatePlatform = (id, field, value) => {
    onChange(platforms.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removePlatform = (id) => {
    onChange(platforms.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-3">
      {platforms.map((p) => {
        const platformDef = getPlatform(p.type);
        return (
          <div key={p.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center relative group p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm border border-slate-100">
                {platformDef.icon}
              </div>
              <select 
                className="h-9 w-full sm:w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={p.type}
                onChange={(e) => updatePlatform(p.id, 'type', e.target.value)}
              >
                {PLATFORMS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
            {p.type === 'custom' && (
              <Input className="h-9 w-full sm:w-28 text-xs" placeholder="平台名稱" value={p.customName || ''} onChange={(e) => updatePlatform(p.id, 'customName', e.target.value)} />
            )}
            <Input className="h-9 flex-1" placeholder={p.type === 'custom' ? "輸入網址或帳號" : "@帳號"} value={p.handle} onChange={(e) => updatePlatform(p.id, 'handle', e.target.value)} />
            <button onClick={() => removePlatform(p.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={addPlatform} className="text-xs text-slate-500 w-full border-dashed">
        <Plus className="w-3 h-3 mr-1" /> 新增社群平台
      </Button>
    </div>
  );
};

// --- 主應用程式 ---
export default function App() {
  const [currentView, setCurrentView] = useState('generator');

  // 通訊錄狀態
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('fursuit_contacts_v2');
    if (saved) return JSON.parse(saved);
    const oldSaved = localStorage.getItem('fursuit_contacts');
    if (oldSaved) {
      const parsedOld = JSON.parse(oldSaved);
      const migrated = parsedOld.map(c => {
        const platforms = [];
        if (c.twitter) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'twitter', handle: c.twitter });
        if (c.ig) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'ig', handle: c.ig });
        if (c.bsky) platforms.push({ id: Math.random().toString(36).substr(2, 9), type: 'bsky', handle: c.bsky });
        return { id: c.id, name: c.name, role: c.role, platforms };
      });
      localStorage.setItem('fursuit_contacts_v2', JSON.stringify(migrated));
      return migrated;
    }
    return [{ 
      id: 'c1', name: '阿白', role: '攝影', 
      platforms: [{ id: 'p1', type: 'twitter', handle: '@shiro_tw' }, { id: 'p2', type: 'ig', handle: '@shiro_photo' }] 
    }];
  });

  useEffect(() => { localStorage.setItem('fursuit_contacts_v2', JSON.stringify(contacts)); }, [contacts]);

  // 發文神器狀態
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mainText, setMainText] = useState('');
  const [hashtags, setHashtags] = useState('#FursuitFriday #Fursuit #Kemono');
  
  // 目前貼文的標記者清單
  const [tags, setTags] = useState([
    { id: 't1', role: '攝影', name: '阿白', platforms: [{ id: 'pt1', type: 'twitter', handle: '@shiro_tw' }] }
  ]);
  const [activePlatform, setActivePlatform] = useState('twitter');
  const [copied, setCopied] = useState(false);

  // 彈出視窗編輯狀態 (發文神器使用)
  const [editingPostTag, setEditingPostTag] = useState(null);

  // 通訊錄編輯狀態
  const [editingContact, setEditingContact] = useState(null);
  const [editingError, setEditingError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // --- 拖曳排序邏輯 (HTML5 Drag & Drop) ---
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _tags = [...tags];
    const draggedItemContent = _tags.splice(dragItem.current, 1)[0];
    _tags.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setTags(_tags);
  };

  // --- 發文神器邏輯 ---
  const handleGenerateAI = () => {
    if (!imageUploaded) return;
    setIsGenerating(true);
    setTimeout(() => {
      setMainText("Happy #FursuitFriday! 🐾\n這週終於有空出去拍拍了，天氣超級好！太陽曬在毛毛上超溫暖的～\n大家週末有什麼計畫嗎？\n\n感謝超讚的攝影把照片拍得這麼好看✨");
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    const textToCopy = generateFinalText();
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error('複製失敗', err); }
    document.body.removeChild(textArea);
  };

  const generateFinalText = () => {
    let text = mainText ? mainText + '\n\n' : '';
    const roleGroups = [];

    // 將標記者根據角色分組 (保留拖曳後第一次出現的排序)
    tags.forEach(tag => {
      const matchedPlatform = tag.platforms.find(p => p.type === activePlatform);
      const fallbackHandle = tag.platforms.find(p => p.handle?.trim())?.handle || tag.name || '未填寫名稱';
      const handle = matchedPlatform?.handle?.trim() ? matchedPlatform.handle : fallbackHandle;

      let roleIcon = '👤';
      if (tag.role === '攝影') roleIcon = '📸';
      if (tag.role === '毛裝工作室') roleIcon = '✂️';
      if (tag.role === '搭檔') roleIcon = '🐾';
      if (tag.role === '特別感謝') roleIcon = '✨';

      let group = roleGroups.find(g => g.role === tag.role);
      if (!group) {
        group = { role: tag.role, icon: roleIcon, handles: [] };
        roleGroups.push(group);
      }
      group.handles.push(handle);
    });

    // 輸出時，同群組的帳號以空格分隔
    const formattedTags = roleGroups.map(g => `${g.icon} ${g.role}：${g.handles.join(' ')}`);

    if (formattedTags.length > 0) text += formattedTags.join('\n') + '\n\n';
    if (hashtags) text += hashtags;
    return text;
  };

  // 處理貼文標記者的儲存
  const savePostTag = () => {
    // 1. 儲存至當前貼文的標記清單
    if (tags.find(t => t.id === editingPostTag.id)) {
      setTags(tags.map(t => t.id === editingPostTag.id ? editingPostTag : t));
    } else {
      setTags([...tags, { ...editingPostTag, id: Math.random().toString(36).substr(2, 9) }]);
    }
    
    // 2. 自動加入通訊錄邏輯
    if (editingPostTag.name && editingPostTag.name.trim() !== '') {
      // 檢查通訊錄是否已存在相同名稱的聯絡人
      const isExistInContacts = contacts.some(c => c.name.trim() === editingPostTag.name.trim());
      
      if (!isExistInContacts) {
        // 如果不存在，自動新增為新的聯絡人
        const newContact = {
          id: Date.now().toString(),
          name: editingPostTag.name.trim(),
          role: editingPostTag.role,
          // 深拷貝 platforms 以免參照污染
          platforms: JSON.parse(JSON.stringify(editingPostTag.platforms))
        };
        setContacts(prevContacts => [...prevContacts, newContact]);
      }
    }

    setEditingPostTag(null);
  };

  // --- 畫面渲染：發文神器 ---
  const renderGeneratorView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="lg:col-span-7 space-y-6">
        
        {/* 1. AI 內文生成 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">1. AI 內文生成</h2>
          </div>
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${imageUploaded ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50 bg-white'}`}
              onClick={() => setImageUploaded(true)}
            >
              {imageUploaded ? (
                <><Check className="w-10 h-10 text-indigo-500 mb-2" /><p className="text-sm font-medium text-indigo-600">圖片已上傳 (示範)</p></>
              ) : (
                <><ImageIcon className="w-10 h-10 text-slate-400 mb-2" /><p className="text-sm font-medium text-slate-600">點擊或拖曳上傳</p></>
              )}
            </div>
            <Button 
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={handleGenerateAI} disabled={isGenerating || !imageUploaded}
            >
              {isGenerating ? <span className="animate-pulse">✨ AI 靈感湧現中...</span> : <><Sparkles className="w-4 h-4" /> {imageUploaded ? '讓 AI 幫我寫草稿！' : '請先上傳圖片以使用 AI'}</>}
            </Button>
            <Textarea value={mainText} onChange={(e) => setMainText(e.target.value)} placeholder="草稿內容..." className="min-h-[120px] resize-y" />
          </div>
        </Card>

        {/* 2. 綁定標記者 (精簡版 + 拖曳) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">2. 綁定標記者</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditingPostTag({ name: '', role: '搭檔', platforms: [{ id: Math.random().toString(36).substr(2, 9), type: 'twitter', handle: '' }] })} className="gap-1">
              <Plus className="w-4 h-4" /> 新增名單
            </Button>
          </div>

          <div className="space-y-2">
            {tags.length === 0 && (
              <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 text-sm">
                尚無綁定任何夥伴
              </div>
            )}
            {tags.map((tag, index) => (
              <div 
                key={tag.id}
                draggable
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-indigo-300 transition-colors cursor-move"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200 whitespace-nowrap">
                    {tag.role}
                  </span>
                  <span className="font-medium text-slate-900 truncate">
                    {tag.name || '未命名夥伴'}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => setEditingPostTag(tag)} className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"><Edit2 className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="sm" onClick={() => setTags(tags.filter(t => t.id !== tag.id))} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
                </div>
              </div>
            ))}
            {tags.length > 1 && (
              <p className="text-xs text-slate-400 text-center mt-3 pt-2">💡 提示：按住項目可以拖曳自訂順序，相同定位的夥伴會自動合併於同一行</p>
            )}
          </div>
        </Card>

        {/* 3. 排版與 Hashtags */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">3. 排版與 Hashtags</h2>
          </div>
          <div className="space-y-4">
            <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#FursuitFriday #Kemono" />
          </div>
        </Card>

      </div>

      {/* 右側：預覽與輸出區 */}
      <div className="lg:col-span-5 relative">
        <div className="sticky top-24 space-y-4">
          <Card className="p-1 shadow-md border-slate-200/60 overflow-hidden bg-slate-900">
            <div className="flex p-1 bg-slate-800/50 rounded-t-lg overflow-x-auto no-scrollbar">
              {['twitter', 'ig', 'bsky', 'threads', 'plurk'].map((platformId) => {
                const pDef = getPlatform(platformId);
                return (
                  <button
                    key={platformId}
                    onClick={() => setActivePlatform(platformId)}
                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-2.5 px-2 text-sm font-medium rounded-md transition-all ${
                      activePlatform === platformId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {pDef.icon} <span className="hidden sm:inline">{pDef.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
            <div className="bg-white m-1 mt-0 rounded-b-lg p-6 min-h-[300px]">
              <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-sans">
                {generateFinalText() || <span className="text-slate-400 italic">尚未輸入內容...</span>}
              </div>
            </div>
          </Card>
          <Button onClick={handleCopy} className={`w-full h-14 text-base font-bold shadow-lg transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
            {copied ? <><Check className="w-5 h-5 mr-2" /> 複製成功！快去貼文吧</> : <><Copy className="w-5 h-5 mr-2" /> 複製專屬格式</>}
          </Button>
        </div>
      </div>

      {/* --- 發文神器專用：標記者編輯 Dialog --- */}
      {editingPostTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> {editingPostTag.id ? '編輯本篇貼文標記' : '新增本篇貼文標記'}
              </h3>
              <button onClick={() => setEditingPostTag(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-slate-50/50 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">角色定位</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                    value={editingPostTag.role}
                    onChange={(e) => setEditingPostTag({...editingPostTag, role: e.target.value})}
                  >
                    <option value="攝影">攝影</option>
                    <option value="毛裝工作室">毛裝工作室</option>
                    <option value="搭檔">搭檔</option>
                    <option value="特別感謝">特別感謝</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block text-indigo-600 flex items-center gap-1">顯示名稱 (支援搜尋) <Sparkles className="w-3 h-3"/></Label>
                  <TagNameAutocomplete 
                    name={editingPostTag.name} 
                    onUpdate={(fields) => setEditingPostTag({ ...editingPostTag, ...fields })} 
                    contacts={contacts} 
                  />
                </div>
              </div>
              <div>
                <Label className="mb-3 block text-base border-b pb-2">本篇貼文的社群平台設定</Label>
                <PlatformListEditor 
                  platforms={editingPostTag.platforms} 
                  onChange={(newPlats) => setEditingPostTag({...editingPostTag, platforms: newPlats})} 
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <Button variant="ghost" onClick={() => setEditingPostTag(null)}>取消</Button>
              <Button onClick={savePostTag} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Check className="w-4 h-4" /> 確認綁定
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  // --- 畫面渲染：通訊錄管理 ---
  const renderContactsView = () => {
    // 通訊錄的儲存邏輯
    const saveContact = () => {
      if (!editingContact.name.trim()) { setEditingError("請輸入聯絡人名稱"); return; }
      if (contacts.find(c => c.id === editingContact.id)) {
        setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
      } else {
        setContacts([...contacts, { ...editingContact, id: Date.now().toString() }]);
      }
      setEditingContact(null); setEditingError("");
    };

    if (editingContact) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button onClick={() => { setEditingContact(null); setEditingError(""); }} className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> 返回名單
          </button>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              {contacts.find(c => c.id === editingContact.id) ? <><Edit2 className="w-5 h-5 text-indigo-600"/> 編輯夥伴資料</> : <><UserPlus className="w-5 h-5 text-emerald-600"/> 新增夥伴資料</>}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">顯示名稱 *</Label>
                  <Input 
                    placeholder="例如: 阿白" value={editingContact.name} 
                    onChange={(e) => { setEditingContact({...editingContact, name: e.target.value}); if(editingError) setEditingError(""); }} 
                    className={editingError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {editingError && <p className="text-red-500 text-xs mt-1">{editingError}</p>}
                </div>
                <div>
                  <Label className="mb-2 block">預設定位</Label>
                  <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" value={editingContact.role} onChange={(e) => setEditingContact({...editingContact, role: e.target.value})}>
                    <option value="攝影">攝影</option>
                    <option value="毛裝工作室">毛裝工作室</option>
                    <option value="搭檔">搭檔</option>
                    <option value="特別感謝">特別感謝</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="mb-3 block text-base border-b pb-2">社群平台綁定</Label>
                <PlatformListEditor platforms={editingContact.platforms} onChange={(newPlatforms) => setEditingContact({...editingContact, platforms: newPlatforms})} />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setEditingContact(null); setEditingError(""); }}>取消</Button>
                <Button onClick={saveContact} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Save className="w-4 h-4" /> 儲存資料</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Book className="w-6 h-6 text-indigo-600" /> 通訊錄管理</h2>
            <p className="text-slate-500 mt-1">集中管理常合作的夥伴，發文時可一鍵快速帶入所有跨平台帳號。</p>
          </div>
          <Button onClick={() => setEditingContact({ name: '', role: '攝影', platforms: [{ id: Math.random().toString(36).substr(2, 9), type: 'twitter', handle: '' }] })} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> 新增夥伴
          </Button>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr><th className="px-6 py-4 font-semibold w-1/4">名稱 / 預設定位</th><th className="px-6 py-4 font-semibold w-1/2">已綁定社群帳號</th><th className="px-6 py-4 font-semibold text-right w-1/4">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4"><div className="font-medium text-slate-900 text-base">{c.name}</div><div className="text-xs text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">{c.role}</div></td>
                    <td className="px-6 py-4">
                      {c.platforms && c.platforms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {c.platforms.map(p => {
                            const pDef = getPlatform(p.type);
                            return <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs shadow-sm text-slate-600">{pDef.icon} {p.type === 'custom' && p.customName ? <span className="font-medium mr-1">{p.customName}:</span> : null}{p.handle || <span className="text-slate-400 italic">未填寫</span>}</span>;
                          })}
                        </div>
                      ) : (<span className="text-slate-400 italic">尚未設定任何帳號</span>)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deletingId === c.id ? (
                        <div className="flex justify-end items-center gap-2"><span className="text-xs text-slate-500">確定刪除？</span><Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>取消</Button><Button variant="danger" size="sm" onClick={() => { setContacts(contacts.filter(x => x.id !== c.id)); setDeletingId(null); }}>確認</Button></div>
                      ) : (
                        <div className="space-x-2"><Button variant="secondary" size="sm" onClick={() => setEditingContact(c)}>編輯</Button><Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingId(c.id)}>刪除</Button></div>
                      )}
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-16 text-slate-500"><Users className="w-12 h-12 mx-auto text-slate-200 mb-3" /><p className="text-base font-medium text-slate-700">通訊錄目前是空的</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">🐾 發文神器</h1>
          <nav className="flex gap-2 bg-slate-100/50 p-1 rounded-lg border border-slate-200/60">
            <button onClick={() => setCurrentView('generator')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'generator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>編輯貼文</button>
            <button onClick={() => setCurrentView('contacts')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'contacts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>通訊錄管理</button>
          </nav>
        </div>
      </header>
      <main className="px-4">
        {currentView === 'generator' ? renderGeneratorView() : renderContactsView()}
      </main>
    </div>
  );
}