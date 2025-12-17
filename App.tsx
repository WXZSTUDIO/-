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

declare global {
    interface Window {
        html2canvas: any;
        DeviceOrientationEvent: any;
    }
}

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
                                 <Icons.Folder />
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

                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#18181b] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 animate-[slideUp_0.3s_ease-out]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">新建项目</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><Icons.Close /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5">标题</label>
                                    <input autoFocus className="w-full bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-white focus:border-[#FCD34D] outline-none" placeholder="输入项目名称..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5">类型</label>
                                        <div className="relative">
                                            <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full appearance-none bg-[#27272a] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:border-[#FCD34D] outline-none">
                                                <option value="general">通用视频</option>
                                                <option value="tvc">TVC 广告</option>
                                                <option value="short">剧情短片</option>
                                            </select>
                                            <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
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
                                            <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-white/5 rounded-lg">取消</button>
                                <button onClick={handleCreate} className="flex-1 py-3 text-sm font-bold bg-[#FCD34D] hover:bg-[#fbbf24] text-black rounded-lg">创建</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full bg-[#09090b] flex flex-col font-sans text-white">
            <header className="h-14 bg-[#18181b] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Icons.Back width={20}/></button>
                    <div>
                        <h1 className="font-bold text-sm truncate max-w-[200px] text-white">{activeProject.title}</h1>
                        <p className="text-[10px] text-gray-500">编辑于: {activeProject.updatedAt}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full text-gray-400"><Icons.MoreVertical width={20}/></button>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto pb-36">
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => onOpenTool('storyboard')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Icons.Grid width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">分镜脚本</h3>
                             <p className="text-xs text-gray-500 mt-1">镜头管理与画面</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('plan')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group">
                         <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Icons.Calendar width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">拍摄计划</h3>
                             <p className="text-xs text-gray-500 mt-1">日程统筹与安排</p>
                         </div>
                     </button>
                     <button onClick={() => onOpenTool('callsheet')} className="bg-[#18181b] p-6 rounded-2xl shadow-lg border border-white/5 hover:border-[#FCD34D] transition-all text-left flex flex-col gap-4 group col-span-2">
                         <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Icons.FileText width={24} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-100">每日通告</h3>
                             <p className="text-xs text-gray-500 mt-1">Call Sheet & 集合信息</p>
                         </div>
                     </button>
                 </div>
            </div>
        </div>
    );
};

// 2. STORYBOARD TOOL (Simplified)
const StoryboardView = ({ projectRatio, onBack, shots, setShots }: any) => {
    return (
        <div className={`flex flex-col h-full font-sans bg-[#09090b] text-white`}>
            <div className={`px-4 py-3 flex items-center justify-between z-20 bg-[#18181b] border-b border-white/10 sticky top-0`}>
                 <div className="flex items-center gap-3">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><Icons.Back width={20}/></button>
                     <span className="font-bold text-lg">分镜脚本</span>
                 </div>
                 <button className="bg-[#FCD34D] text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Icons.Play width={14}/> 放映</button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
                分镜功能开发中...
            </div>
        </div>
    );
};

// 3. TOOLS STUBS
const PlanTool = ({ onBack }: { onBack: ()=>void }) => (
    <div className="flex flex-col h-full bg-[#09090b] text-white font-sans">
         <div className="bg-[#18181b] px-4 py-3 flex items-center gap-3 border-b border-white/10">
             <button onClick={onBack}><Icons.Back width={20}/></button><h2 className="text-lg font-bold">拍摄计划</h2>
         </div>
         <div className="flex-1 flex items-center justify-center text-gray-500">计划工具开发中...</div>
    </div>
);

const CallSheetTool = ({ onBack }: { onBack: ()=>void }) => (
    <div className="flex flex-col h-full bg-[#09090b] text-white font-sans">
         <div className="bg-[#18181b] px-4 py-3 flex items-center gap-3 border-b border-white/10">
             <button onClick={onBack}><Icons.Back width={20}/></button><h2 className="text-lg font-bold">每日通告</h2>
         </div>
         <div className="flex-1 flex items-center justify-center text-gray-500">通告单工具开发中...</div>
    </div>
);

