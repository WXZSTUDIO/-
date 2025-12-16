import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './constants';

// --- Types ---
type EditorTab = 'projects' | 'viewfinder' | 'clapper' | 'apps';
type ProjectMode = 'dashboard' | 'storyboard' | 'plan' | 'callsheet';
type StoryboardMode = 'list' | 'board' | 'presentation';
type PlanMode = 'list' | 'calendar';
type AspectRatio = '16:9' | '2.35:1' | '4:3' | '1:1' | '9:16';

interface Project {
    id: string;
    title: string;
    updatedAt: string;
    aspectRatio: AspectRatio;
    template: string;
}

interface Shot {
    id: string;
    shotNo: string;
    scene: string;
    duration: string;
    content: string;
    notes: string;
    type: string;
    imgUrl?: string;
    isChecked: boolean;
    linkedMedia?: string;
    technical?: string;
}

interface PlanItem {
    id: string;
    date: string;
    content: string;
}

interface CallSheetData {
    scene: string;
    location: string;
    startTime: string;
    shootTime: string;
    crew: { role: string; name: string }[];
}

// --- Icons (Local Wrappers) ---
const UI = {
    ...Icons,
    Grid: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    List: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    Calendar: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Clapper: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M4 11v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V11" /><path d="M20.6 6 3.4 11.5l1.3 4.2 16.6-5.4-1.3-4.3Z"/></svg>,
    FileText: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    Users: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Play: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    MoreVertical: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    CheckCircle: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    Folder: (props: any) => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#F3F4F6"/></svg>,
    Pen: (props: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
    Download: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    Maximize: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2-2h3"/></svg>
};

// --- COMPONENTS ---

// 1. PROJECT MANAGER (PROJECTS TAB)
// Handles Listing and the "Dashboard" for a selected project
const ProjectManager = ({ activeProject, onSelectProject, onBack, onOpenTool }: { activeProject: Project|null, onSelectProject: (p:Project)=>void, onBack: ()=>void, onOpenTool: (m:ProjectMode)=>void }) => {
    // Shared State (Mocked)
    const [projects, setProjects] = useState<Project[]>([
        { id: '1', title: '2023 品牌宣传片', updatedAt: '2小时前', aspectRatio: '16:9', template: 'general' },
        { id: '2', title: '短剧《逆袭》', updatedAt: '昨天', aspectRatio: '9:16', template: 'short' }
    ]);
    const [showModal, setShowModal] = useState(false);
    
    // Create Form
    const [newTitle, setNewTitle] = useState('');
    const [template, setTemplate] = useState('general');
    const [ratio, setRatio] = useState('16:9');

    const handleCreate = () => {
        if(!newTitle) return;
        const newProject: Project = {
            id: Date.now().toString(),
            title: newTitle,
            updatedAt: '刚刚',
            aspectRatio: ratio as AspectRatio,
            template: template
        };
        setProjects([newProject, ...projects]);
        setShowModal(false);
        setNewTitle('');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm('确定要删除这个项目吗？')) {
            setProjects(projects.filter(p => p.id !== id));
            if(activeProject?.id === id) onBack();
        }
    };

    // --- LIST VIEW ---
    if (!activeProject) {
        return (
            <div className="h-full bg-[#F7F8FA] p-6 pb-32 overflow-y-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-8">我的项目</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="aspect-[4/3] bg-white rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-[#FCD34D] hover:bg-yellow-50/50 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#FCD34D] flex items-center justify-center transition-colors">
                            <Icons.Add className="text-gray-500 group-hover:text-black"/>
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">新建项目</span>
                    </button>
                    {projects.map(p => (
                        <div key={p.id} onClick={() => onSelectProject(p)} className="aspect-[4/3] bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-gray-100 relative group">
                             <button onClick={(e) => handleDelete(p.id, e)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full z-10">
                                 <Icons.Trash width={14}/>
                             </button>
                             <div className="flex-1 flex items-center justify-center">
                                 <UI.Folder />
                             </div>
                             <div>
                                 <h3 className="font-bold text-sm text-gray-800 truncate">{p.title}</h3>
                                 <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-400">{p.updatedAt}</p>
                                    <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500 font-mono">{p.aspectRatio}</span>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">新建项目</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><Icons.Close /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">项目名称</label>
                                    <input autoFocus className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:border-[#FCD34D] focus:bg-white outline-none" placeholder="输入项目标题..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">模板</label>
                                        <div className="relative">
                                            <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-[#FCD34D] outline-none">
                                                <option value="general">通用视频</option>
                                                <option value="tvc">TVC 广告</option>
                                                <option value="short">短剧/短片</option>
                                            </select>
                                            <UI.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">画幅</label>
                                        <div className="relative">
                                            <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-[#FCD34D] outline-none">
                                                <option value="16:9">16:9</option>
                                                <option value="9:16">9:16</option>
                                                <option value="2.35:1">2.35:1</option>
                                            </select>
                                            <UI.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">取消</button>
                                <button onClick={handleCreate} className="flex-1 py-3 text-sm font-bold bg-[#FCD34D] hover:bg-[#fbbf24] text-black rounded-lg">立即创建</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DASHBOARD VIEW (Inside Project) ---
    return (
        <div className="h-full bg-[#F7F8FA] flex flex-col">
            <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Icons.Back width={20}/></button>
                    <div>
                        <h1 className="font-bold text-sm truncate max-w-[200px]">{activeProject.title}</h1>
                        <p className="text-[10px] text-gray-400">最后编辑: {activeProject.updatedAt}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><UI.MoreVertical width={20}/></button>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto pb-32">
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => onOpenTool('storyboard')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.Grid width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900">WXZ 分镜</h3>
                             <p className="text-xs text-gray-400 mt-1">管理镜头与画面</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('plan')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.Calendar width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900">拍摄计划</h3>
                             <p className="text-xs text-gray-400 mt-1">日程与统筹</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('callsheet')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group col-span-2">
                         <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.FileText width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900">通告单</h3>
                             <p className="text-xs text-gray-400 mt-1">每日拍摄通知与集合信息</p>
                         </div>
                     </button>
                 </div>
            </div>
        </div>
    );
};

// 2. STORYBOARD TOOL (Inside Project)
const StoryboardView = ({ projectRatio, onBack, shots, setShots }: any) => {
    const [mode, setMode] = useState<StoryboardMode>('list');
    const [aspect, setAspect] = useState<AspectRatio>(projectRatio || '16:9');

    const addShot = () => {
        const newShot = {
            id: Date.now().toString(),
            shotNo: (shots.length + 1).toString(),
            scene: '', duration: '3s', content: '', notes: '', type: 'WS', isChecked: false
        };
        setShots([...shots, newShot]);
    };

    const updateShot = (id: string, field: string, val: string) => {
        setShots(shots.map((s:any) => s.id === id ? { ...s, [field]: val } : s));
    };

    return (
        <div className={`flex flex-col h-full ${mode === 'presentation' ? 'bg-black text-white z-50 fixed inset-0' : 'bg-[#F7F8FA]'}`}>
            {/* Toolbar */}
            <div className={`px-4 py-3 flex items-center justify-between z-20 ${mode === 'presentation' ? 'absolute top-0 w-full hover:bg-black/50' : 'bg-white border-b border-gray-200 sticky top-0'}`}>
                 <div className="flex items-center gap-3">
                     {mode !== 'presentation' && <button onClick={onBack}><Icons.Back width={20}/></button>}
                     <span className="font-bold text-lg">WXZ 分镜</span>
                 </div>
                 <div className="flex items-center gap-2">
                     {mode !== 'presentation' && (
                        <div className="relative">
                            <select value={aspect} onChange={(e)=>setAspect(e.target.value as AspectRatio)} className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold outline-none">
                                <option value="16:9">16:9</option><option value="2.35:1">2.35:1</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option>
                            </select>
                            <UI.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none"/>
                        </div>
                     )}
                     <button onClick={() => setMode(mode === 'presentation' ? 'list' : 'presentation')} className="bg-[#FCD34D] text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        {mode === 'presentation' ? '退出' : <><UI.Play width={14}/> 放映</>}
                     </button>
                 </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-32">
                {mode === 'presentation' ? (
                     <div className="max-w-6xl mx-auto h-full flex items-center justify-center p-4">
                         {/* Simple Presentation Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                             {shots.slice(0,2).map((s:any) => (
                                 <div key={s.id} className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10">
                                     <div className="bg-black/50 w-full relative" style={{aspectRatio: aspect.replace(':','/')}}>
                                          {s.linkedMedia ? <img src={s.linkedMedia} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center text-white/20"><Icons.Video width={48}/></div>}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {shots.map((shot: any) => (
                             <div key={shot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start group hover:border-[#FCD34D] transition-colors">
                                 <div className="font-mono text-gray-400 font-bold pt-1 w-8">#{shot.shotNo}</div>
                                 <div className="w-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-200" style={{aspectRatio: aspect.replace(':','/')}}>
                                      {shot.linkedMedia ? <img src={shot.linkedMedia} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Icons.Video width={20}/></div>}
                                 </div>
                                 <div className="flex-1 min-w-0 space-y-2">
                                     <textarea 
                                        className="w-full bg-transparent outline-none text-sm resize-none h-14 placeholder-gray-300" 
                                        placeholder="画面描述..."
                                        value={shot.content}
                                        onChange={(e) => updateShot(shot.id, 'content', e.target.value)}
                                     />
                                     <div className="flex gap-2">
                                         {/* Native Selects for Mobile */}
                                         <div className="relative">
                                             <select value={shot.type} onChange={e=>updateShot(shot.id, 'type', e.target.value)} className="appearance-none bg-gray-50 border border-gray-100 rounded px-2 py-1 text-xs w-20 outline-none">
                                                 <option value="WS">WS 全景</option><option value="FS">FS 全身</option><option value="MS">MS 中景</option><option value="CU">CU 特写</option><option value="ECU">ECU 大特</option>
                                             </select>
                                         </div>
                                         <div className="relative">
                                             <select value={shot.duration} onChange={e=>updateShot(shot.id, 'duration', e.target.value)} className="appearance-none bg-gray-50 border border-gray-100 rounded px-2 py-1 text-xs w-20 outline-none">
                                                 <option value="1s">1s</option><option value="3s">3s</option><option value="5s">5s</option><option value="10s">10s</option>
                                             </select>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        ))}
                        <button onClick={addShot} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#FCD34D] hover:text-[#FCD34D] font-bold text-sm flex items-center justify-center gap-2">
                             <Icons.Add width={18}/> 添加镜头
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 3. SHOOTING PLAN TOOL
const PlanTool = ({ onBack }: { onBack: ()=>void }) => {
    const [plans, setPlans] = useState<PlanItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newContent, setNewContent] = useState('');

    const addPlan = () => {
        if(!newContent) return;
        setPlans([...plans, { id: Date.now().toString(), date: newDate || '待定', content: newContent }]);
        setShowModal(false);
        setNewContent('');
        setNewDate('');
    };

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA]">
             <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                     <button onClick={onBack}><Icons.Back width={20}/></button>
                     <h2 className="text-lg font-bold">拍摄计划</h2>
                 </div>
                 <div className="flex gap-2">
                     <button className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">同步日历</button>
                     <button onClick={()=>setShowModal(true)} className="bg-[#181818] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">新建</button>
                 </div>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto pb-32">
                 {plans.length === 0 ? (
                     <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                         <UI.Calendar width={48} className="opacity-20"/>
                         <p className="text-sm">暂无计划</p>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         {plans.map(p => (
                             <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                                 <div className="bg-gray-100 rounded px-2 py-1 h-fit text-center min-w-[60px]">
                                     <div className="text-[10px] text-gray-400">DATE</div>
                                     <div className="text-sm font-bold">{p.date}</div>
                                 </div>
                                 <div className="flex-1 text-sm font-medium text-gray-800">{p.content}</div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>

             {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">新建计划</h3>
                        <div className="space-y-4">
                            <input type="date" className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm" value={newDate} onChange={e=>setNewDate(e.target.value)} />
                            <textarea className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm h-24" placeholder="拍摄内容..." value={newContent} onChange={e=>setNewContent(e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={()=>setShowModal(false)} className="flex-1 py-2 text-gray-500 font-bold bg-gray-50 rounded-lg">取消</button>
                            <button onClick={addPlan} className="flex-1 py-2 bg-[#FCD34D] text-black font-bold rounded-lg">添加</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

// 4. CALL SHEET TOOL
const CallSheetTool = ({ onBack }: { onBack: ()=>void }) => {
    const [data, setData] = useState<CallSheetData>({
        scene: '23A, 24B', location: '创意产业园 A座', startTime: '06:30', shootTime: '08:00', crew: [{role: 'Director', name: 'WXZ'}, {role: 'DOP', name: 'Alex'}]
    });

    return (
        <div className="h-full bg-[#F7F8FA] flex flex-col">
             <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10">
                 <button onClick={onBack}><Icons.Back width={20}/></button>
                 <h2 className="text-lg font-bold">通告单编辑</h2>
             </div>
             <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-32 flex justify-center">
                 <div className="w-full max-w-xl bg-white shadow-sm border border-gray-200 p-8">
                     <div className="border-b-4 border-black pb-4 mb-6">
                         <h1 className="text-3xl font-black uppercase">Call Sheet</h1>
                         <div className="text-gray-400 text-xs font-bold mt-1">NO. 12</div>
                     </div>
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-gray-400 uppercase">集合时间</label>
                                 <input className="w-full border-b border-gray-200 py-1 font-bold outline-none focus:border-[#FCD34D]" value={data.startTime} onChange={e=>setData({...data, startTime: e.target.value})} />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-gray-400 uppercase">开机时间</label>
                                 <input className="w-full border-b border-gray-200 py-1 font-bold outline-none focus:border-[#FCD34D]" value={data.shootTime} onChange={e=>setData({...data, shootTime: e.target.value})} />
                             </div>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">拍摄地点</label>
                             <input className="w-full border-b border-gray-200 py-1 font-bold outline-none focus:border-[#FCD34D]" value={data.location} onChange={e=>setData({...data, location: e.target.value})} />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase">场次</label>
                             <input className="w-full border-b border-gray-200 py-1 font-bold outline-none focus:border-[#FCD34D]" value={data.scene} onChange={e=>setData({...data, scene: e.target.value})} />
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// 5. CLAPPER VIEW (Global Tool)
const ClapperView = () => {
    const [running, setRunning] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval: any;
        if (running) {
            interval = setInterval(() => setTime(t => t + 10), 10);
        }
        return () => clearInterval(interval);
    }, [running]);

    const formatTime = (ms: number) => {
        const date = new Date(ms);
        return date.toISOString().substr(11, 11);
    };

    return (
        <div className="h-full bg-[#202020] flex flex-col items-center justify-center p-4 pb-24">
             <div 
                className="w-full max-w-md aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col relative select-none cursor-pointer"
                onClick={() => setRunning(!running)}
            >
                 <div className="h-14 bg-white border-b-4 border-black flex relative z-10">
                     {Array.from({length: 8}).map((_,i) => (
                         <div key={i} className="flex-1 border-r border-black transform -skew-x-12 bg-black/10 even:bg-transparent origin-bottom"></div>
                     ))}
                 </div>
                 <div className="flex-1 bg-white p-4 flex flex-col justify-between">
                     <div className="grid grid-cols-3 gap-0 border-4 border-black h-24">
                         <div className="border-r-4 border-black flex flex-col items-center justify-center"><span className="text-[10px] font-black text-gray-400">SCENE</span><span className="text-3xl font-black">24A</span></div>
                         <div className="border-r-4 border-black flex flex-col items-center justify-center"><span className="text-[10px] font-black text-gray-400">TAKE</span><span className="text-3xl font-black">3</span></div>
                         <div className="flex flex-col items-center justify-center"><span className="text-[10px] font-black text-gray-400">ROLL</span><span className="text-3xl font-black">A01</span></div>
                     </div>
                     <div className="flex justify-between items-end px-2">
                         <div className="text-xs font-bold text-gray-400">WXZ Studio</div>
                         <div className="font-mono text-4xl font-black text-red-600 tracking-widest">{formatTime(time)}</div>
                     </div>
                 </div>
                 {!running && <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none"><span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">Tap to Start</span></div>}
             </div>
        </div>
    );
};

// 6. MORE APPS VIEW
const MoreAppsView = () => {
    const tools = [
        { id: 'food', label: '今天吃什么', icon: UI.Food, color: 'bg-orange-100 text-orange-600' },
        { id: 'calc', label: '计算器', icon: UI.Calculator, color: 'bg-gray-100 text-gray-600' },
        { id: 'level', label: '水平仪', icon: UI.Level, color: 'bg-blue-100 text-blue-600' },
        { id: 'compass', label: '指南针', icon: UI.Compass, color: 'bg-red-100 text-red-600' },
    ];

    const [modal, setModal] = useState<{title:string, content:React.ReactNode}|null>(null);

    const openTool = (id: string) => {
        if(id === 'food') {
            const foods = ['牛肉面', '麻辣烫', '沙拉', '汉堡', '盖饭', '饺子'];
            setModal({
                title: '今天吃什么',
                content: <div className="text-center py-8"><h2 className="text-4xl font-bold animate-pulse">{foods[Math.floor(Math.random()*foods.length)]}</h2></div>
            });
        } else {
            setModal({ title: '提示', content: <div className="p-4 text-center">功能开发中...</div> });
        }
    };

    return (
        <div className="h-full bg-[#F7F8FA] p-6 pb-32 overflow-y-auto">
            <h1 className="text-2xl font-black text-gray-900 mb-8">更多应用</h1>
            
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">实用工具</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tools.map(tool => (
                        <button key={tool.id} onClick={()=>openTool(tool.id)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 hover:border-[#FCD34D] transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                                <tool.icon width={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">关于</h3>
                <div className="space-y-3">
                    <button className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center"><UI.Heart width={16}/></div>
                        <span className="text-sm font-bold">感谢作者</span>
                    </button>
                    <button className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><UI.Link width={16}/></div>
                        <span className="text-sm font-bold">访问官网</span>
                    </button>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{modal.title}</h3>
                        {modal.content}
                        <button onClick={()=>setModal(null)} className="w-full mt-6 py-2 bg-gray-100 rounded-lg font-bold">关闭</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. VIEWFINDER VIEW (Kept largely the same, optimized for context)
const ViewfinderView = ({ onLinkMedia }: { onLinkMedia: (url: string, meta: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    
    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
            .catch(console.error);
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white pb-[80px]">
            <div className="absolute top-4 left-4 z-20 bg-black/50 px-2 py-1 rounded text-xs font-mono text-green-400">STBY • 4K</div>
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                 <div className="absolute inset-0 border-[40px] border-black/80 pointer-events-none" style={{borderTopWidth: '60px', borderBottomWidth: '60px'}}></div>
                 <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none"><div className="border border-white/50 col-start-2 row-start-2"></div></div>
            </div>
            <div className="h-32 bg-black/90 flex items-center justify-center relative z-20">
                <button 
                   onClick={() => { setIsRecording(true); setTimeout(() => { setIsRecording(false); onLinkMedia("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4", "24mm | ISO 800"); }, 500); }}
                   className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-transparent'}`}
                >
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
            </div>
        </div>
    );
};

// --- MAIN NAV BAR ---
const MainNavBar = ({ active, onChange }: { active: EditorTab; onChange: (t: EditorTab) => void }) => {
    const tabs: { id: EditorTab; icon: React.FC<any>; label: string }[] = [
        { id: 'projects', icon: UI.Folder, label: '我的项目' },
        { id: 'viewfinder', icon: UI.Viewfinder, label: '取景器' },
        { id: 'clapper', icon: UI.Clapper, label: '场记板' },
        { id: 'apps', icon: Icons.Apps, label: '更多' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe z-50">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center justify-center gap-1 w-full h-full active:scale-95 transition-transform">
                        <div className={`h-8 w-14 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-black text-[#FCD34D]' : 'text-gray-400'}`}>
                            <t.icon width={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>{t.label}</span>
                    </button>
                )
            })}
        </div>
    );
};

// --- APP ROOT ---
const App: React.FC = () => {
    const [editorTab, setEditorTab] = useState<EditorTab>('projects');
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [projectMode, setProjectMode] = useState<ProjectMode>('dashboard');
    
    // Shared Data
    const [shots, setShots] = useState<Shot[]>([{ id: '1', shotNo: '1', scene: '1', duration: '5s', content: '男主走进房间', notes: '', type: 'WS', isChecked: false, technical: '24mm' }]);

    // Nav Helpers
    const handleSelectProject = (p: Project) => {
        setActiveProject(p);
        setProjectMode('dashboard');
    };

    const handleBackToProjects = () => {
        setActiveProject(null);
    };

    const handleBackToDashboard = () => {
        setProjectMode('dashboard');
    };

    const handleOpenTool = (mode: ProjectMode) => {
        setProjectMode(mode);
    };

    // Render Content based on current state
    const renderContent = () => {
        if (editorTab === 'viewfinder') return <ViewfinderView onLinkMedia={(url, meta) => alert(`Media Captured: ${meta}`)} />;
        if (editorTab === 'clapper') return <ClapperView />;
        if (editorTab === 'apps') return <MoreAppsView />;
        
        // Projects Tab Logic
        if (!activeProject) {
            return <ProjectManager activeProject={null} onSelectProject={handleSelectProject} onBack={()=>{}} onOpenTool={()=>{}} />;
        }

        // Inside a Project
        switch (projectMode) {
            case 'storyboard':
                return <StoryboardView projectRatio={activeProject.aspectRatio} onBack={handleBackToDashboard} shots={shots} setShots={setShots} />;
            case 'plan':
                return <PlanTool onBack={handleBackToDashboard} />;
            case 'callsheet':
                return <CallSheetTool onBack={handleBackToDashboard} />;
            default:
                return <ProjectManager activeProject={activeProject} onSelectProject={()=>{}} onBack={handleBackToProjects} onOpenTool={handleOpenTool} />;
        }
    };

    return (
        <div className="h-screen w-full bg-white text-[#333] flex flex-col font-sans">
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>
            <MainNavBar active={editorTab} onChange={setEditorTab} />
        </div>
    );
};

export default App;