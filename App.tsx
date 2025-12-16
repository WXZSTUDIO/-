import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Maximize: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2-2h3"/></svg>,
    Power: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>,
    Next: (props: any) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
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
            <div className="h-full bg-[#F7F8FA] p-6 pb-32 overflow-y-auto font-sans">
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
        <div className="h-full bg-[#F7F8FA] flex flex-col font-sans">
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
        // Simple heuristic: Line break = row, Tab/Comma = column.
        // Assumes order: Scene | Shot | Content | Type
        const lines = importText.trim().split('\n');
        const newShots: Shot[] = lines.map((line, idx) => {
            const cols = line.split(/\t|,|，/); // Split by tab or comma
            return {
                id: Date.now().toString() + idx,
                shotNo: cols[1] || (shots.length + 1 + idx).toString(),
                scene: cols[0] || '',
                duration: '3s',
                content: cols[2] || cols[0] || '导入内容',
                notes: '',
                type: cols[3] || 'WS',
                isChecked: false
            };
        });
        setShots([...shots, ...newShots]);
        setShowImport(false);
        setImportText('');
    };

    return (
        <div className={`flex flex-col h-full font-sans ${mode === 'presentation' ? 'bg-black text-white z-50 fixed inset-0' : 'bg-[#F7F8FA]'}`}>
            {/* Toolbar */}
            <div className={`px-4 py-3 flex items-center justify-between z-20 ${mode === 'presentation' ? 'absolute top-0 w-full hover:bg-black/50' : 'bg-white border-b border-gray-200 sticky top-0'}`}>
                 <div className="flex items-center gap-3">
                     {mode !== 'presentation' && <button onClick={onBack}><Icons.Back width={20}/></button>}
                     <span className="font-bold text-lg">WXZ 分镜</span>
                 </div>
                 <div className="flex items-center gap-2">
                     {mode !== 'presentation' && (
                        <>
                            <button onClick={()=>setShowImport(true)} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600">导入脚本</button>
                            <div className="relative">
                                <select value={aspect} onChange={(e)=>setAspect(e.target.value as AspectRatio)} className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold outline-none">
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

            {/* Import Modal */}
            {showImport && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                     <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                         <h3 className="text-lg font-bold mb-4">导入脚本 (表格格式)</h3>
                         <p className="text-xs text-gray-400 mb-2">请直接复制 Excel 或表格内容粘贴到下方。列顺序：场号 | 镜号 | 内容 | 景别</p>
                         <textarea 
                            className="w-full h-48 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono mb-4" 
                            placeholder={"1\t1A\t主角入画\tWS\n1\t1B\t主角回头\tCU"}
                            value={importText}
                            onChange={e=>setImportText(e.target.value)}
                         />
                         <div className="flex gap-3">
                             <button onClick={()=>setShowImport(false)} className="flex-1 py-2 text-gray-500 font-bold bg-gray-50 rounded-lg">取消</button>
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
        <div className="flex flex-col h-full bg-[#F7F8FA] font-sans">
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

// 4. CALL SHEET TOOL (REDESIGNED with Preview & Image Gen)
const CallSheetTool = ({ onBack }: { onBack: ()=>void }) => {
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const previewRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<CallSheetData>({
        production: 'WXZ 品牌宣传片',
        date: '2023-10-25',
        location: 'WXZ 创意园 A栋',
        weather: '晴转多云 24°C',
        nearestHospital: '市第一医院',
        callTime: '06:30 AM',
        shootTime: '08:00 AM',
        wrapTime: '18:00 PM',
        crew: '导演: Tim, 摄影: Alex, 灯光: Lee',
        cast: '男主: 张三, 女主: 李四',
        notes: '请全员注意安全，携带身份证件。'
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
        <div className="h-full bg-[#F7F8FA] flex flex-col font-sans">
             {/* Header */}
             <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                     <button onClick={onBack}><Icons.Back width={20}/></button>
                     <h2 className="text-lg font-bold">拍摄通告</h2>
                 </div>
                 <div className="flex gap-2">
                     {mode === 'edit' ? (
                         <button onClick={()=>setMode('preview')} className="bg-[#181818] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">预览</button>
                     ) : (
                         <>
                            <button onClick={()=>setMode('edit')} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-bold">编辑</button>
                            <button onClick={handleDownload} className="bg-[#FCD34D] text-black px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><UI.Download width={14}/> 保存图片</button>
                         </>
                     )}
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto pb-32 p-4">
                 {mode === 'edit' ? (
                     <div className="max-w-xl mx-auto space-y-6">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="text-xs font-bold text-[#FCD34D] uppercase mb-4 tracking-wider">基础信息</h3>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">通告标题</label>
                                     <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold outline-none" value={data.production} onChange={e=>setData({...data, production: e.target.value})} />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1.5">拍摄日期</label>
                                         <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold outline-none" value={data.date} onChange={e=>setData({...data, date: e.target.value})} />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1.5">集合时间</label>
                                         <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold outline-none" value={data.callTime.replace(' AM','').replace(' PM','')} onChange={e=>setData({...data, callTime: e.target.value})} />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">拍摄地点</label>
                                     <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold outline-none" value={data.location} onChange={e=>setData({...data, location: e.target.value})} />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">天气</label>
                                     <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold outline-none" value={data.weather} onChange={e=>setData({...data, weather: e.target.value})} />
                                 </div>
                             </div>
                         </div>
                         
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="text-xs font-bold text-[#FCD34D] uppercase mb-4 tracking-wider">人员与备注</h3>
                             <div className="space-y-4">
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">演职人员</label>
                                     <textarea className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium outline-none" value={data.crew} onChange={e=>setData({...data, crew: e.target.value})} />
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 mb-1.5">备注</label>
                                     <textarea className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium outline-none" value={data.notes} onChange={e=>setData({...data, notes: e.target.value})} />
                                </div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="flex justify-center">
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
        setTimeout(() => setIsClapped(false), 200); // Reset animation
    };

    const handleNextShot = () => {
        const nextShot = (parseInt(slate.shot) + 1).toString();
        setSlate({...slate, shot: nextShot, take: '1'});
    };

    return (
        <div className="h-full bg-[#F5F5F5] flex flex-col items-center justify-between font-sans relative overflow-hidden">
             
             {/* Clapperboard Container */}
             <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4">
                <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 relative select-none">
                     
                     {/* 1. Header Stripe (Animated) */}
                     <div 
                        className={`h-24 bg-[#1A1A1A] relative flex items-center overflow-hidden rounded-t-2xl origin-bottom-left transition-transform duration-100 ease-in ${isClapped ? 'rotate-[-10deg]' : 'rotate-0'}`}
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
                         {/* Production Title - Elevated Z-Index */}
                         <div className="mb-6 border-b border-gray-100 pb-4 relative z-50">
                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">片名 PRODUCTION</div>
                             <button 
                                onClick={() => setShowProjectSelect(!showProjectSelect)}
                                className="w-full text-left flex items-center justify-between group"
                             >
                                <span className={`text-3xl font-black truncate ${slate.prodTitle && slate.prodTitle !== '无项目' ? 'text-[#1A1A1A]' : 'text-gray-300'}`}>
                                    {slate.prodTitle || '点击选择项目'}
                                </span>
                                <UI.ChevronDown width={24} className="text-gray-300 group-hover:text-[#FCD34D] transition-colors"/>
                             </button>
                             
                             {/* Dropdown - Adjusted positioning */}
                             {showProjectSelect && (
                                 <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
                                     <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                         {projects.length > 0 ? (
                                             projects.map(p => (
                                                 <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSlate({...slate, prodTitle: p.title});
                                                        setShowProjectSelect(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-yellow-50 font-bold text-sm text-gray-800 border-b border-gray-50 last:border-0"
                                                 >
                                                     {p.title}
                                                 </button>
                                             ))
                                         ) : (
                                             <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                                 暂无项目，请先去创建
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )}
                             
                             {/* Backdrop for click-away */}
                             {showProjectSelect && (
                                 <div className="fixed inset-0 z-[-1]" onClick={() => setShowProjectSelect(false)}></div>
                             )}
                         </div>

                         {/* Grid - Row 1: Roll & Scene - Lower Z-Index */}
                         <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 mb-px relative z-10">
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                    className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                    value={slate.roll}
                                    onChange={(e)=>setSlate({...slate, roll: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">ROLL 卷号</div>
                             </div>
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                    className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                    value={slate.scene}
                                    onChange={(e)=>setSlate({...slate, scene: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">SCENE 场号</div>
                             </div>
                         </div>

                         {/* Grid - Row 2: Shot, Take, Camera - Lower Z-Index */}
                         <div className="grid grid-cols-3 gap-px bg-gray-100 border border-gray-100 relative z-10">
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                     className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                     value={slate.shot}
                                     onChange={(e)=>setSlate({...slate, shot: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">SHOT 镜号</div>
                             </div>
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                     className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                     value={slate.take}
                                     onChange={(e)=>setSlate({...slate, take: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">TAKE 次数</div>
                             </div>
                             <div className="bg-white p-4 h-28 flex flex-col justify-center cursor-pointer active:bg-gray-50">
                                 <input 
                                     className="text-4xl font-mono font-bold text-[#1A1A1A] w-full bg-transparent outline-none mb-1"
                                     value={slate.camera}
                                     onChange={(e)=>setSlate({...slate, camera: e.target.value})}
                                 />
                                 <div className="text-[10px] font-bold text-gray-400 uppercase">CAM 机位</div>
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
             <div className="w-full bg-white pb-[90px] pt-6 px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl z-10">
                 <button onClick={handleClap} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-[#FFC107] flex items-center justify-center text-white shadow-lg shadow-orange-100">
                         <UI.Clapper width={28}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-500">打板!</span>
                 </button>
                 
                 <button onClick={handleNextShot} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-[#FFECB3] flex items-center justify-center text-[#FFC107] border-2 border-[#FFE082]">
                         <UI.Next width={28}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-500">下一镜</span>
                 </button>

                 <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm">
                         <UI.List width={24}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-500">镜头详情</span>
                 </button>

                 <button onClick={onBack} className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                     <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm">
                         <UI.Power width={24}/>
                     </div>
                     <span className="text-[10px] font-bold text-gray-500">返回</span>
                 </button>
             </div>
        </div>
    );
};

// 6. MORE APPS VIEW (With Close Buttons & Links)
const MoreAppsView = () => {
    // Tool States
    const [activeApp, setActiveApp] = useState<'none' | 'calculator' | 'level' | 'compass' | 'food'>('none');
    
    // Food State
    const [foodResult, setFoodResult] = useState('');
    
    // Calculator State
    const [calcDisplay, setCalcDisplay] = useState('0');
    
    // Level State
    const [levelData, setLevelData] = useState({ x: 0, y: 0 });
    
    // Compass State
    const [compassHeading, setCompassHeading] = useState(0);
    const [hasPermission, setHasPermission] = useState(false);

    // Helpers
    const openApp = (id: string) => {
        if(id === 'food') {
            const foods = ['火锅', '烧烤', '麻辣烫', '汉堡', '披萨', '日料', '韩料', '轻食', '牛肉面', '炒饭'];
            let i = 0;
            const interval = setInterval(() => {
                setFoodResult(foods[Math.floor(Math.random() * foods.length)]);
                i++;
                if(i > 20) clearInterval(interval);
            }, 50);
            setActiveApp('food');
        } else if (id === 'calc') {
            setCalcDisplay('0');
            setActiveApp('calculator');
        } else if (id === 'level') {
            setActiveApp('level');
        } else if (id === 'compass') {
            setActiveApp('compass');
            setHasPermission(false);
        }
    };

    const requestCompassPermission = () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((response: string) => {
                    if (response === 'granted') {
                        setHasPermission(true);
                    } else {
                        alert('Permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS 13+ devices
            setHasPermission(true);
        }
    };

    // Effect for Level (Mouse simulation for desktop, DeviceOrientation for mobile)
    useEffect(() => {
        if (activeApp === 'level') {
            const handleMouseMove = (e: MouseEvent) => {
                // Simulate tilt based on mouse position relative to center
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
        if (activeApp === 'compass') {
             const handleOrientation = (e: any) => {
                 // Webkit (iOS) specific
                 if (e.webkitCompassHeading) {
                     setCompassHeading(e.webkitCompassHeading);
                 }
                 // Standard (Android)
                 else if (e.alpha) {
                     setCompassHeading(360 - e.alpha);
                 }
             };

             if (hasPermission) {
                 window.addEventListener('deviceorientation', handleOrientation, true);
             }

             return () => {
                 window.removeEventListener('deviceorientation', handleOrientation, true);
             };
        }
    }, [activeApp, hasPermission]);

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
            <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 relative">
                 <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-black"><Icons.Close/></button>
                <div className="bg-gray-100 h-16 rounded-xl mb-4 flex items-center justify-end px-4 text-3xl font-mono font-bold text-gray-800 overflow-hidden">
                    {calcDisplay}
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {btns.map(b => (
                        <button key={b} onClick={()=>handleBtn(b)} className={`h-12 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors ${b==='='?'col-span-2 bg-[#FCD34D] hover:bg-[#fbbf24] text-black':'bg-gray-50 text-gray-700'}`}>
                            {b}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const Level = () => (
        <div className="relative w-full h-full flex items-center justify-center">
             <button onClick={()=>setActiveApp('none')} className="fixed top-8 right-8 z-[80] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black hover:scale-110 transition-transform"><Icons.Close width={24}/></button>
            <div className="w-full max-w-xs aspect-square bg-[#222] rounded-full shadow-2xl relative border-4 border-gray-700 overflow-hidden flex items-center justify-center">
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

    const Compass = () => (
        <div className="relative w-full h-full flex items-center justify-center">
             <button onClick={()=>setActiveApp('none')} className="fixed top-8 right-8 z-[80] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black hover:scale-110 transition-transform"><Icons.Close width={24}/></button>
            
             {!hasPermission ? (
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center z-50 max-w-xs">
                    <h3 className="font-bold text-lg mb-2">需要权限</h3>
                    <p className="text-sm text-gray-500 mb-4">指南针需要访问您的设备方向传感器。</p>
                    <button onClick={requestCompassPermission} className="bg-[#FCD34D] text-black font-bold px-6 py-2 rounded-lg text-sm w-full">允许访问</button>
                </div>
             ) : (
                <div className="w-full max-w-xs aspect-square bg-white rounded-full shadow-2xl relative border-8 border-gray-100 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[20px] border-gray-50"></div>
                    {/* Degree ticks */}
                    {[0, 90, 180, 270].map(d => (
                        <div key={d} className="absolute inset-0 flex justify-center pt-2 font-bold text-gray-400" style={{transform: `rotate(${d}deg)`}}>
                            {d === 0 ? 'N' : d === 90 ? 'E' : d === 180 ? 'S' : 'W'}
                        </div>
                    ))}
                    {/* Needle */}
                    <div 
                        className="w-4 h-40 bg-red-500 rounded-full relative shadow-md transition-transform duration-300 ease-out z-10"
                        style={{transform: `rotate(${compassHeading}deg)`}}
                    >
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-600 rounded-t-full"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-800 rounded-b-full"></div>
                    </div>
                    <div className="absolute bottom-10 font-mono font-bold text-2xl text-gray-800">{Math.round(compassHeading)}°</div>
                </div>
             )}
        </div>
    );

    const Food = () => (
        <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-8 text-center relative">
             <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-black"><Icons.Close/></button>
            <h3 className="text-gray-400 font-bold text-sm uppercase mb-4">今天吃什么</h3>
            <div className="text-5xl font-black text-[#FCD34D] mb-8 min-h-[60px] animate-pulse">
                {foodResult}
            </div>
            <div className="flex gap-4">
                <button onClick={()=>openApp('food')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-600">重选</button>
                <button onClick={()=>setActiveApp('none')} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">决定了</button>
            </div>
        </div>
    );

    const tools = [
        { id: 'food', label: '今天吃什么', icon: UI.Food, color: 'bg-orange-100 text-orange-600' },
        { id: 'calc', label: '计算器', icon: UI.Calculator, color: 'bg-gray-100 text-gray-600' },
        { id: 'level', label: '水平仪', icon: UI.Level, color: 'bg-blue-100 text-blue-600' },
        { id: 'compass', label: '指南针', icon: UI.Compass, color: 'bg-red-100 text-red-600' },
    ];

    const [showThanks, setShowThanks] = useState(false);

    return (
        <div className="h-full bg-[#F7F8FA] p-6 pb-32 overflow-y-auto font-sans relative">
            <h1 className="text-2xl font-black text-gray-900 mb-8">更多应用</h1>
            
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">实用工具</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tools.map(tool => (
                        <button key={tool.id} onClick={()=>openApp(tool.id)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 hover:border-[#FCD34D] transition-colors">
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
                    <button onClick={()=>setShowThanks(true)} className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center"><UI.Heart width={16}/></div>
                        <span className="text-sm font-bold">感谢作者</span>
                    </button>
                    <button onClick={()=>window.open('https://wxzstudio.edgeone.dev/', '_blank')} className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><UI.Link width={16}/></div>
                        <span className="text-sm font-bold">访问官网</span>
                    </button>
                </div>
            </div>

            {/* Tool Modal Overlay */}
            {activeApp !== 'none' && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    {activeApp === 'calculator' && <Calculator />}
                    {activeApp === 'level' && <Level />}
                    {activeApp === 'compass' && <Compass />}
                    {activeApp === 'food' && <Food />}
                </div>
            )}

            {/* Thanks Modal */}
            {showThanks && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowThanks(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-xs text-center" onClick={e=>e.stopPropagation()}>
                        <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UI.Heart width={32} fill="currentColor"/>
                        </div>
                        <h3 className="text-xl font-black mb-2">WXZ STUDIO</h3>
                        <p className="text-gray-500 text-sm mb-6">Designed with love.</p>
                        <button onClick={()=>setShowThanks(false)} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. VIEWFINDER VIEW (FIXED PADDING)
const ViewfinderView = ({ onLinkMedia }: { onLinkMedia: (url: string, meta: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [activeControl, setActiveControl] = useState<string | null>(null);
    
    const [params, setParams] = useState({
        iso: 800,
        shutter: '1/50',
        wb: 5600,
        focus: 50,
        ev: 0.0
    });

    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
            .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
            .catch(console.error);
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, []);

    const controls = [
        { id: 'flip', label: '前置', icon: Icons.Refresh },
        { id: 'focus', label: '对焦', icon: Icons.Focus, adjustable: true },
        { id: 'wb', label: '白平衡', icon: Icons.Sun, adjustable: true },
        { id: 'iso', label: '感光', icon: Icons.Aperture, adjustable: true },
        { id: 'shutter', label: '快门速度', icon: Icons.Shutter, adjustable: true },
        { id: 'ev', label: '曝光补偿', icon: Icons.Exposure, adjustable: true },
        { id: 'settings', label: '设置', icon: Icons.Settings },
    ];

    const handleControlClick = (id: string) => {
        if(id === 'flip') return;
        setActiveControl(activeControl === id ? null : id);
    };

    const getSliderConfig = (id: string) => {
        switch(id) {
            case 'iso': return { min: 100, max: 6400, step: 100, val: params.iso, label: `ISO ${params.iso}` };
            case 'wb': return { min: 2000, max: 8000, step: 100, val: params.wb, label: `${params.wb}K` };
            case 'focus': return { min: 0, max: 100, step: 1, val: params.focus, label: `Focus ${params.focus}` };
            case 'ev': return { min: -3, max: 3, step: 0.1, val: params.ev, label: `${params.ev > 0 ? '+' : ''}${params.ev.toFixed(1)} EV` };
            case 'shutter': return { min: 1, max: 1000, step: 10, val: parseInt(params.shutter.split('/')[1] || '50'), label: params.shutter };
            default: return null;
        }
    };

    const activeSlider = activeControl ? getSliderConfig(activeControl) : null;

    const updateParam = (val: number) => {
        if(!activeControl) return;
        if(activeControl === 'shutter') setParams({...params, shutter: `1/${val}`});
        else setParams({...params, [activeControl]: val});
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white font-sans overflow-hidden pb-[90px]">
            {/* Top Toolbar */}
            <div className="flex justify-between px-4 pt-6 pb-4 bg-black/60 backdrop-blur-md z-30 overflow-x-auto scrollbar-hide">
                {controls.map(c => (
                    <button 
                        key={c.id} 
                        onClick={() => handleControlClick(c.id)}
                        className={`flex flex-col items-center gap-1 min-w-[56px] flex-shrink-0 ${activeControl === c.id ? 'text-[#FCD34D]' : 'text-white'}`}
                    >
                        <c.icon width={24} strokeWidth={activeControl === c.id ? 2.5 : 2}/>
                        <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{c.label}</span>
                    </button>
                ))}
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                 
                 {/* Grid Overlay */}
                 <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                     <div className="border-r border-white/50"></div><div className="border-r border-white/50"></div>
                     <div className="border-r border-white/50 col-start-1 row-start-2 border-t border-b"></div>
                     <div className="border-r border-white/50 col-start-2 row-start-2 border-t border-b"></div>
                     <div className="col-start-3 row-start-2 border-t border-b border-white/50"></div>
                 </div>

                 {/* Active Slider Overlay */}
                 {activeSlider && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur rounded-2xl p-4 animate-slide-up z-20">
                        <div className="flex justify-between text-xs font-bold mb-2 text-[#FCD34D]">
                            <span className="uppercase">{activeControl}</span>
                            <span>{activeSlider.label}</span>
                        </div>
                        <input 
                            type="range" 
                            min={activeSlider.min} 
                            max={activeSlider.max} 
                            step={activeSlider.step}
                            value={activeSlider.val}
                            onChange={(e) => updateParam(parseFloat(e.target.value))}
                            className="w-full h-6 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#FCD34D]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                            <span>{activeSlider.min}</span>
                            <span>{activeSlider.max}</span>
                        </div>
                    </div>
                 )}
            </div>

            {/* Bottom Controls */}
            <div className="h-32 bg-black flex items-center justify-between px-10 pb-4 z-30">
                {/* Gallery Preview */}
                <button className="w-12 h-12 rounded-lg bg-gray-800 border-2 border-white/20 overflow-hidden">
                     <div className="w-full h-full bg-gray-700"></div> 
                </button>

                {/* Shutter */}
                <button 
                   onClick={() => { setIsRecording(true); setTimeout(() => { setIsRecording(false); onLinkMedia("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4", `24mm | ISO ${params.iso}`); }, 300); }}
                   className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95 ${isRecording ? 'bg-red-600' : 'bg-transparent'}`}
                >
                    <div className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500' : 'bg-red-500'}`}></div>
                </button>

                {/* Filters */}
                <button className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-blue-500 border-2 border-white/20 flex items-center justify-center">
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
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-safe z-50 font-sans">
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
    
    // Lifted Projects State for Persistence
    const [projects, setProjects] = useState<Project[]>([]);

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
        <div className="h-screen w-full bg-white text-[#333] flex flex-col font-sans">
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>
            <MainNavBar active={editorTab} onChange={setEditorTab} />
        </div>
    );
};

export default App;