// 4. CLAPPER VIEW (REFACTORED - PROFESSIONAL)
const NumberInput = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
    const handleInc = (e: React.MouseEvent) => { e.stopPropagation(); onChange((parseInt(value || '1') + 1).toString()); }
    const handleDec = (e: React.MouseEvent) => { e.stopPropagation(); onChange(Math.max(1, parseInt(value || '1') - 1).toString()); }
    return (
        <div className="bg-[#27272a] h-full flex flex-col justify-center relative group active:bg-[#3f3f46] transition-colors cursor-pointer select-none border border-white/10 rounded-lg overflow-hidden">
             <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10 opacity-50">
                 <button onClick={handleInc} className="p-1 hover:bg-white/10 rounded"><Icons.ChevronDown className="rotate-180 w-3 h-3 text-white"/></button>
                 <button onClick={handleDec} className="p-1 hover:bg-white/10 rounded"><Icons.ChevronDown className="w-3 h-3 text-white"/></button>
             </div>
             <input className="text-3xl font-mono font-bold text-[#FCD34D] w-full bg-transparent outline-none mb-1 text-center pointer-events-none" value={value} readOnly />
             <div className="text-[9px] font-bold text-gray-400 uppercase text-center tracking-wider">{label}</div>
        </div>
    )
}

