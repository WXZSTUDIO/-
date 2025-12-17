import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './constants';

// --- Types ---
type EditorTab = 'projects' | 'viewfinder' | 'clapper' | 'apps';
type ProjectMode = 'dashboard' | 'storyboard' | 'plan' | 'callsheet';
type StoryboardMode = 'list' | 'board' | 'presentation';
type PlanMode = 'list' | 'calendar';
type AspectRatio = '16:9' | '2.35:1' | '4:3' | '1:1' | '9:16';
type Resolution = '1080p' | '4k';
type FrameRate = 30 | 60;

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
    production: string;
    date: string;
    location: string;
    weather: string;
    nearestHospital: string;
    callTime: string;
    shootTime: string;
    wrapTime: string;
    crew: string;
    cast: string;
    notes: string;
}

declare global {
    interface Window {
        html2canvas: any;
        DeviceOrientationEvent: any;
    }
}

// --- Icons (Local Wrappers with Dark Mode Defaults) ---
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
    Folder: (props: any) => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    Pen: (props: any) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
    Download: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    Maximize: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2-2h3"/></svg>,
    Power: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>,
    Next: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>,
    ChevronRight: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>
};

// --- COMPONENTS ---

// 1. PROJECT MANAGER
interface ProjectManagerProps {
    activeProject: Project | null;
    projects: Project[];
    setProjects: (p: Project[]) => void;
    onSelectProject: (p: Project) => void;
    onBack: () => void;
    onOpenTool: (m: ProjectMode) => void;
}

