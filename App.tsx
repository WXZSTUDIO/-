import React, { useState, useEffect } from 'react';
import { Icons } from './constants';

// --- Types ---
type EditorTab = 'workspace' | 'storyboard' | 'plan' | 'callsheet' | 'apps';
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
}

interface TodoItem {
    id: string;
    text: string;
    done: boolean;
    assignee: string;
}

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    time: string;
}

interface Member {
    id: string;
    name: string;
    role: string;
    avatar: string;
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

// 1. PROJECT LIST VIEW
const ProjectListView = ({ onOpenProject }: { onOpenProject: (p: Project) => void }) => {
    const [projects, setProjects] = useState<Project[]>([
        { id: '1', title: '2023 品牌宣传片', updatedAt: '2小时前', aspectRatio: '16:9', template: 'general' },
        { id: '2', title: '短剧《逆袭》', updatedAt: '昨天', aspectRatio: '9:16', template: 'short' }
    ]);
    const [showModal, setShowModal] = useState(false);
    
    // Create Project Form State
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
        onOpenProject(newProject);
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA] p-6 pb-safe">
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
                    <div key={p.id} onClick={() => onOpenProject(p)} className="aspect-[4/3] bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-gray-100 relative group">
                         <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-1 hover:bg-gray-100 rounded-full"><UI.MoreVertical width={16}/></button>
                         </div>
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

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">新建项目</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><Icons.Close /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">项目名称</label>
                                <input 
                                    autoFocus
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:border-[#FCD34D] focus:bg-white outline-none transition-colors"
                                    placeholder="输入项目标题..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">项目类型模板</label>
                                    <div className="relative">
                                        <select 
                                            value={template}
                                            onChange={e => setTemplate(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-[#FCD34D] outline-none"
                                        >
                                            <option value="general">通用视频</option>
                                            <option value="tvc">TVC 广告</option>
                                            <option value="short">短剧/短片</option>
                                            <option value="doc">纪录片</option>
                                        </select>
                                        <UI.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">默认画幅</label>
                                    <div className="relative">
                                        <select 
                                            value={ratio}
                                            onChange={e => setRatio(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-[#FCD34D] outline-none"
                                        >
                                            <option value="16:9">16:9 (横屏)</option>
                                            <option value="9:16">9:16 (竖屏)</option>
                                            <option value="2.35:1">2.35:1 (宽幅)</option>
                                            <option value="4:3">4:3 (复古)</option>
                                            <option value="1:1">1:1 (正方)</option>
                                        </select>
                                        <UI.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">取消</button>
                            <button onClick={handleCreate} className="flex-1 py-3 text-sm font-bold bg-[#FCD34D] hover:bg-[#fbbf24] text-black rounded-lg shadow-sm transition-colors">立即创建</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. WORKSPACE VIEW
const WorkspaceView = () => {
    const [todos, setTodos] = useState<TodoItem[]>([
        { id: '1', text: '确认场地A的电源情况', done: false, assignee: '制片' },
        { id: '2', text: '租赁 Arri Alexa Mini', done: true, assignee: '摄影' },
        { id: '3', text: '修改第5场分镜草图', done: false, assignee: '导演' },
    ]);
    const logs: ActivityLog[] = [
        { id: '1', user: '导演', action: '更新了 Sc 3 的分镜', time: '10分钟前' },
        { id: '2', user: '摄影师', action: '上传了现场勘景图', time: '1小时前' },
    ];
    const members: Member[] = [
        { id: '1', name: 'WXZ Studio', role: 'Director', avatar: 'DIR' },
        { id: '2', name: 'Alex', role: 'DOP', avatar: 'DP' },
    ];
    const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

    return (
        <div className="h-full bg-[#F7F8FA] p-6 overflow-y-auto custom-scrollbar pb-32">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black">团队工作台</h1>
                        <p className="text-xs text-gray-400 tracking-wider mt-1 uppercase">Team Workspace</p>
                    </div>
                    <div className="flex -space-x-2">
                         {members.map(m => (
                             <div key={m.id} className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white ring-1 ring-gray-100" title={m.role}>
                                 {m.avatar}
                             </div>
                         ))}
                         <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-gray-400 hover:bg-[#FCD34D] hover:text-black transition-colors">
                             <Icons.Add width={14}/>
                         </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg flex items-center gap-2"><UI.CheckCircle /> 待办事项</h2>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{todos.filter(t=>!t.done).length}</span>
                        </div>
                        <div className="space-y-3">
                            {todos.map(todo => (
                                <div key={todo.id} onClick={() => toggleTodo(todo.id)} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${todo.done ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                        {todo.done && <Icons.Check width={10} strokeWidth={4} className="text-white"/>}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-sm font-medium ${todo.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{todo.text}</div>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded self-start">{todo.assignee}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><UI.Clock /> 操作动态</h2>
                        <div className="relative border-l border-gray-100 pl-6 space-y-8">
                            {logs.map(log => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                    <div className="text-sm"><span className="font-bold text-gray-900">{log.user}</span> <span className="text-gray-600">{log.action}</span></div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-mono">{log.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. STORYBOARD VIEW
const StoryboardView = ({ projectRatio }: { projectRatio: AspectRatio }) => {
    const [mode, setMode] = useState<StoryboardMode>('list');
    const [aspect, setAspect] = useState<AspectRatio>(projectRatio || '16:9');
    const [shots, setShots] = useState<Shot[]>([
        { id: '1', shotNo: '1', scene: '1', duration: '5s', content: '男主走进房间', notes: '光线要暗', type: 'WS', isChecked: false }
    ]);

    const addShot = () => {
        const newShot = {
            id: Date.now().toString(),
            shotNo: (shots.length + 1).toString(),
            scene: '', duration: '', content: '', notes: '', type: '', isChecked: false
        };
        setShots([...shots, newShot]);
    };

    return (
        <div className={`flex flex-col h-full ${mode === 'presentation' ? 'bg-black text-white z-50 fixed inset-0' : 'bg-[#F7F8FA]'}`}>
            <div className={`px-4 md:px-6 py-3 flex items-center justify-between z-20 overflow-x-auto gap-4 ${mode === 'presentation' ? 'bg-transparent text-white fixed top-0 w-full hover:bg-black/50 transition-colors' : 'bg-white border-b border-gray-200 sticky top-0'}`}>
                 <div className="flex items-center gap-4 flex-shrink-0">
                     {mode !== 'presentation' && (
                         <div className="flex bg-gray-100 rounded-lg p-0.5">
                             <button onClick={()=>setMode('list')} className={`p-1.5 rounded-md transition-all ${mode==='list'?'bg-white shadow text-black':'text-gray-400 hover:text-gray-600'}`}><UI.List width={16}/></button>
                             <button onClick={()=>setMode('board')} className={`p-1.5 rounded-md transition-all ${mode==='board'?'bg-white shadow text-black':'text-gray-400 hover:text-gray-600'}`}><UI.Grid width={16}/></button>
                         </div>
                     )}
                     <span className="font-bold text-lg hidden md:block">制作分镜</span>
                 </div>

                 <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                     {/* Functional Aspect Ratio Dropdown */}
                     <div className="relative group">
                        <select 
                            value={aspect} 
                            onChange={(e)=>setAspect(e.target.value as AspectRatio)}
                            className={`appearance-none text-xs font-bold rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer transition-colors ${mode === 'presentation' ? 'bg-white/20 text-white border-none' : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            <option value="16:9">16:9</option>
                            <option value="2.35:1">2.35:1</option>
                            <option value="4:3">4:3</option>
                            <option value="1:1">1:1</option>
                            <option value="9:16">9:16</option>
                        </select>
                        <UI.ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${mode === 'presentation' ? 'text-white' : 'text-gray-500'}`} />
                     </div>
                     
                     <div className="hidden md:flex items-center gap-2">
                         <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="批量上传"><Icons.Upload width={18}/></button>
                         <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="PDF导出"><UI.Download width={18}/></button>
                     </div>
                     
                     <button 
                        onClick={() => setMode(mode === 'presentation' ? 'list' : 'presentation')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${mode==='presentation'?'bg-[#FCD34D] text-black':'bg-black text-white hover:bg-gray-800'}`}
                     >
                        {mode === 'presentation' ? <Icons.Close width={14}/> : <UI.Play width={14}/>}
                        {mode === 'presentation' ? '退出' : '放映'}
                     </button>
                 </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-32">
                {mode === 'presentation' ? (
                     <div className="max-w-6xl mx-auto h-full flex items-center justify-center p-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                             {shots.map(s => (
                                 <div key={s.id} className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                     <div className="bg-black/50 w-full relative group" style={{aspectRatio: aspect.replace(':','/')}}>
                                          <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                              <Icons.Video width={48} height={48}/>
                                          </div>
                                     </div>
                                     <div className="p-4">
                                         <h3 className="text-xl font-bold mb-1 text-gray-200">Shot {s.shotNo}</h3>
                                         <p className="text-gray-400 text-sm leading-relaxed">{s.content || '暂无描述'}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                ) : mode === 'list' ? (
                    <div className="max-w-5xl mx-auto space-y-4">
                        {shots.map((shot) => (
                             <div key={shot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start group hover:border-[#FCD34D] transition-colors">
                                 <div className="font-mono text-gray-400 font-bold pt-1 w-8">#{shot.shotNo}</div>
                                 
                                 <div className="w-24 md:w-32 bg-gray-100 rounded-lg flex-shrink-0 relative cursor-pointer overflow-hidden border border-gray-200" style={{aspectRatio: aspect.replace(':','/')}}>
                                      <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Icons.Video width={20}/></div>
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity">更换</div>
                                 </div>

                                 <div className="flex-1 min-w-0">
                                     <textarea 
                                        className="w-full bg-transparent outline-none text-sm resize-none h-16 placeholder-gray-300 mb-2" 
                                        placeholder="输入画面描述..."
                                        value={shot.content}
                                        onChange={(e) => {
                                            const newShots = [...shots];
                                            newShots.find(s=>s.id===shot.id)!.content = e.target.value;
                                            setShots(newShots);
                                        }}
                                     />
                                     <div className="flex gap-2">
                                         <input className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-xs w-16 text-center outline-none focus:border-[#FCD34D]" placeholder="景别" value={shot.type} onChange={()=>{}} />
                                         <input className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-xs w-16 text-center outline-none focus:border-[#FCD34D]" placeholder="时长" value={shot.duration} onChange={()=>{}} />
                                     </div>
                                 </div>
                             </div>
                        ))}
                        <button onClick={addShot} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#FCD34D] hover:text-[#FCD34D] hover:bg-yellow-50/10 font-bold text-sm transition-all flex items-center justify-center gap-2">
                             <Icons.Add width={18}/> 添加镜头
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {shots.map((shot) => (
                             <div key={shot.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-[#FCD34D] transition-colors">
                                  <div className="bg-gray-100 w-full relative" style={{aspectRatio: aspect.replace(':','/')}}>
                                      <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Icons.Video width={24}/></div>
                                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">{shot.type || 'WS'}</div>
                                  </div>
                                  <div className="p-3">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-xs">Shot {shot.shotNo}</span>
                                          <span className="text-[10px] text-gray-400">{shot.duration}</span>
                                      </div>
                                      <p className="text-[10px] text-gray-500 line-clamp-2">{shot.content || '无描述'}</p>
                                  </div>
                             </div>
                        ))}
                        <button onClick={addShot} className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#FCD34D] hover:text-[#FCD34D] transition-all min-h-[120px]">
                            <Icons.Add width={24}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 4. PLAN VIEW
const PlanView = () => {
    const [mode, setMode] = useState<PlanMode>('list');
    return (
        <div className="flex flex-col h-full bg-[#F7F8FA]">
             <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                     <h2 className="text-lg font-bold">拍摄计划</h2>
                     <div className="flex bg-gray-100 rounded-lg p-0.5">
                         <button onClick={()=>setMode('list')} className={`p-1.5 rounded-md transition-all ${mode==='list'?'bg-white shadow text-black':'text-gray-400 hover:text-gray-600'}`}><UI.List width={16}/></button>
                         <button onClick={()=>setMode('calendar')} className={`p-1.5 rounded-md transition-all ${mode==='calendar'?'bg-white shadow text-black':'text-gray-400 hover:text-gray-600'}`}><UI.Calendar width={16}/></button>
                     </div>
                 </div>
                 <button className="bg-[#181818] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm">新建</button>
             </div>
             <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-32">
                 {mode === 'list' ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                         <UI.List width={48} className="opacity-20"/>
                         <p className="text-sm">暂无计划</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                         {[...Array(5)].map((_, i) => (
                             <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 min-h-[100px] shadow-sm">
                                 <div className="text-xs font-bold text-gray-400 mb-2">10月{24+i}日</div>
                                 {i===0 && <div className="bg-[#FCD34D] text-black text-xs p-2 rounded font-bold">外景拍摄 Day 1</div>}
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
    );
};

// 5. CALL SHEET
const CallSheetView = () => (
    <div className="h-full bg-[#F7F8FA] p-4 md:p-8 overflow-y-auto pb-32 flex justify-center">
         <div className="w-full max-w-2xl bg-white min-h-[800px] shadow-sm border border-gray-200 p-8 md:p-12 relative">
             <div className="text-center md:text-left mb-8 border-b-4 border-black pb-6">
                 <h1 className="text-3xl md:text-4xl font-black uppercase">Call Sheet</h1>
                 <div className="flex flex-col md:flex-row justify-between mt-2 text-gray-500 font-bold text-xs uppercase">
                    <span>通告单 #12</span>
                    <span>2023.10.24 (DAY 3)</span>
                 </div>
             </div>
             <div className="space-y-6">
                 <div className="bg-gray-50 p-4 rounded border border-gray-100">
                     <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Location</h3>
                     <div className="font-bold">创意产业园 A座</div>
                 </div>
                 <div>
                     <div className="bg-black text-white px-3 py-1 text-xs font-bold uppercase inline-block mb-3">Schedule</div>
                     <div className="space-y-2 text-sm">
                         <div className="flex justify-between border-b border-gray-100 py-2">
                             <span className="font-mono font-bold">06:30</span>
                             <span>全员集合</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-100 py-2">
                             <span className="font-mono font-bold">08:00</span>
                             <span>开机</span>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
    </div>
);

// 6. MORE APPS VIEW
const MoreAppsView = () => {
    const tools = [
        { id: 'batch', label: '批量上传', icon: Icons.Upload, color: 'bg-blue-100 text-blue-600' },
        { id: 'pdf', label: 'PDF导出', icon: UI.Download, color: 'bg-red-100 text-red-600' },
        { id: 'clapper', label: '电子场记', icon: UI.Clapper, color: 'bg-gray-800 text-white' },
        { id: 'trash', label: '回收站', icon: UI.Trash, color: 'bg-gray-100 text-gray-600' },
        { id: 'settings', label: '设置', icon: Icons.Settings, color: 'bg-gray-100 text-gray-600' },
        { id: 'help', label: '帮助中心', icon: UI.Info, color: 'bg-yellow-100 text-yellow-700' },
    ];

    return (
        <div className="h-full bg-[#F7F8FA] p-6 pb-32 overflow-y-auto">
            <h1 className="text-2xl font-black text-gray-900 mb-8">更多应用</h1>
            
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">常用工具</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tools.slice(0, 3).map(tool => (
                        <button key={tool.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 hover:border-[#FCD34D] transition-colors group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                                <tool.icon width={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">系统管理</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tools.slice(3).map(tool => (
                        <button key={tool.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3 hover:border-gray-300 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                                <tool.icon width={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN NAV BAR (Fixed Bottom) ---
const MainNavBar = ({ active, onChange }: { active: EditorTab; onChange: (t: EditorTab) => void }) => {
    const tabs: { id: EditorTab; icon: React.FC<any>; label: string }[] = [
        { id: 'workspace', icon: UI.Users, label: '工作台' },
        { id: 'storyboard', icon: UI.Grid, label: '分镜' },
        { id: 'plan', icon: UI.Calendar, label: '计划' },
        { id: 'callsheet', icon: UI.FileText, label: '通告' },
        { id: 'apps', icon: Icons.Apps, label: '更多' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-gray-100 flex items-center justify-around px-2 md:px-6 pb-4 md:pb-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button 
                        key={t.id} 
                        onClick={() => onChange(t.id)}
                        className="flex flex-col items-center justify-center gap-1 w-full h-full group active:scale-95 transition-transform"
                    >
                        <div className={`
                            h-8 w-14 rounded-full flex items-center justify-center transition-all duration-300
                            ${isActive ? 'bg-black text-[#FCD34D]' : 'bg-transparent text-gray-400 group-hover:bg-gray-50'}
                        `}>
                            <t.icon width={20} height={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-black' : 'text-gray-400'}`}>
                            {t.label}
                        </span>
                    </button>
                )
            })}
        </div>
    );
};

// --- APP SHELL ---
const App: React.FC = () => {
    // Top-level state determines if we are selecting a project or editing one
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    
    // Tab state belongs to the editor view
    const [editorTab, setEditorTab] = useState<EditorTab>('workspace');

    // When opening a project, default to workspace
    const handleOpenProject = (p: Project) => {
        setCurrentProject(p);
        setEditorTab('workspace');
    };

    // Going back clears the project
    const handleBack = () => {
        setCurrentProject(null);
    };

    // --- VIEW LOGIC ---
    // If no project is selected, show the list.
    if (!currentProject) {
        return <ProjectListView onOpenProject={handleOpenProject} />;
    }

    // If a project IS selected, show the Editor Layout (Header + Content + BottomNav)
    return (
        <div className="h-screen w-full bg-white text-[#333] flex flex-col overflow-hidden font-sans">
            {/* Top Bar (Editor Only) */}
            <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-4 z-40 sticky top-0 flex-shrink-0">
                 <div className="flex items-center gap-3">
                     <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                         <Icons.Back width={20}/>
                     </button>
                     <div className="min-w-0">
                         <div className="font-bold text-sm leading-tight truncate max-w-[150px] md:max-w-xs">{currentProject.title}</div>
                         <div className="text-[10px] text-gray-400 leading-tight truncate">上次编辑: {currentProject.updatedAt}</div>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <div className="hidden md:flex items-center gap-2 mr-4">
                         <span className="w-6 h-6 rounded-full bg-gray-200 border border-white -ml-2 first:ml-0"></span>
                         <span className="w-6 h-6 rounded-full bg-gray-300 border border-white -ml-2"></span>
                     </div>
                     <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><UI.Bell width={20}/></button>
                 </div>
            </header>

            {/* Main Content Area (Scrollable with bottom padding) */}
            <main className="flex-1 overflow-hidden relative bg-[#F7F8FA]">
                {editorTab === 'workspace' && <WorkspaceView />}
                {editorTab === 'storyboard' && <StoryboardView projectRatio={currentProject.aspectRatio} />}
                {editorTab === 'plan' && <PlanView />}
                {editorTab === 'callsheet' && <CallSheetView />}
                {editorTab === 'apps' && <MoreAppsView />}
            </main>

            {/* Fixed Bottom Navigation */}
            <MainNavBar active={editorTab} onChange={setEditorTab} />
        </div>
    );
};

export default App;