const ClapperView = ({ onBack, projects }: { onBack: ()=>void, projects: Project[] }) => {
    const [slate, setSlate] = useState({
        roll: 'A001', scene: '1', shot: '1A', take: '1', camera: 'A',
        director: 'WXZ', production: projects[0]?.title || 'UNTITLED', fps: '25', iso: '800'
    });
    const [timecode, setTimecode] = useState('');
    const [isClapped, setIsClapped] = useState(false);
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState('');
    const [lutOn, setLutOn] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const ms = Math.floor(now.getMilliseconds() / 40).toString().padStart(2, '0'); // Approx frames
            setTimecode(`${h}:${m}:${s}:${ms}`);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    const handleClap = () => {
        setIsClapped(true);
        setTimeout(() => setIsClapped(false), 300);
        setSlate(p => ({ ...p, take: (parseInt(p.take) + 1).toString() }));
        setRating(0); // Reset rating for new take
        setNote('');
    };

    return (
        <div className="h-full bg-[#09090b] flex flex-col font-sans relative overflow-hidden text-white">
             {/* Header / Top Bar Stripe - Animated */}
             <div className={`h-16 w-full flex relative z-20 origin-top-left transition-transform duration-150 ${isClapped ? 'rotate-[-5deg] translate-y-2' : ''}`} onClick={handleClap}>
                 <div className="flex-1 bg-white h-full flex relative overflow-hidden border-b-4 border-black">
                      {/* Zebra Stripes */}
                      {Array.from({length: 12}).map((_, i) => (
                          <div key={i} className="h-full w-12 bg-black transform -skew-x-[20deg] translate-x-[-20px] ml-8"></div>
                      ))}
                 </div>
                 {/* Pivot Point Visual */}
                 <div className="absolute left-0 top-full w-full h-1 bg-[#333]"></div>
             </div>

             {/* Info Display Area */}
             <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto pb-[120px]">
                 
                 {/* Top Meta: Timecode & Project */}
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                     <div>
                         <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">时间码 (TC)</div>
                         <div className="text-4xl font-black font-mono text-red-500 tracking-wider tabular-nums">{timecode}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">日期</div>
                         <div className="text-lg font-bold font-mono">{new Date().toLocaleDateString()}</div>
                     </div>
                 </div>

                 {/* Production Info */}
                 <div className="bg-[#18181b] p-4 rounded-xl border border-white/5">
                     <input 
                        className="w-full bg-transparent text-2xl font-black text-center uppercase outline-none text-white placeholder-gray-700"
                        value={slate.production}
                        onChange={e => setSlate({...slate, production: e.target.value})}
                        placeholder="片名"
                     />
                     <div className="flex justify-center gap-8 mt-2">
                         <div className="text-center">
                             <div className="text-[9px] text-gray-500 font-bold uppercase">导演</div>
                             <input className="bg-transparent text-sm font-bold text-center w-24 outline-none text-gray-300" value={slate.director} onChange={e=>setSlate({...slate, director: e.target.value})}/>
                         </div>
                         <div className="text-center">
                             <div className="text-[9px] text-gray-500 font-bold uppercase">摄影</div>
                             <div className="text-sm font-bold text-gray-300">WXZ</div>
                         </div>
                     </div>
                 </div>

                 {/* The Slate Grid */}
                 <div className="grid grid-cols-3 gap-2 h-48">
                     <div className="col-span-1"><NumberInput label="卷" value={slate.roll} onChange={v => setSlate({...slate, roll: v})} /></div>
                     <div className="col-span-1"><NumberInput label="场" value={slate.scene} onChange={v => setSlate({...slate, scene: v})} /></div>
                     <div className="col-span-1"><NumberInput label="次" value={slate.take} onChange={v => setSlate({...slate, take: v})} /></div>
                     <div className="col-span-1"><NumberInput label="镜" value={slate.shot} onChange={v => setSlate({...slate, shot: v})} /></div>
                     <div className="col-span-1 bg-[#27272a] rounded-lg flex flex-col items-center justify-center border border-white/10">
                         <input className="text-2xl font-bold bg-transparent text-center w-full outline-none text-[#FCD34D]" value={slate.camera} onChange={e=>setSlate({...slate, camera: e.target.value})}/>
                         <div className="text-[9px] font-bold text-gray-400 uppercase">机位</div>
                     </div>
                     <div className="col-span-1 bg-[#27272a] rounded-lg flex flex-col items-center justify-center border border-white/10">
                         <div className="text-xl font-bold text-gray-300">{slate.fps}</div>
                         <div className="text-[9px] font-bold text-gray-400 uppercase">帧率</div>
                     </div>
                 </div>

                 {/* Rating & Notes */}
                 <div className="bg-[#18181b] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                     <div className="flex justify-between items-center">
                         <div className="text-[10px] font-bold text-gray-500 uppercase">评分</div>
                         <div className="flex gap-1">
                             {[1,2,3,4,5].map(s => (
                                 <button key={s} onClick={()=>setRating(s)} className={`${rating >= s ? 'text-[#FCD34D]' : 'text-gray-700'}`}>
                                     <Icons.Star width={20} fill={rating >= s ? "currentColor" : "none"}/>
                                 </button>
                             ))}
                         </div>
                     </div>
                     <input 
                        className="w-full bg-[#09090b] rounded p-2 text-sm text-gray-300 outline-none border border-white/5 focus:border-[#FCD34D]"
                        placeholder="添加备注 (例如: 声音不错...)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                     />
                     <div className="flex gap-2 mt-1">
                         <button className="flex-1 py-1.5 bg-[#27272a] rounded text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 hover:text-white">
                             <Icons.Check width={12}/> 标记好条
                         </button>
                         <button className="flex-1 py-1.5 bg-[#27272a] rounded text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1 hover:text-white">
                             <Icons.Trash width={12}/> 标记废条
                         </button>
                     </div>
                 </div>

                 {/* Status Footer */}
                 <div className="flex justify-between items-center px-2">
                     <div className="flex items-center gap-2">
                         <button onClick={()=>setLutOn(!lutOn)} className={`text-[10px] font-bold px-2 py-1 rounded ${lutOn ? 'bg-[#FCD34D] text-black' : 'bg-[#27272a] text-gray-500'}`}>LUT: {lutOn ? '开' : '关'}</button>
                         <div className="text-[10px] font-bold bg-[#27272a] text-gray-400 px-2 py-1 rounded">WB: 5600K</div>
                     </div>
                     <button className="p-2 bg-white text-black rounded hover:bg-gray-200">
                         <Icons.QrCode width={18}/>
                     </button>
                 </div>
             </div>

             {/* Action Bar */}
             <div className="absolute bottom-0 left-0 right-0 bg-[#18181b] border-t border-white/10 pb-[90px] pt-4 px-6 flex justify-between items-center z-30">
                 <button onClick={onBack} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
                     <Icons.Back width={24}/>
                     <span className="text-[10px]">返回</span>
                 </button>
                 <button onClick={handleClap} className="w-16 h-16 bg-[#FCD34D] rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform text-black border-4 border-[#18181b] -mt-8">
                     <Icons.Clapper width={28}/>
                 </button>
                 <div className="w-8"></div> {/* Spacer */}
             </div>
        </div>
    );
};