const ProjectManager = ({ activeProject, projects, setProjects, onSelectProject, onBack, onOpenTool }: ProjectManagerProps) => {
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
            <div className="h-full bg-[#09090b] text-white p-6 pb-36 overflow-y-auto font-sans">
                <h1 className="text-2xl font-black text-white mb-8 tracking-tight">我的项目</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="aspect-[4/3] bg-[#18181b] rounded-2xl flex flex-col items-center justify-center gap-3 border border-dashed border-white/20 hover:border-[#FCD34D] hover:bg-white/5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#FCD34D] flex items-center justify-center transition-colors">
                            <Icons.Add className="text-white/50 group-hover:text-black"/>
                        </div>
                        <span className="text-xs font-bold text-white/50 group-hover:text-white">新建项目</span>
                    </button>
                    {projects.map(p => (
                        <div key={p.id} onClick={() => onSelectProject(p)} className="aspect-[4/3] bg-[#18181b] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between border border-white/5 hover:border-[#FCD34D]/50 relative group">
                             <button onClick={(e) => handleDelete(p.id, e)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-full z-10">
                                 <Icons.Trash width={14}/>
                             </button>
                             <div className="flex-1 flex items-center justify-center text-white/20 group-hover:text-[#FCD34D] transition-colors">
                                 <UI.Folder />
                             </div>
                             <div>
                                 <h3 className="font-bold text-sm text-gray-200 truncate">{p.title}</h3>
                                 <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-500">{p.updatedAt}</p>
                                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400 font-mono">{p.aspectRatio}</span>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#18181b] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 animate-[slideUp_0.3s_ease-out]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">新建项目</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><Icons.Close /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5">项目名称</label>
                                    <input autoFocus className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-[#FCD34D] outline-none" placeholder="输入项目标题..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5">模板</label>
                                        <div className="relative">
                                            <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full appearance-none bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:border-[#FCD34D] outline-none">
                                                <option value="general">通用视频</option>
                                                <option value="tvc">TVC 广告</option>
                                                <option value="short">短剧/短片</option>
                                            </select>
                                            <UI.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5">画幅</label>
                                        <div className="relative">
                                            <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full appearance-none bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:border-[#FCD34D] outline-none">
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
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-white/5 rounded-lg">取消</button>
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
        <div className="h-full bg-[#09090b] flex flex-col font-sans text-white">
            <header className="h-14 bg-[#18181b] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Icons.Back width={20}/></button>
                    <div>
                        <h1 className="font-bold text-sm truncate max-w-[200px] text-white">{activeProject.title}</h1>
                        <p className="text-[10px] text-gray-500">最后编辑: {activeProject.updatedAt}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full text-gray-400"><UI.MoreVertical width={20}/></button>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto pb-36">
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => onOpenTool('storyboard')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.Grid width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">WXZ 分镜</h3>
                             <p className="text-xs text-gray-500 mt-1">管理镜头与画面</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('plan')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.Calendar width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">拍摄计划</h3>
                             <p className="text-xs text-gray-500 mt-1">日程与统筹</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('callsheet')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group col-span-2">
                         <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <UI.FileText width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">通告单</h3>
                             <p className="text-xs text-gray-500 mt-1">每日拍摄通知与集合信息</p>
                         </div>
                     </button>
                 </div>
            </div>
        </div>
    );
};

// 2. STORYBOARD TOOL
const StoryboardView = ({ projectRatio, onBack, shots, setShots }: any) => {
    const [mode, setMode] = useState<StoryboardMode>('list');
    const [aspect, setAspect] = useState<AspectRatio>(projectRatio || '16:9');
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');

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

    const handleImport = () => {
        if (!importText.trim()) return;

        const lines = importText.trim().split('\n').filter(l => l.trim());
        const newShots: Shot[] = lines.map((line, idx) => {
            // Intelligent Parsing Logic
            let parts: string[] = [];
            
            // 1. Try Tab (Most reliable for Excel copy-paste)
            if (line.includes('\t')) {
                parts = line.split('\t');
            } else {
                // 2. Try Pipe (Common text format)
                if (line.includes('|')) {
                     parts = line.split('|');
                } else {
                     // 3. Fallback: Comma/Space
                     // Normalize Chinese comma
                     const normalized = line.replace(/，/g, ',');
                     const rawParts = normalized.split(',').map(s => s.trim()).filter(s => s);
                     
                     if (rawParts.length === 0) {
                         // Fallback to space split if comma split failed
                         parts = line.split(/\s+/).map(s => s.trim());
                     } else if (rawParts.length <= 4) {
                         // Simple CSV structure
                         parts = rawParts;
                     } else {
                         // Complex logic ...
                         parts = rawParts;
                     }
                }
            }
            
            parts = parts.map(p => p.trim());

            let scene = '';
            let shotNo = '';
            let content = '';
            let type = 'WS';

            if (parts.length === 1) {
                content = parts[0];
            } else if (parts.length === 2) {
                shotNo = parts[0];
                content = parts[1];
            } else if (parts.length >= 3) {
                scene = parts[0];
                shotNo = parts[1];
                content = parts.slice(2).join(' '); // Join remainder
            }

            // Defaults
            if (!shotNo) shotNo = (shots.length + 1 + idx).toString();
            if (!content) content = '导入内容';

            return {
                id: Date.now().toString() + idx,
                shotNo: shotNo,
                scene: scene,
                duration: '3s',
                content: content,
                notes: '',
                type: type,
                isChecked: false
            };
        });

        if (newShots.length > 0) {
            setShots([...shots, ...newShots]);
            setShowImport(false);
            setImportText('');
        }
    };

    return (
        <div className={`flex flex-col h-full font-sans ${mode === 'presentation' ? 'bg-black text-white z-50 fixed inset-0' : 'bg-[#09090b] text-white'}`}>
            {/* Toolbar */}
            <div className={`px-4 py-3 flex items-center justify-between z-20 ${mode === 'presentation' ? 'absolute top-0 w-full hover:bg-black/50' : 'bg-[#18181b] border-b border-white/10 sticky top-0'}`}>
                 <div className="flex items-center gap-3">
                     {mode !== 'presentation' && <button onClick={onBack} className="text-gray-400 hover:text-white"><Icons.Back width={20}/></button>}
                     <span className="font-bold text-lg">WXZ 分镜</span>
                 </div>
                 <div className="flex items-center gap-2">
                     {mode !== 'presentation' && (
                        <>
                            <button onClick={()=>setShowImport(true)} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-gray-300">导入脚本</button>
                            <div className="relative">
                                <select value={aspect} onChange={(e)=>setAspect(e.target.value as AspectRatio)} className="appearance-none bg-[#27272a] border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold outline-none text-white focus:border-[#FCD34D]">
                                    <option value="16:9">16:9</option><option value="2.35:1">2.35:1</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option>
                                </select>
                                <UI.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none"/>
                            </div>
                        </>
                     )}
                     <button onClick={() => setMode(mode === 'presentation' ? 'list' : 'presentation')} className="bg-[#FCD34D] text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        {mode === 'presentation' ? '退出' : <><UI.Play width={14}/> 放映</>}
                     </button>
                 </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-36">
                {mode === 'presentation' ? (
                     <div className="max-w-6xl mx-auto h-full flex items-center justify-center p-4">
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
                             <div key={shot.id} className="bg-[#18181b] rounded-xl shadow-sm border border-white/5 p-4 flex gap-4 items-start group hover:border-[#FCD34D] transition-colors">
                                 <div className="font-mono text-[#FCD34D] font-bold pt-1 w-8">#{shot.shotNo}</div>
                                 <div className="w-24 bg-black/40 rounded-lg flex-shrink-0 relative overflow-hidden border border-white/5" style={{aspectRatio: aspect.replace(':','/')}}>
                                      {shot.linkedMedia ? <img src={shot.linkedMedia} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center text-white/10"><Icons.Video width={20}/></div>}
                                 </div>
                                 <div className="flex-1 min-w-0 space-y-2">
                                     <textarea 
                                        className="w-full bg-transparent outline-none text-sm resize-none h-14 placeholder-gray-500 text-gray-200" 
                                        placeholder="画面描述..."
                                        value={shot.content}
                                        onChange={(e) => updateShot(shot.id, 'content', e.target.value)}
                                     />
                                     <div className="flex gap-2">
                                         <div className="relative">
                                             <select value={shot.type} onChange={e=>updateShot(shot.id, 'type', e.target.value)} className="appearance-none bg-[#27272a] border border-white/10 rounded px-2 py-1 text-xs w-20 outline-none text-gray-300">
                                                 <option value="WS">WS 全景</option><option value="FS">FS 全身</option><option value="MS">MS 中景</option><option value="CU">CU 特写</option><option value="ECU">ECU 大特</option>
                                             </select>
                                         </div>
                                         <div className="relative">
                                             <select value={shot.duration} onChange={e=>updateShot(shot.id, 'duration', e.target.value)} className="appearance-none bg-[#27272a] border border-white/10 rounded px-2 py-1 text-xs w-20 outline-none text-gray-300">
                                                 <option value="1s">1s</option><option value="3s">3s</option><option value="5s">5s</option><option value="10s">10s</option>
                                             </select>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        ))}
                        <button onClick={addShot} className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-gray-500 hover:border-[#FCD34D] hover:text-[#FCD34D] font-bold text-sm flex items-center justify-center gap-2 transition-all">
                             <Icons.Add width={18}/> 添加镜头
                        </button>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showImport && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-[#18181b] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/10">
                         <h3 className="text-lg font-bold mb-4 text-white">导入脚本 (表格格式)</h3>
                         <p className="text-xs text-gray-400 mb-2">支持从 Excel/WPS 直接复制粘贴。智能识别格式：[场号] [镜号] [内容] [景别]</p>
                         <textarea 
                            className="w-full h-48 bg-[#27272a] border border-white/10 rounded-lg p-3 text-xs font-mono mb-4 text-white placeholder-gray-500" 
                            placeholder={"1\t1A\t主角入画\tWS\n或\n1, 1A, 主角回头, CU"}
                            value={importText}
                            onChange={e=>setImportText(e.target.value)}
                         />
                         <div className="flex gap-3">
                             <button onClick={()=>setShowImport(false)} className="flex-1 py-2 text-gray-400 font-bold bg-white/5 rounded-lg">取消</button>
                             <button onClick={handleImport} className="flex-1 py-2 bg-[#FCD34D] text-black font-bold rounded-lg">识别并导入</button>
                         </div>
                     </div>
                 </div>
            )}
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
        <div className="flex flex-col h-full bg-[#09090b] text-white font-sans">
             <div className="bg-[#18181b] px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><Icons.Back width={20}/></button>
                     <h2 className="text-lg font-bold">拍摄计划</h2>
                 </div>
                 <div className="flex gap-2">
                     <button className="text-xs font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">同步日历</button>
                     <button onClick={()=>setShowModal(true)} className="bg-[#FCD34D] text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">新建</button>
                 </div>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto pb-36">
                 {plans.length === 0 ? (
                     <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
                         <UI.Calendar width={48} className="opacity-20"/>
                         <p className="text-sm">暂无计划</p>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         {plans.map(p => (
                             <div key={p.id} className="bg-[#18181b] p-4 rounded-xl border border-white/5 shadow-sm flex gap-4">
                                 <div className="bg-white/5 rounded px-2 py-1 h-fit text-center min-w-[60px]">
                                     <div className="text-[10px] text-gray-500">DATE</div>
                                     <div className="text-sm font-bold text-[#FCD34D]">{p.date}</div>
                                 </div>
                                 <div className="flex-1 text-sm font-medium text-gray-200">{p.content}</div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>

             {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#18181b] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-white/10">
                        <h3 className="text-lg font-bold mb-4 text-white">新建计划</h3>
                        <div className="space-y-4">
                            <input type="date" className="w-full bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={newDate} onChange={e=>setNewDate(e.target.value)} />
                            <textarea className="w-full bg-[#27272a] border border-white/10 rounded-lg px-3 py-2 text-sm h-24 text-white placeholder-gray-500" placeholder="拍摄内容..." value={newContent} onChange={e=>setNewContent(e.target.value)} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={()=>setShowModal(false)} className="flex-1 py-2 text-gray-400 font-bold bg-white/5 rounded-lg">取消</button>
                            <button onClick={addPlan} className="flex-1 py-2 bg-[#FCD34D] text-black font-bold rounded-lg">添加</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

// 4. CALL SHEET TOOL (Dark UI, White Preview)
const CallSheetTool = ({ onBack }: { onBack: ()=>void }) => {
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const previewRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<CallSheetData>({
        production: '',
        date: '',
        location: '',
        weather: '',
        nearestHospital: '',
        callTime: '',
        shootTime: '',
        wrapTime: '',
        crew: '',
        cast: '',
        notes: ''
    });

    const handleDownload = () => {
        if (previewRef.current && window.html2canvas) {
            window.html2canvas(previewRef.current, { useCORS: true, scale: 2 }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `CallSheet_${data.date}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        } else {
            alert("正在初始化图片生成组件，请稍后再试...");
        }
    };

    return (
        <div className="h-full bg-[#09090b] text-white flex flex-col font-sans">
             {/* Header */}
             <div className="bg-[#18181b] px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><Icons.Back width={20}/></button>
                     <h2 className="text-lg font-bold">拍摄通告</h2>
                 </div>
                 <div className="flex gap-2">
                     {mode === 'edit' ? (
                         <button onClick={()=>setMode('preview')} className="bg-[#FCD34D] text-black px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">预览</button>
                     ) : (
                         <>
                            <button onClick={()=>setMode('edit')} className="bg-white/10 text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold">编辑</button>
                            <button onClick={handleDownload} className="bg-[#FCD34D] text-black px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><UI.Download width={14}/> 保存图片</button>
                         </>
                     )}
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto pb-36 p-4">
                 {mode === 'edit' ? (
                     <div className="max-w-xl mx-auto space-y-6">
                         <div className="bg-[#18181b] p-6 rounded-2xl shadow-sm border border-white/5">
                             <h3 className="text-xs font-bold text-[#FCD34D] uppercase mb-4 tracking-wider">基础信息</h3>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">通告标题</label>
                                     <input className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold outline-none text-white focus:border-[#FCD34D]" value={data.production} onChange={e=>setData({...data, production: e.target.value})} />
                                 </div>
                                 
                                 {/* Date Row */}
                                 <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5">拍摄日期</label>
                                      <input type="date" className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold outline-none text-white focus:border-[#FCD34D]" value={data.date} onChange={e=>setData({...data, date: e.target.value})} />
                                 </div>

                                 {/* Times Row - 3 columns */}
                                 <div className="grid grid-cols-3 gap-3">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1.5">集合时间</label>
                                         <input type="time" className="w-full bg-[#27272a] border border-white/10 rounded-lg px-2 py-3 text-sm font-bold outline-none text-center text-white focus:border-[#FCD34D]" value={data.callTime} onChange={e=>setData({...data, callTime: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1.5">开机时间</label>
                                         <input type="time" className="w-full bg-[#27272a] border border-white/10 rounded-lg px-2 py-3 text-sm font-bold outline-none text-center text-white focus:border-[#FCD34D]" value={data.shootTime} onChange={e=>setData({...data, shootTime: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1.5">收工时间</label>
                                         <input type="time" className="w-full bg-[#27272a] border border-white/10 rounded-lg px-2 py-3 text-sm font-bold outline-none text-center text-white focus:border-[#FCD34D]" value={data.wrapTime} onChange={e=>setData({...data, wrapTime: e.target.value})} />
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">拍摄地点</label>
                                     <input className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold outline-none text-white focus:border-[#FCD34D]" value={data.location} onChange={e=>setData({...data, location: e.target.value})} />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">天气</label>
                                     <input className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold outline-none text-white focus:border-[#FCD34D]" value={data.weather} onChange={e=>setData({...data, weather: e.target.value})} />
                                 </div>
                                 <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5">最近医院</label>
                                      <input className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold outline-none text-white focus:border-[#FCD34D]" value={data.nearestHospital} onChange={e=>setData({...data, nearestHospital: e.target.value})} />
                                 </div>
                             </div>
                         </div>
                         
                         <div className="bg-[#18181b] p-6 rounded-2xl shadow-sm border border-white/5">
                             <h3 className="text-xs font-bold text-[#FCD34D] uppercase mb-4 tracking-wider">人员与备注</h3>
                             <div className="space-y-4">
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">演职人员</label>
                                     <textarea className="w-full h-24 bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium outline-none text-white focus:border-[#FCD34D]" value={data.crew} onChange={e=>setData({...data, crew: e.target.value})} />
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">备注</label>
                                     <textarea className="w-full h-24 bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium outline-none text-white focus:border-[#FCD34D]" value={data.notes} onChange={e=>setData({...data, notes: e.target.value})} />
                                </div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="flex justify-center">
                         {/* Preview stays white for printing purposes */}
                         <div ref={previewRef} className="bg-white w-full max-w-lg shadow-2xl p-8 text-[#333]">
                             <div className="border-b-4 border-black pb-6 mb-6 flex justify-between items-end">
                                 <div>
                                     <h1 className="text-3xl font-black uppercase tracking-tight">CALL SHEET</h1>
                                     <div className="text-sm font-bold mt-2 text-gray-500">{data.production}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-xs font-bold bg-black text-white px-2 py-1 mb-1">DATE</div>
                                     <div className="text-xl font-mono font-bold">{data.date}</div>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                 <div className="text-center border-r border-gray-200">
                                     <div className="text-[10px] font-bold text-gray-400 mb-1">CALL TIME</div>
                                     <div className="text-lg font-black">{data.callTime}</div>
                                 </div>
                                 <div className="text-center border-r border-gray-200">
                                     <div className="text-[10px] font-bold text-gray-400 mb-1">SHOOT</div>
                                     <div className="text-lg font-black">{data.shootTime}</div>
                                 </div>
                                 <div className="text-center">
                                     <div className="text-[10px] font-bold text-gray-400 mb-1">WRAP (EST)</div>
                                     <div className="text-lg font-black">{data.wrapTime}</div>
                                 </div>
                             </div>

                             <div className="space-y-6">
                                 <div className="flex gap-4 border-b border-gray-100 pb-4">
                                     <div className="w-8 flex justify-center pt-1"><UI.Globe width={20} className="text-gray-400"/></div>
                                     <div>
                                         <div className="text-xs font-bold text-gray-400 mb-1">LOCATION</div>
                                         <div className="font-bold">{data.location}</div>
                                         <div className="text-xs text-gray-500 mt-1">Nearest Hospital: {data.nearestHospital}</div>
                                     </div>
                                 </div>
                                 <div className="flex gap-4 border-b border-gray-100 pb-4">
                                     <div className="w-8 flex justify-center pt-1"><UI.Sun width={20} className="text-gray-400"/></div>
                                     <div>
                                         <div className="text-xs font-bold text-gray-400 mb-1">WEATHER</div>
                                         <div className="font-bold">{data.weather}</div>
                                     </div>
                                 </div>
                                 <div className="flex gap-4 border-b border-gray-100 pb-4">
                                     <div className="w-8 flex justify-center pt-1"><UI.Users width={20} className="text-gray-400"/></div>
                                     <div>
                                         <div className="text-xs font-bold text-gray-400 mb-1">CREW & CAST</div>
                                         <div className="text-sm whitespace-pre-wrap">{data.crew}</div>
                                         <div className="text-sm whitespace-pre-wrap mt-2 text-gray-600">{data.cast}</div>
                                     </div>
                                 </div>
                                 <div className="flex gap-4">
                                     <div className="w-8 flex justify-center pt-1"><UI.Info width={20} className="text-gray-400"/></div>
                                     <div>
                                         <div className="text-xs font-bold text-gray-400 mb-1">NOTES</div>
                                         <div className="text-sm italic text-gray-600 bg-yellow-50 p-2 rounded">{data.notes}</div>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="mt-12 text-center text-[10px] text-gray-300 font-bold tracking-widest uppercase">
                                 Generated by WXZ Studio
                             </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
};

// 5. CLAPPER VIEW (UPDATED ANIMATION & BUTTONS & DEFAULTS)
// Helper for numeric inputs with arrows
const NumberInput = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
    const handleInc = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange((parseInt(value || '1') + 1).toString());
    }
    const handleDec = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(Math.max(1, parseInt(value || '1') - 1).toString());
    }
    return (
        <div className="bg-white p-4 h-28 flex flex-col justify-center relative group active:bg-gray-50 transition-colors cursor-pointer select-none">
             {/* Always visible on hover or touch compatible */}
             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                 <button onClick={handleInc} className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-black shadow-sm"><UI.ChevronDown className="rotate-180 w-4 h-4"/></button>
                 <button onClick={handleDec} className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-black shadow-sm"><UI.ChevronDown className="w-4 h-4"/></button>
             </div>
             <input 
                className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1 text-center pointer-events-none"
                value={value}
                readOnly
             />
             <div className="text-[10px] font-bold text-gray-400 uppercase text-center">{label}</div>
        </div>
    )
}

const ClapperView = ({ onBack, projects }: { onBack: ()=>void, projects: Project[] }) => {
    // Helper for today's date
    const getToday = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}.${m}.${day}`;
    };

    // Clapper State
    const [slate, setSlate] = useState({
        roll: '1',
        scene: '1',
        shot: '1',
        take: '1',
        camera: 'A',
        director: 'WXZ',
        prodTitle: projects.length > 0 ? projects[0].title : (projects.length === 0 ? '无项目' : ''),
        date: getToday()
    });
    
    const [isClapped, setIsClapped] = useState(false);
    const [showProjectSelect, setShowProjectSelect] = useState(false);

    const handleClap = () => {
        setIsClapped(true);
        setTimeout(() => {
            setIsClapped(false);
            setSlate(prev => ({
                ...prev,
                take: (parseInt(prev.take) + 1).toString()
            }));
        }, 300); 
    };

    const handleNextShot = () => {
        const nextShot = (parseInt(slate.shot) + 1).toString();
        setSlate({...slate, shot: nextShot, take: '1'});
    };

    return (
        <div className="h-full bg-[#09090b] flex flex-col items-center justify-between font-sans relative">
             
             {/* Clapperboard Container */}
             <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4">
                {/* Relative Wrapper for Card + Overlay */}
                <div className="w-full bg-white rounded-2xl shadow-2xl shadow-black/50 border border-gray-800 relative select-none z-20 overflow-hidden">
                     
                     {/* Overlay Menu - Now Sibling to Content to cover padding */}
                     {showProjectSelect && (
                         <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-[fadeIn_0.2s_ease-out]">
                             <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                 <span className="font-bold text-gray-500 text-xs uppercase tracking-wider">选择项目</span>
                                 <button onClick={() => setShowProjectSelect(false)} className="p-2 hover:bg-gray-100 rounded-full"><Icons.Close className="text-gray-400" width={20}/></button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                 {projects.map(p => (
                                     <button 
                                        key={p.id} 
                                        onClick={() => { setSlate({...slate, prodTitle: p.title}); setShowProjectSelect(false); }}
                                        className="w-full text-left p-4 rounded-lg hover:bg-yellow-50 font-bold text-sm text-gray-800 border-b border-gray-50 flex justify-between items-center group"
                                     >
                                        <span>{p.title}</span>
                                        {slate.prodTitle === p.title && <Icons.Check width={16} className="text-[#FCD34D]" />}
                                     </button>
                                 ))}
                                 {projects.length === 0 && <div className="text-center text-gray-400 text-xs py-8">暂无项目，请先创建</div>}
                             </div>
                         </div>
                     )}

                     {/* 1. Header Stripe (Animated) */}
                     <div 
                        className={`h-24 bg-[#1A1A1A] relative flex items-center overflow-hidden rounded-t-2xl origin-bottom-left transition-transform duration-150 ease-in ${isClapped ? 'rotate-[-12deg]' : 'rotate-0'}`}
                        style={{ transformOrigin: '0% 100%' }}
                     >
                         {/* Decorative dots left */}
                         <div className="absolute left-4 flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-white/20"></div>
                             <div className="w-3 h-3 rounded-full bg-white"></div>
                         </div>
                         
                         {/* Chevrons */}
                         <div className="w-full flex justify-end">
                             <div className="h-24 w-20 bg-[#FCD34D] transform -skew-x-[30deg] translate-x-4"></div>
                             <div className="h-24 w-20 bg-white transform -skew-x-[30deg] translate-x-4"></div>
                         </div>
                     </div>

                     {/* 2. Main Content */}
                     <div className="p-6 relative">
                         {/* Production Title - Click to Open Overlay */}
                         <div className="mb-6 border-b border-gray-100 pb-4 relative z-10">
                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">片名 PRODUCTION</div>
                             <button 
                                onClick={() => setShowProjectSelect(true)}
                                className="w-full text-left flex items-center justify-between group"
                             >
                                <span className={`text-3xl font-black truncate ${slate.prodTitle && slate.prodTitle !== '无项目' ? 'text-[#1A1A1A]' : 'text-gray-300'}`}>
                                    {slate.prodTitle || '点击选择项目'}
                                </span>
                                <UI.ChevronDown width={24} className="text-gray-300 group-hover:text-[#FCD34D] transition-colors"/>
                             </button>
                         </div>

                         {/* Grid - Row 1: Roll & Scene */}
                         <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 mb-px relative z-10">
                             <NumberInput label="ROLL 卷号" value={slate.roll} onChange={(v)=>setSlate({...slate, roll: v})} />
                             <NumberInput label="SCENE 场号" value={slate.scene} onChange={(v)=>setSlate({...slate, scene: v})} />
                         </div>

                         {/* Grid - Row 2: Shot, Take, Camera */}
                         <div className="grid grid-cols-3 gap-px bg-gray-100 border border-gray-100 relative z-10">
                             <NumberInput label="SHOT 镜号" value={slate.shot} onChange={(v)=>setSlate({...slate, shot: v})} />
                             <NumberInput label="TAKE 次数" value={slate.take} onChange={(v)=>setSlate({...slate, take: v})} />
                             
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                     className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1 text-center"
                                     value={slate.camera}
                                     onChange={(e)=>setSlate({...slate, camera: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase text-center">CAM 机位</div>
                             </div>
                         </div>

                         {/* Footer Info */}
                         <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
                             <div>
                                 <input 
                                    className="text-xl font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                    value={slate.director}
                                    onChange={(e)=>setSlate({...slate, director: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">DIRECTOR 导演</div>
                             </div>
                             <div className="text-right">
                                 <div className="text-xl font-bold text-[#1A1A1A] mb-1 font-mono">{slate.date}</div>
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">DATE 日期</div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Bottom Action Bar */}
             <div className="w-full bg-[#18181b] pb-[110px] pt-6 px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-3xl z-10 border-t border-white/5 relative">
                 <button onClick={handleClap} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-[#FFC107] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                         <UI.Clapper width={28}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400">打板!</span>
                 </button>
                 
                 <button onClick={handleNextShot} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center text-[#FFC107] border-2 border-[#FFC107]/50">
                         <UI.Next width={28}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400">下一镜</span>
                 </button>

                 <button onClick={onBack} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center text-gray-300 border border-white/10 shadow-sm">
                         <UI.Power width={24}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400">返回</span>
                 </button>
             </div>
        </div>
    );
};

// 6. MORE APPS VIEW (Dark)
const MoreAppsView = () => {
    // Tool States
    const [activeApp, setActiveApp] = useState<'none' | 'calculator' | 'level' | 'food'>('none');
    
    // Food State
    const [foodResult, setFoodResult] = useState('');
    
    // Calculator State
    const [calcDisplay, setCalcDisplay] = useState('0');
    
    // Level State
    const [levelData, setLevelData] = useState({ x: 0, y: 0 });
    
    // Helpers
    const openApp = (tool: any) => {
        if (tool.url) {
            if (tool.scheme) {
                const startTime = Date.now();
                // Attempt to open via iframe to avoid blank page if app not installed
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = tool.scheme;
                document.body.appendChild(iframe);
                
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    // If user is still here after 2s, assume app didn't open
                    if (Date.now() - startTime < 2500 && !document.hidden) {
                         const win = window.open(tool.url, '_blank');
                         if(!win) window.location.href = tool.url;
                    }
                }, 2000);
            } else {
                const win = window.open(tool.url, '_blank');
                if (!win) {
                    window.location.href = tool.url;
                }
            }
            return;
        }

        if(tool.id === 'food') {
            const foods = ['火锅', '烧烤', '麻辣烫', '汉堡', '披萨', '日料', '韩料', '轻食', '牛肉面', '炒饭'];
            let i = 0;
            const interval = setInterval(() => {
                setFoodResult(foods[Math.floor(Math.random() * foods.length)]);
                i++;
                if(i > 20) clearInterval(interval);
            }, 50);
            setActiveApp('food');
        } else if (tool.id === 'calc') {
            setCalcDisplay('0');
            setActiveApp('calculator');
        } else if (tool.id === 'level') {
            setActiveApp('level');
        }
    };

    // Effect for Level
    useEffect(() => {
        if (activeApp === 'level') {
            const handleMouseMove = (e: MouseEvent) => {
                const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2) * 20;
                const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2) * 20;
                setLevelData({ x, y });
            };
            
            const handleOrientation = (e: DeviceOrientationEvent) => {
                if(e.beta && e.gamma) {
                    setLevelData({ x: e.gamma, y: e.beta });
                }
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('deviceorientation', handleOrientation);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('deviceorientation', handleOrientation);
            };
        }
    }, [activeApp]);

    // Components for Tools
    const Calculator = () => {
        const handleBtn = (v: string) => {
            if(v === 'C') setCalcDisplay('0');
            else if(v === '=') {
                try {
                    // Safe eval alternative
                    setCalcDisplay(eval(calcDisplay).toString());
                } catch { setCalcDisplay('Error'); }
            } else {
                setCalcDisplay(calcDisplay === '0' ? v : calcDisplay + v);
            }
        };
        const btns = ['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
        return (
            <div className="w-full max-w-xs bg-[#18181b] rounded-2xl shadow-2xl p-6 relative border border-white/10 text-white">
                 <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"><Icons.Close/></button>
                <div className="bg-[#27272a] h-16 rounded-xl mb-4 flex items-center justify-end px-4 text-3xl font-mono font-bold text-white overflow-hidden">
                    {calcDisplay}
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {btns.map(b => (
                        <button key={b} onClick={()=>handleBtn(b)} className={`h-12 rounded-lg font-bold text-lg hover:bg-white/20 transition-colors ${b==='='?'col-span-2 bg-[#FCD34D] hover:bg-[#fbbf24] text-black':'bg-[#27272a] text-white'}`}>
                            {b}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const Level = () => (
        <div className="relative w-full h-full flex items-center justify-center">
             <button onClick={()=>setActiveApp('none')} className="fixed top-8 right-8 z-[80] w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform"><Icons.Close width={24}/></button>
            <div className="w-full max-w-xs aspect-square bg-[#111] rounded-full shadow-2xl relative border-4 border-[#333] overflow-hidden flex items-center justify-center">
                {/* Center target */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-full scale-50"></div>
                <div className="absolute w-1 h-1 bg-white rounded-full z-10"></div>
                {/* Bubble */}
                <div 
                    className="w-16 h-16 bg-[#FCD34D] rounded-full shadow-inner opacity-90 transition-transform duration-100 ease-out border-2 border-white/50 backdrop-blur-sm"
                    style={{ transform: `translate(${levelData.x * 2}px, ${levelData.y * 2}px)` }}
                >
                    <div className="w-4 h-4 bg-white/40 rounded-full absolute top-3 left-3 blur-[2px]"></div>
                </div>
                <div className="absolute bottom-10 text-white font-mono text-xs opacity-50">
                    X: {levelData.x.toFixed(1)}° Y: {levelData.y.toFixed(1)}°
                </div>
            </div>
        </div>
    );

    const Food = () => (
        <div className="w-full max-w-xs bg-[#18181b] rounded-2xl shadow-2xl p-8 text-center relative border border-white/10 text-white">
             <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"><Icons.Close/></button>
            <h3 className="text-gray-400 font-bold text-sm uppercase mb-4">今天吃什么</h3>
            <div className="text-5xl font-black text-[#FCD34D] mb-8 min-h-[60px] animate-pulse">
                {foodResult}
            </div>
            <div className="flex gap-4">
                <button onClick={()=>openApp('food')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-gray-200">重选</button>
                <button onClick={()=>setActiveApp('none')} className="flex-1 py-3 bg-[#FCD34D] text-black rounded-xl font-bold">决定了</button>
            </div>
        </div>
    );

    const allTools = [
        { id: 'food', label: '今天吃什么', icon: UI.Food, color: 'bg-orange-500/10 text-orange-400' },
        { id: 'calc', label: '计算器', icon: UI.Calculator, color: 'bg-white/5 text-gray-400' },
        { id: 'level', label: '水平仪', icon: UI.Level, color: 'bg-blue-500/10 text-blue-400' },
        { id: 'creators', label: "Creators' App", icon: UI.Wifi, color: 'bg-purple-500/10 text-purple-400', url: 'https://creatorscloud.sony.net/', scheme: 'sony-creators-app://' },
        { id: 'ronin', label: 'DJI Ronin', icon: UI.Cpu, color: 'bg-gray-500/10 text-gray-400', url: 'https://www.dji.com/ronin-app', scheme: 'djironin://' },
        { id: 'monitor', label: 'Monitor+', icon: UI.Monitor, color: 'bg-orange-500/10 text-orange-400', url: 'https://monitorplus.cc/', scheme: 'monitorplus://' },
    ];

    const [showAbout, setShowAbout] = useState(false);

    return (
        <div className="h-full bg-[#09090b] text-white p-6 pb-36 overflow-y-auto font-sans relative">
            <h1 className="text-2xl font-black text-white mb-8">更多应用</h1>
            
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">实用工具</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allTools.map(tool => (
                        <button key={tool.id} onClick={()=>openApp(tool)} className="bg-[#18181b] p-4 rounded-xl border border-white/5 shadow-sm flex flex-col items-center gap-3 hover:border-[#FCD34D] transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                                <tool.icon width={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-300">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">关于</h3>
                <div className="bg-[#18181b] rounded-xl border border-white/5 shadow-sm overflow-hidden">
                     <button onClick={()=>setShowAbout(true)} className="w-full p-4 flex items-center justify-between hover:bg-white/5 border-b border-white/5 transition-colors group">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center"><UI.Heart width={16}/></div>
                             <span className="text-sm font-bold text-gray-200">关于 WXZ Studio</span>
                         </div>
                         <UI.ChevronRight width={16} className="text-gray-500 group-hover:text-white"/>
                     </button>
                </div>
            </div>

            {/* Tool Modal Overlay */}
            {activeApp !== 'none' && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    {activeApp === 'calculator' && <Calculator />}
                    {activeApp === 'level' && <Level />}
                    {activeApp === 'food' && <Food />}
                </div>
            )}

            {/* About Modal */}
            {showAbout && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowAbout(false)}>
                    <div className="bg-[#18181b] rounded-2xl p-8 max-w-xs text-center border border-white/10 text-white shadow-2xl" onClick={e=>e.stopPropagation()}>
                        <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <UI.Heart width={32} fill="currentColor"/>
                        </div>
                        <h3 className="text-xl font-black mb-2">WXZ STUDIO</h3>
                        <p className="text-gray-400 text-sm mb-6">Designed with love.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={()=>window.open('https://wxzstudio.edgeone.dev/', '_blank')} className="w-full py-3 bg-[#FCD34D] text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FFD60A] transition-colors">
                                <UI.Link width={18}/> 访问官网
                            </button>
                            <button onClick={()=>setShowAbout(false)} className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. VIEWFINDER VIEW (ENHANCED: Audio, Storage, Resolution, FPS)
const ViewfinderView = ({ onLinkMedia }: { onLinkMedia: (url: string, meta: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [isStarted, setIsStarted] = useState(false);
    const [hasCamPermission, setHasCamPermission] = useState<boolean | null>(null);
    
    // --- Config State ---
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => {
        return (localStorage.getItem('wxz_viewfinder_aspect') as AspectRatio) || '16:9';
    });
    const [resolution, setResolution] = useState<Resolution>('1080p');
    const [frameRate, setFrameRate] = useState<FrameRate>(30);
    const [audioLevel, setAudioLevel] = useState(0);
    const [storageInfo, setStorageInfo] = useState<{used: string, total: string} | null>(null);

    // Save aspect ratio whenever it changes
    useEffect(() => {
        localStorage.setItem('wxz_viewfinder_aspect', aspectRatio);
    }, [aspectRatio]);

    // Check Storage on mount
    useEffect(() => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                const formatBytes = (bytes: number) => (bytes / (1024 ** 3)).toFixed(1) + ' GB';
                if(estimate.usage !== undefined && estimate.quota !== undefined) {
                    setStorageInfo({
                        used: formatBytes(estimate.usage),
                        total: formatBytes(estimate.quota)
                    });
                }
            }).catch(e => console.warn('Storage estimate failed', e));
        }
    }, []);

    const initCamera = useCallback(async () => {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Stop previous tracks if any
            if (videoRef.current && videoRef.current.srcObject) {
                const s = videoRef.current.srcObject as MediaStream;
                s.getTracks().forEach(t => t.stop());
            }

            const widthIdeal = resolution === '4k' ? 3840 : 1920;
            const heightIdeal = resolution === '4k' ? 2160 : 1080;

            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: 'environment', 
                    width: { ideal: widthIdeal }, 
                    height: { ideal: heightIdeal },
                    frameRate: { ideal: frameRate }
                },
                audio: true 
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    
                    // --- Audio Analysis Setup ---
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    if(AudioContextClass) {
                        const audioCtx = new AudioContextClass();
                        audioContextRef.current = audioCtx;
                        const analyser = audioCtx.createAnalyser();
                        analyser.fftSize = 256;
                        analyserRef.current = analyser;
                        
                        const source = audioCtx.createMediaStreamSource(stream);
                        source.connect(analyser);
                        
                        // Audio Animation Loop
                        const updateAudio = () => {
                            const dataArray = new Uint8Array(analyser.frequencyBinCount);
                            analyser.getByteFrequencyData(dataArray);
                            // Calculate average volume
                            const sum = dataArray.reduce((a, b) => a + b, 0);
                            const avg = sum / dataArray.length;
                            setAudioLevel(avg);
                            animationFrameRef.current = requestAnimationFrame(updateAudio);
                        };
                        updateAudio();
                    }
                }
                setHasCamPermission(true);
            } catch (err) {
                console.error("Camera Error:", err);
                setHasCamPermission(false);
            }
        } else {
             setHasCamPermission(false);
        }
    }, [resolution, frameRate]);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setIsStarted(false);
    }, []);

    // Re-init camera when resolution/fps changes if already started
    useEffect(() => {
        if (isStarted) {
            initCamera();
        }
        return () => { 
            // cleanup on unmount or re-run
            if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isStarted, resolution, frameRate, initCamera]);

    const toggleAspect = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const ratios: AspectRatio[] = ['16:9', '2.35:1', '4:3', '1:1', '9:16'];
        const next = ratios[(ratios.indexOf(aspectRatio) + 1) % ratios.length];
        setAspectRatio(next);
    };

    // --- State 1: Not Started ---
    if (!isStarted) {
        return (
            <div className="fixed inset-0 bg-[#000000] z-50 flex flex-col items-center justify-center text-white p-8 text-center pb-[110px]">
                <div className="w-24 h-24 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-8 shadow-2xl">
                    <Icons.Viewfinder width={48} className="text-[#FCD34D]"/>
                </div>
                <h1 className="text-2xl font-black mb-3 tracking-tight text-white">开启专业取景器</h1>
                <p className="text-[#EBEBF5]/60 text-sm mb-8 leading-relaxed max-w-xs font-medium">
                    WXZ 工具箱需要调用您的相机与麦克风权限，以提供 4K/HDR 预览、实时波形监测及辅助构图功能。
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={() => setIsStarted(true)} 
                        className="bg-[#FCD34D] text-black w-full py-3.5 rounded-xl font-bold text-sm hover:bg-[#FFD60A] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Icons.Video width={18}/>
                        允许访问并开启
                    </button>
                    <p className="text-[10px] text-[#EBEBF5]/30">
                        仅用于本地取景，不会上传任何画面。
                    </p>
                </div>
            </div>
        );
    }

    // --- State 2: Error ---
    if (hasCamPermission === false) {
        return (
            <div className="fixed inset-0 bg-[#000000] z-50 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4 text-red-500">
                    <Icons.Video width={32}/>
                </div>
                <h3 className="text-xl font-bold mb-2">无法访问相机</h3>
                <p className="text-[#EBEBF5]/60 text-sm mb-6">请检查浏览器权限设置，并允许访问相机。</p>
                <button onClick={initCamera} className="bg-[#FCD34D] text-black px-6 py-2 rounded-lg font-bold text-sm">重试</button>
            </div>
        );
    }

    // --- State 3: Active Viewfinder ---
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white font-sans overflow-hidden pb-[110px]">
            {/* Viewfinder Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ color: 'display-p3' }} />
                 
                 {/* Aspect Ratio Masks */}
                 <div className="absolute inset-0 pointer-events-none transition-all duration-300">
                     <div className="w-full h-full border-black/80 transition-all ease-out duration-300" 
                          style={{ 
                              boxShadow: '0 0 0 9999px rgba(0,0,0,0.8)', 
                              aspectRatio: aspectRatio.replace(':','/'),
                              margin: 'auto',
                              position: 'absolute',
                              inset: 0,
                              maxHeight: '100%',
                              maxWidth: '100%'
                          }}>
                     </div>
                 </div>

                 {/* Professional Grid Overlay */}
                 <div className="absolute inset-0 pointer-events-none" style={{ aspectRatio: aspectRatio.replace(':','/'), margin: 'auto', maxHeight:'100%', maxWidth:'100%' }}>
                     <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20">
                        <div className="border-r border-white/20 drop-shadow-sm"></div>
                        <div className="border-r border-white/20 drop-shadow-sm"></div>
                        <div className="col-start-1 row-start-2 border-t border-white/20 drop-shadow-sm col-span-3"></div>
                        <div className="col-start-1 row-start-3 border-t border-white/20 drop-shadow-sm col-span-3"></div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-70">
                         <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#FCD34D]"></div>
                         <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#FCD34D]"></div>
                     </div>
                 </div>

                 {/* Controls & Overlays */}
                 
                 {/* Top Left: Close & Audio */}
                 <div className="absolute top-6 left-6 z-[60] flex flex-col gap-4 items-start">
                     <button 
                        onClick={stopCamera}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-90"
                     >
                         <Icons.Close width={20} />
                     </button>
                     
                     {/* Audio Level Meter */}
                     <div className="flex gap-1 items-end h-16 bg-black/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/5">
                        <div className="flex flex-col justify-between h-full text-[8px] font-mono text-gray-400 mr-1">
                            <span>L</span><span>R</span>
                        </div>
                        <div className="flex gap-1 h-full">
                            {/* Simulated Stereo based on Mono input for visualization */}
                            <div className="w-1.5 bg-gray-800 rounded-full overflow-hidden relative h-full">
                                <div className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-75" style={{ height: `${Math.min(100, audioLevel * 1.5)}%` }}></div>
                            </div>
                             <div className="w-1.5 bg-gray-800 rounded-full overflow-hidden relative h-full">
                                <div className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-75" style={{ height: `${Math.min(100, audioLevel * 1.4)}%` }}></div>
                            </div>
                        </div>
                     </div>
                 </div>
                 
                 {/* Top Right: Status & Config */}
                 <div className="absolute top-6 right-6 z-[60] flex flex-col gap-3 items-end">
                     {/* REC Badge */}
                     <div className="px-2 py-0.5 rounded bg-red-600/90 backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase text-white shadow-lg animate-pulse">
                         REC
                     </div>

                     {/* Storage Info */}
                     {storageInfo && (
                        <div className="flex flex-col items-end text-[10px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                            <span className="text-gray-400">FREE SPACE</span>
                            <span className="font-bold">{parseInt(storageInfo.total) - parseInt(storageInfo.used) > 0 ? (parseInt(storageInfo.total) - parseInt(storageInfo.used)).toFixed(1) + ' GB' : 'LOW'}</span>
                        </div>
                     )}

                     {/* Aspect Ratio Toggle */}
                     <button 
                        onClick={toggleAspect}
                        className="px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20 active:bg-white/20 transition-colors w-16"
                     >
                         {aspectRatio}
                     </button>
                 </div>

                 {/* Bottom Center Controls: Res & FPS */}
                 <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 z-[60] pointer-events-none">
                     <div className="pointer-events-auto flex gap-2 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                         <button onClick={()=>setResolution(resolution === '1080p' ? '4k' : '1080p')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors">
                             {resolution.toUpperCase()}
                         </button>
                         <div className="w-px bg-white/20 my-1"></div>
                         <button onClick={()=>setFrameRate(frameRate === 30 ? 60 : 30)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-colors">
                             {frameRate} FPS
                         </button>
                         <div className="w-px bg-white/20 my-1"></div>
                         <div className="px-2 py-1.5 text-[10px] font-mono text-[#FCD34D] flex items-center">
                             HDR: ON
                         </div>
                     </div>
                 </div>
                 
                 <div className="absolute bottom-4 text-center w-full z-40 text-white/30 text-[9px] font-mono pointer-events-none tracking-widest">
                     WXZ PROFESSIONAL VIEWFINDER
                 </div>
            </div>
        </div>
    );
};

// --- MAIN NAV BAR (Dark) ---
const MainNavBar = ({ active, onChange }: { active: EditorTab; onChange: (t: EditorTab) => void }) => {
    const tabs: { id: EditorTab; icon: React.FC<any>; label: string }[] = [
        { id: 'projects', icon: UI.Folder, label: '我的项目' },
        { id: 'viewfinder', icon: UI.Viewfinder, label: '取景器' },
        { id: 'clapper', icon: UI.Clapper, label: '场记板' },
        { id: 'apps', icon: Icons.Apps, label: '更多' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#09090b] border-t border-white/10 flex items-center justify-around px-2 pb-safe z-50 font-sans">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center justify-center gap-1 w-full h-full active:scale-95 transition-transform">
                        <div className={`h-8 w-14 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white text-black' : 'text-gray-500'}`}>
                            <t.icon width={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{t.label}</span>
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
    
    // Lifted Projects State for Persistence
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('wxz_projects');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('wxz_projects', JSON.stringify(projects));
    }, [projects]);

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

    const handleBackFromClapper = () => {
        if (activeProject) {
            setProjectMode('dashboard');
            setEditorTab('projects');
        } else {
             setEditorTab('apps'); // Default fallback or projects
        }
    };

    // Render Content based on current state
    const renderContent = () => {
        if (editorTab === 'viewfinder') return <ViewfinderView onLinkMedia={(url, meta) => alert(`Media Captured: ${meta}`)} />;
        // Pass a back handler to clapper if it was opened from projects context, but here it's global tab. 
        // We add a specific back handler for the Clapper UI button.
        if (editorTab === 'clapper') return <ClapperView onBack={() => setEditorTab('projects')} projects={projects} />;
        if (editorTab === 'apps') return <MoreAppsView />;
        
        // Projects Tab Logic
        if (!activeProject) {
            return <ProjectManager activeProject={null} projects={projects} setProjects={setProjects} onSelectProject={handleSelectProject} onBack={()=>{}} onOpenTool={()=>{}} />;
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
                return <ProjectManager activeProject={activeProject} projects={projects} setProjects={setProjects} onSelectProject={()=>{}} onBack={handleBackToProjects} onOpenTool={handleOpenTool} />;
        }
    };

    return (
        <div className="h-screen w-full bg-[#09090b] text-white flex flex-col font-sans">
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>
            <MainNavBar active={editorTab} onChange={setEditorTab} />
        </div>
    );
};

export default App;