// 5. SCANNER VIEW (REPLACING LEVEL)
const ScannerView = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [step, setStep] = useState<'capture' | 'edit' | 'result'>('capture');
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [filter, setFilter] = useState<'none' | 'bw' | 'magic'>('magic');
    const [isProcessing, setIsProcessing] = useState(false);

    // Camera Init
    useEffect(() => {
        if (step === 'capture') {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => { if(videoRef.current) videoRef.current.srcObject = stream; })
                .catch(console.error);
        }
        return () => {
            // Cleanup stream
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [step]);

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const vid = videoRef.current;
            const can = canvasRef.current;
            can.width = vid.videoWidth;
            can.height = vid.videoHeight;
            can.getContext('2d')?.drawImage(vid, 0, 0);
            setImgSrc(can.toDataURL('image/jpeg'));
            setStep('edit');
        }
    };

    const applyFilter = (type: 'none' | 'bw' | 'magic') => {
        setFilter(type);
    };

    const getFilterStyle = () => {
        switch(filter) {
            case 'bw': return { filter: 'grayscale(100%) contrast(120%) brightness(110%)' };
            case 'magic': return { filter: 'saturate(130%) contrast(110%) brightness(105%)' }; // Simulating "Magic" scan
            default: return {};
        }
    };

    const handleExport = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert("PDF 已导出 (模拟)");
            setStep('capture');
            setImgSrc(null);
        }, 1500);
    };

    if (step === 'capture') {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <div className="flex-1 relative overflow-hidden bg-gray-900">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                    
                    {/* Simulated Edge Detection Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[70%] h-[60%] border-2 border-green-400/80 shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-pulse relative">
                            {/* Corners */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-green-500"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-green-500"></div>
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-green-500"></div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-green-500"></div>
                            <div className="absolute bottom-2 left-0 right-0 text-center text-green-400 text-xs font-mono bg-black/50">正在检测文档边缘...</div>
                        </div>
                    </div>

                    <button onClick={()=>window.location.reload()} className="absolute top-6 left-6 z-50 p-2 bg-black/40 rounded-full text-white"><Icons.Close/></button>
                </div>
                
                <div className="h-32 bg-black flex items-center justify-center pb-safe">
                    <button onClick={capture} className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 active:scale-95 transition-transform flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white border-2 border-black"></div>
                    </button>
                </div>
                <canvas ref={canvasRef} className="hidden"/>
            </div>
        )
    }

    if (step === 'edit') {
        return (
            <div className="fixed inset-0 bg-[#111] z-50 flex flex-col text-white">
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
                    <button onClick={()=>setStep('capture')} className="text-sm font-bold text-gray-400">重拍</button>
                    <span className="font-bold">编辑扫描</span>
                    <button onClick={()=>setStep('result')} className="text-sm font-bold text-[#FCD34D]">下一步</button>
                </div>
                
                <div className="flex-1 bg-[#000] p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="relative shadow-2xl">
                        {/* Image with Filter Preview */}
                        <img src={imgSrc!} className="max-w-full max-h-[70vh] object-contain transition-all duration-300" style={getFilterStyle()} />
                        
                        {/* Simulated Perspective Crop Handles */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#FCD34D] rounded-full border-2 border-white shadow-lg cursor-move"></div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FCD34D] rounded-full border-2 border-white shadow-lg cursor-move"></div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#FCD34D] rounded-full border-2 border-white shadow-lg cursor-move"></div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#FCD34D] rounded-full border-2 border-white shadow-lg cursor-move"></div>
                    </div>
                </div>

                <div className="h-24 bg-[#18181b] flex items-center justify-center gap-6 pb-safe">
                    <button onClick={()=>applyFilter('none')} className={`flex flex-col items-center gap-1 ${filter==='none'?'text-[#FCD34D]':'text-gray-500'}`}>
                        <div className="w-10 h-10 bg-gray-700 rounded-lg border border-white/10"></div>
                        <span className="text-[10px]">原图</span>
                    </button>
                    <button onClick={()=>applyFilter('magic')} className={`flex flex-col items-center gap-1 ${filter==='magic'?'text-[#FCD34D]':'text-gray-500'}`}>
                        <div className="w-10 h-10 bg-green-900 rounded-lg border border-green-500/50 flex items-center justify-center"><Icons.MagicWand width={16}/></div>
                        <span className="text-[10px]">增强</span>
                    </button>
                    <button onClick={()=>applyFilter('bw')} className={`flex flex-col items-center gap-1 ${filter==='bw'?'text-[#FCD34D]':'text-gray-500'}`}>
                        <div className="w-10 h-10 bg-gray-300 rounded-lg border border-white/10"></div>
                        <span className="text-[10px]">黑白</span>
                    </button>
                </div>
            </div>
        )
    }

    // Result / OCR
    return (
        <div className="fixed inset-0 bg-[#111] z-50 flex flex-col text-white">
             <div className="h-14 flex items-center justify-start gap-4 px-4 border-b border-white/10">
                <button onClick={()=>setStep('edit')}><Icons.Back/></button>
                <span className="font-bold">导出</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-white p-4 rounded-lg mb-6 shadow-xl">
                     <img src={imgSrc!} className="w-full h-auto" style={getFilterStyle()} />
                </div>

                <div className="bg-[#18181b] rounded-xl p-4 border border-white/10">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Icons.Scan width={14}/> 文字识别结果
                    </h3>
                    <div className="text-sm text-gray-300 leading-relaxed font-mono">
                        [模拟文字提取]<br/>
                        项目: WXZ 宣传片<br/>
                        日期: 2023-10-27<br/>
                        场次: 42A - 内景 - 日<br/>
                        备注: 灯光需要调整。
                    </div>
                </div>
            </div>

            <div className="p-4 pb-safe bg-[#18181b] border-t border-white/10">
                <button onClick={handleExport} disabled={isProcessing} className="w-full py-4 bg-[#FCD34D] hover:bg-[#E5B830] text-black font-bold rounded-xl flex items-center justify-center gap-2">
                    {isProcessing ? '处理中...' : <><Icons.Pdf width={20}/> 导出 PDF</>}
                </button>
            </div>
        </div>
    )
}

// 6. MORE APPS VIEW (Updated: Removed Level, Added Scanner)
const MoreAppsView = () => {
    const [activeApp, setActiveApp] = useState<'none' | 'calculator' | 'scanner' | 'food'>('none');
    const [foodResult, setFoodResult] = useState('');
    const [calcDisplay, setCalcDisplay] = useState('0');
    
    const openApp = (tool: any) => {
        if (tool.url) {
            window.open(tool.url, '_blank');
            return;
        }
        if(tool.id === 'food') {
            const foods = ['火锅', '烧烤', '米线', '汉堡', '披萨', '日料', '轻食', '炒饭', 'Tacos'];
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
        } else if (tool.id === 'scanner') {
            setActiveApp('scanner');
        }
    };

    const Calculator = () => {
        const handleBtn = (v: string) => {
            if(v === 'C') setCalcDisplay('0');
            else if(v === '=') {
                try { setCalcDisplay(eval(calcDisplay).toString()); } catch { setCalcDisplay('Error'); }
            } else { setCalcDisplay(calcDisplay === '0' ? v : calcDisplay + v); }
        };
        const btns = ['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
        return (
            <div className="w-full max-w-xs bg-[#18181b] rounded-2xl shadow-2xl p-6 relative border border-white/10 text-white">
                 <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"><Icons.Close/></button>
                <div className="bg-[#27272a] h-16 rounded-xl mb-4 flex items-center justify-end px-4 text-3xl font-mono font-bold text-white overflow-hidden">{calcDisplay}</div>
                <div className="grid grid-cols-4 gap-3">
                    {btns.map(b => (
                        <button key={b} onClick={()=>handleBtn(b)} className={`h-12 rounded-lg font-bold text-lg hover:bg-white/20 transition-colors ${b==='='?'col-span-2 bg-[#FCD34D] hover:bg-[#fbbf24] text-black':'bg-[#27272a] text-white'}`}>{b}</button>
                    ))}
                </div>
            </div>
        );
    };

    const Food = () => (
        <div className="w-full max-w-xs bg-[#18181b] rounded-2xl shadow-2xl p-8 text-center relative border border-white/10 text-white">
             <button onClick={()=>setActiveApp('none')} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"><Icons.Close/></button>
            <h3 className="text-gray-400 font-bold text-sm uppercase mb-4">今天吃什么？</h3>
            <div className="text-5xl font-black text-[#FCD34D] mb-8 min-h-[60px] animate-pulse">{foodResult}</div>
            <div className="flex gap-4">
                <button onClick={()=>openApp({id:'food'})} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-gray-200">换一个</button>
                <button onClick={()=>setActiveApp('none')} className="flex-1 py-3 bg-[#FCD34D] text-black rounded-xl font-bold">决定了</button>
            </div>
        </div>
    );

    const allTools = [
        { id: 'food', label: '今天吃什么', icon: Icons.Food, color: 'bg-orange-500/10 text-orange-400' },
        { id: 'calc', label: '计算器', icon: Icons.Calculator, color: 'bg-white/5 text-gray-400' },
        { id: 'scanner', label: '扫描王', icon: Icons.Scan, color: 'bg-green-500/10 text-green-400' },
        { id: 'creators', label: "Creators' App", icon: Icons.Wifi, color: 'bg-purple-500/10 text-purple-400', url: 'https://creatorscloud.sony.net/' },
        { id: 'monitor', label: 'Monitor+', icon: Icons.Monitor, color: 'bg-orange-500/10 text-orange-400', url: 'https://monitorplus.cc/' },
    ];

    return (
        <div className="h-full bg-[#09090b] text-white p-6 pb-36 overflow-y-auto font-sans relative">
            <h1 className="text-2xl font-black text-white mb-8">更多应用</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {allTools.map(tool => (
                    <button key={tool.id} onClick={()=>openApp(tool)} className="bg-[#18181b] p-4 rounded-xl border border-white/5 shadow-sm flex flex-col items-center gap-3 hover:border-[#FCD34D] transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                            <tool.icon width={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-300">{tool.label}</span>
                    </button>
                ))}
            </div>
            
            {activeApp !== 'none' && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    {activeApp === 'calculator' && <Calculator />}
                    {activeApp === 'scanner' && <ScannerView />}
                    {activeApp === 'food' && <Food />}
                </div>
            )}
        </div>
    );
};

// 7. VIEWFINDER VIEW (REFACTORED - ONE UI)
const ViewfinderView = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [lens, setLens] = useState<'0.5x' | '1x' | '2x'>('1x');
    const [lut, setLut] = useState(false);

    useEffect(() => {
        if (isStarted) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false })
                .then(stream => { if(videoRef.current) videoRef.current.srcObject = stream; })
                .catch(console.error);
        }
        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [isStarted]);

    if (!isStarted) {
        return (
            <div className="fixed inset-0 bg-[#09090b] z-50 flex flex-col p-8 pt-24 text-white font-sans">
                <div className="mb-6 w-16 h-16 rounded-3xl bg-[#1c1c1e] flex items-center justify-center text-[#FCD34D]">
                    <Icons.Video width={32}/>
                </div>
                <h1 className="text-4xl font-light mb-4">启动取景器</h1>
                <p className="text-gray-400 text-lg font-normal leading-relaxed mb-auto">
                    应用需要使用摄像头权限以提供实时画面监看、辅助构图线以及色彩预览功能。<br/><br/>
                    请点击下方按钮继续。
                </p>
                <button 
                    onClick={() => setIsStarted(true)} 
                    className="w-full h-16 bg-[#FCD34D] text-black rounded-[28px] font-bold text-lg mb-12 shadow-lg hover:bg-[#fbbf24] active:scale-[0.98] transition-all"
                >
                    允许并启动
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white font-sans">
            {/* Top Area: View Info (One UI Header Style) */}
            <div className="h-[120px] flex items-end justify-between px-6 pb-4 shrink-0">
                <div>
                     <div className="text-[10px] font-bold text-[#FCD34D] tracking-widest uppercase mb-1">STBY</div>
                     <h1 className="text-4xl font-light">4K <span className="text-lg font-normal text-gray-500">24FPS</span></h1>
                </div>
                <div className="flex gap-2">
                     <span className="px-3 py-1 bg-[#1c1c1e] rounded-full text-xs font-bold text-gray-300">16:9</span>
                     <span className="px-3 py-1 bg-[#1c1c1e] rounded-full text-xs font-bold text-gray-300">RAW</span>
                </div>
            </div>

            {/* Middle Area: Viewport (Rounded Card) */}
            <div className="flex-1 mx-2 relative bg-[#121212] rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/10">
                 <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-transform duration-500 ${lens === '0.5x' ? 'scale-75' : lens === '2x' ? 'scale-[1.5]' : 'scale-100'}`} style={{ filter: lut ? 'contrast(1.1) saturate(1.2) sepia(0.1)' : 'none' }} />
                 
                 {/* Guides Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[50]">
                     {/* Center Crosshair */}
                     <div className="w-6 h-6 relative opacity-80">
                         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white shadow-sm"></div>
                         <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white shadow-sm"></div>
                     </div>
                 </div>
                 {/* Safe Area */}
                 <div className="absolute inset-0 m-auto w-[90%] h-[90%] border border-white/20 rounded-[24px] pointer-events-none z-[50]"></div>
            </div>

            {/* Bottom Area: Controls (One UI Interaction Zone) */}
            <div className="h-[220px] flex flex-col justify-end pb-8 px-6 shrink-0 relative">
                 
                 {/* Lens Simulation (Floating Pills) */}
                 <div className="absolute top-4 left-0 right-0 flex justify-center gap-3">
                     {['0.5x', '1x', '2x'].map((l) => (
                         <button 
                            key={l}
                            onClick={() => setLens(l as any)}
                            className={`h-8 px-4 rounded-full text-xs font-bold transition-all ${lens === l ? 'bg-white text-black scale-110' : 'bg-[#1c1c1e] text-gray-400 hover:bg-[#2c2c2e]'}`}
                         >
                             {l}
                         </button>
                     ))}
                 </div>

                 {/* Main Controls Row */}
                 <div className="flex items-center justify-between mt-auto">
                     {/* Left: Close */}
                     <button onClick={() => setIsStarted(false)} className="w-14 h-14 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors">
                         <Icons.Close width={24}/>
                     </button>

                     {/* Center: Shutter */}
                     <button className="w-20 h-20 rounded-full border-[4px] border-white p-1 active:scale-95 transition-transform group">
                         <div className="w-full h-full bg-red-600 rounded-full group-hover:bg-red-500 transition-colors"></div>
                     </button>

                     {/* Right: LUT Toggle */}
                     <button onClick={() => setLut(!lut)} className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-colors ${lut ? 'bg-[#FCD34D] text-black' : 'bg-[#1c1c1e] text-white'}`}>
                         <span className="text-[10px] font-black">LUT</span>
                         <div className={`w-1.5 h-1.5 rounded-full ${lut ? 'bg-black' : 'bg-gray-600'}`}></div>
                     </button>
                 </div>
            </div>
        </div>
    );
};

// --- MAIN NAV BAR ---
const MainNavBar = ({ active, onChange }: { active: EditorTab; onChange: (t: EditorTab) => void }) => {
    const tabs: { id: EditorTab; icon: React.FC<any>; label: string }[] = [
        { id: 'projects', icon: Icons.Folder, label: '项目' },
        { id: 'viewfinder', icon: Icons.Viewfinder, label: '取景' },
        { id: 'clapper', icon: Icons.Clapper, label: '场记' },
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
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem('wxz_projects');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => { localStorage.setItem('wxz_projects', JSON.stringify(projects)); }, [projects]);

    const handleSelectProject = (p: Project) => { setActiveProject(p); setProjectMode('dashboard'); };
    const handleBackToProjects = () => { setActiveProject(null); };
    const handleBackToDashboard = () => { setProjectMode('dashboard'); };
    const handleOpenTool = (mode: ProjectMode) => { setProjectMode(mode); };

    const renderContent = () => {
        if (editorTab === 'viewfinder') return <ViewfinderView />;
        if (editorTab === 'clapper') return <ClapperView onBack={() => setEditorTab('projects')} projects={projects} />;
        if (editorTab === 'apps') return <MoreAppsView />;
        
        if (!activeProject) {
            return <ProjectManager activeProject={null} projects={projects} setProjects={setProjects} onSelectProject={handleSelectProject} onBack={()=>{}} onOpenTool={()=>{}} />;
        }

        switch (projectMode) {
            case 'storyboard': return <StoryboardView projectRatio={activeProject.aspectRatio} onBack={handleBackToDashboard} shots={[]} setShots={()=>{}} />;
            case 'plan': return <PlanTool onBack={handleBackToDashboard} />;
            case 'callsheet': return <CallSheetTool onBack={handleBackToDashboard} />;
            default: return <ProjectManager activeProject={activeProject} projects={projects} setProjects={setProjects} onSelectProject={()=>{}} onBack={handleBackToProjects} onOpenTool={handleOpenTool} />;
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