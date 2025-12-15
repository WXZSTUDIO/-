import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './constants';

// --- Types ---
type Tab = 'food' | 'calc' | 'flashlight' | 'info';

interface Option {
  id: string;
  text: string;
  desc?: string; 
}

// --- Common One UI Components ---

// 1. One UI Header - Implements "Viewing Area"
// Expands at the top, typically takes up top 20-30% of screen visually
const OneUIHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="w-full pt-16 pb-6 px-8 flex flex-col justify-end min-h-[140px] flex-none z-10 bg-[#F2F2F2]">
        {subtitle && <span className="text-sm font-medium text-one-text-sub mb-1 tracking-wide">{subtitle}</span>}
        <h1 className="text-[40px] font-light text-one-text-header leading-tight tracking-tight">{title}</h1>
    </div>
);

// 2. One UI Card - Standard container
const OneUICard = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-one-surface rounded-one shadow-one-subtle p-5 ${className} ${onClick ? 'active:scale-[0.98] transition-transform duration-200' : ''}`}
    >
        {children}
    </div>
);

// --- Feature Components ---

// 1. Food View - Wheel
const PastelWheel = ({ options, rotation, isSpinning, onSpin }: { options: Option[]; rotation: number; isSpinning: boolean; onSpin: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 600; 
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10; 

  // One UI Pastel Palette
  const colors = [
      '#FFC1C1', // Pastel Red
      '#FFE4B5', // Pastel Orange
      '#FFFACD', // Pastel Yellow
      '#E0F8D0', // Pastel Green
      '#D0E8FF', // Pastel Blue
      '#E6E6FA'  // Pastel Purple
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    if (options.length === 0) return;

    const arc = (2 * Math.PI) / options.length;

    options.forEach((opt, i) => {
      const angle = i * arc;
      ctx.save();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4; 
      ctx.stroke();

      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#444'; 
      ctx.font = '500 32px "Roboto", sans-serif'; 
      ctx.fillText(opt.text, radius - 50, 0);
      
      ctx.restore();
    });
  }, [options]);

  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center my-6">
      <div className="absolute inset-[-8px] rounded-full border-[8px] border-white shadow-one-subtle pointer-events-none"></div>
      <div 
        className="relative w-full h-full rounded-full transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0.85,0.35,1)] will-change-transform z-10 overflow-hidden"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60px] h-[60px] rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
             <div className="w-2 h-2 rounded-full bg-one-primary"></div>
          </div>
      </div>
      <div className="absolute -top-[16px] left-1/2 transform -translate-x-1/2 z-40">
         <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-one-primary"></div>
      </div>
    </div>
  );
};

const FoodView = () => {
    const DEFAULT_OPTIONS = [
        { id: '1', text: '火锅' }, { id: '2', text: '烧烤' }, 
        { id: '3', text: '拉面' }, { id: '4', text: '汉堡' }, { id: '5', text: '沙拉' }
    ];
    const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Option | null>(null);

    const spinWheel = () => {
        if (isSpinning || options.length < 2) return;
        setIsSpinning(true);
        setWinner(null);
        const newRotation = rotation + 1800 + Math.random() * 360;
        setRotation(newRotation);
        setTimeout(() => {
            const actualRotation = newRotation % 360;
            const sliceDeg = 360 / options.length;
            let angleAtPointer = (270 - actualRotation) % 360;
            if (angleAtPointer < 0) angleAtPointer += 360;
            const winningIndex = Math.floor(angleAtPointer / sliceDeg);
            setWinner(options[winningIndex]);
            setIsSpinning(false);
        }, 5000); 
    };

    return (
        <div className="flex flex-col h-full bg-one-bg">
            <OneUIHeader title="今天吃什么" subtitle="Decision Maker" />
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32">
                <div className="flex flex-col items-center">
                    <PastelWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                    
                    {/* Action Area - One Handed Reach */}
                    <div className="w-full mt-6 space-y-4">
                        <button 
                            onClick={spinWheel}
                            disabled={isSpinning}
                            className="w-full h-14 bg-one-primary text-white rounded-one text-lg font-medium shadow-one-subtle active:scale-[0.98] transition-transform"
                        >
                            {isSpinning ? '...' : '开始决定'}
                        </button>
                        
                        <div className="bg-white rounded-one p-4 shadow-one-subtle">
                             <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-bold text-one-text-sub uppercase">选项 ({options.length})</span>
                                 <button onClick={() => setOptions(DEFAULT_OPTIONS)} className="text-sm text-one-primary font-medium">重置</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {options.map(opt => (
                                    <span key={opt.id} className="bg-one-bg text-one-text-main px-3 py-1.5 rounded-full text-sm">
                                        {opt.text}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - One UI Dialog Style */}
            {winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 smart-dialog-mask" onClick={() => setWinner(null)}>
                    <div className="w-full max-w-xs bg-white rounded-one-lg p-8 text-center shadow-one-float scale-in-center">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h3 className="text-2xl font-bold text-one-text-main mb-2">{winner.text}</h3>
                        <p className="text-one-text-sub mb-8">Fate has spoken!</p>
                        <button 
                            onClick={() => setWinner(null)}
                            className="w-full h-12 bg-one-control text-one-text-main rounded-one-sm font-medium"
                        >
                            好的
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Calculator View - One UI Style
const CalcView = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
    const [history, setHistory] = useState<string>('');

    // ... Logic remains largely same, just updated visual state ...
    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' || display === 'Error' ? digit : display + digit);
        }
    };

    const inputDot = () => {
        if (waitingForSecondOperand) {
            setDisplay('0.');
            setWaitingForSecondOperand(false);
            return;
        }
        if (!display.includes('.')) setDisplay(display + '.');
    };

    const clearAll = () => {
        setDisplay('0');
        setHistory('');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const deleteLast = () => {
        if (waitingForSecondOperand) return;
        setDisplay(display.length === 1 ? '0' : display.slice(0, -1));
    };

    const toggleSign = () => {
        const val = parseFloat(display);
        if (val !== 0) setDisplay(String(val * -1));
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);
        if (operator && waitingForSecondOperand) {
            setOperator(nextOperator);
            return;
        }
        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            const resStr = String(result).slice(0,12);
            setDisplay(resStr);
            setFirstOperand(parseFloat(resStr));
        }
        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
        setHistory(`${inputValue} ${nextOperator}`);
    };

    const calculate = (first: number, second: number, op: string) => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '×': return first * second;
            case '÷': return second === 0 ? 'Error' : first / second;
            default: return second;
        }
    };

    const handleEqual = () => {
        if (!operator || firstOperand === null) return;
        const inputValue = parseFloat(display);
        const result = calculate(firstOperand, inputValue, operator);
        const resStr = String(result).slice(0,12);
        setDisplay(resStr);
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(true);
        setHistory('');
    };

    const handlePress = (btn: string) => {
        if (btn === 'C') clearAll();
        else if (btn === '⌫') deleteLast();
        else if (btn === '+/-') toggleSign();
        else if (btn === '%') { /* simplified */ }
        else if (['÷', '×', '-', '+'].includes(btn)) performOperation(btn);
        else if (btn === '=') handleEqual();
        else if (btn === '.') inputDot();
        else inputDigit(btn);
    };

    const buttons = [
        ['C', '()', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['+/-', '0', '.', '=']
    ];

    return (
        <div className="flex flex-col h-full bg-one-bg">
            {/* Display Area - Top Focus */}
            <div className="flex-1 flex flex-col justify-end items-end px-8 pb-8 pt-12">
                <div className="text-xl text-one-text-sub font-light mb-2 min-h-[1.75rem]">{history}</div>
                <div className={`text-[64px] font-light text-one-text-main leading-none tracking-tight ${display.length > 8 ? 'text-[48px]' : ''}`}>
                    {display}
                </div>
            </div>

            {/* Keypad Area - Bottom Reachability */}
            {/* One UI Divider */}
            <div className="w-full h-px bg-gray-200 mx-4 mb-4"></div>

            <div className="px-4 pb-32">
                <div className="grid grid-cols-4 gap-3">
                    {buttons.flat().map((btn, i) => {
                         const isAction = btn === '=';
                         const isOp = ['÷','×','-','+'].includes(btn);
                         const isGreenOp = ['C', '()', '%'].includes(btn);
                         
                         let bgClass = "bg-[#F2F2F2] active:bg-[#D4D4D4]"; // Default num
                         let textClass = "text-black";
                         
                         if (isAction) {
                             bgClass = "bg-one-accent active:bg-[#00A396]"; 
                             textClass = "text-white";
                         } else if (isOp) {
                             bgClass = "bg-[#F2F2F2] active:bg-[#D4D4D4]";
                             textClass = "text-one-accent";
                         } else if (isGreenOp) {
                             textClass = "text-one-accent";
                         }

                         // Use 'flex' to center content in button
                         return (
                             <button
                                key={i}
                                onClick={() => handlePress(btn)}
                                className={`
                                    aspect-square rounded-[24px] text-2xl font-normal transition-all duration-200
                                    flex items-center justify-center
                                    ${bgClass} ${textClass}
                                `}
                             >
                                 {btn === '⌫' ? <Icons.Trash className="w-6 h-6" /> : btn}
                             </button>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

// 3. System Info View - "Device Care" Style
const SystemInfoView = () => {
    const [batteryLevel, setBatteryLevel] = useState<string>('--');
    const [score, setScore] = useState(98); // Fake score for UI

    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(Math.round(battery.level * 100) + '%');
            });
        }
    }, []);

    const InfoRow = ({ icon: Icon, label, value }: any) => (
        <OneUICard className="flex items-center justify-between mb-3 !py-4 !px-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EBF6FF] flex items-center justify-center text-one-primary">
                    <Icon width={20} height={20} />
                </div>
                <span className="text-base font-medium text-one-text-main">{label}</span>
            </div>
            <span className="text-base text-one-text-sub font-normal">{value}</span>
        </OneUICard>
    );

    return (
        <div className="flex flex-col h-full bg-one-bg">
            <OneUIHeader title="设备维护" subtitle="Device Care" />

            {/* Top Score Circle */}
            <div className="flex justify-center py-8">
                <div className="w-48 h-48 rounded-full border-[8px] border-white flex flex-col items-center justify-center shadow-one-subtle bg-white">
                    <div className="text-sm text-one-text-sub mb-1">状态</div>
                    <div className="text-5xl font-light text-one-primary">{score}</div>
                    <div className="text-sm text-one-primary mt-2 font-medium">极佳</div>
                </div>
            </div>

            <div className="w-full px-8 mb-6">
                 <button className="w-full h-12 bg-one-primary text-white rounded-one font-medium shadow-one-subtle active:scale-[0.98] transition-transform">
                     立即优化
                 </button>
            </div>

            {/* Info List */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar">
                <h3 className="text-sm font-bold text-one-text-sub px-4 mb-3 uppercase tracking-wider">系统</h3>
                <InfoRow icon={Icons.Battery} label="电池" value={batteryLevel} />
                <InfoRow icon={Icons.Memory} label="内存" value="4 GB / 8 GB" />
                <InfoRow icon={Icons.Monitor} label="显示" value={`${window.screen.width} x ${window.screen.height}`} />
                <InfoRow icon={Icons.Wifi} label="网络" value={navigator.onLine ? '在线' : '离线'} />
            </div>
        </div>
    );
};

// 4. Flashlight View - Quick Settings Toggle Style
const FlashlightView = () => {
    const [isOn, setIsOn] = useState(false);
    const videoTrackRef = useRef<MediaStreamTrack | null>(null);

    const toggle = async () => {
        const newState = !isOn;
        setIsOn(newState);
        if (videoTrackRef.current) {
            try {
                await videoTrackRef.current.applyConstraints({
                    advanced: [{ torch: newState } as any]
                });
            } catch (e) { console.error(e); }
        } else if (newState) {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                const track = stream.getVideoTracks()[0];
                videoTrackRef.current = track;
                const caps = track.getCapabilities() as any;
                if (caps.torch) await track.applyConstraints({ advanced: [{ torch: true } as any] });
             } catch(e) { console.warn(e); }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] transition-colors duration-500">
             {/* Header Dark Mode */}
            <div className="w-full pt-16 pb-6 px-8 flex flex-col justify-end min-h-[140px] flex-none z-10">
                <h1 className="text-[40px] font-light text-white leading-tight tracking-tight">手电筒</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center pb-40">
                {/* Big Toggle Switch */}
                <button 
                    onClick={toggle}
                    className={`
                        relative w-48 h-80 rounded-[60px] border-[4px] border-[#333] transition-all duration-300
                        ${isOn ? 'bg-white shadow-[0_0_80px_rgba(255,255,255,0.4)]' : 'bg-[#1C1C1C]'}
                    `}
                >
                    {/* Switch Knob */}
                    <div className={`
                        absolute left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full bg-[#333] transition-all duration-300
                        flex items-center justify-center
                        ${isOn ? 'top-8 bg-black' : 'bottom-8'}
                    `}>
                        <div className={`w-2 h-2 rounded-full ${isOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                </button>

                <div className="mt-12 text-gray-500 font-medium tracking-widest text-sm uppercase">
                    {isOn ? '已开启' : '已关闭'}
                </div>
            </div>
        </div>
    );
};

// 5. Navigation Bar - Floating Capsule Style
const OneUINav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'flashlight', icon: Icons.Flashlight, label: '灯光' },
        { id: 'calc', icon: Icons.Calculator, label: '计算' },
        { id: 'info', icon: Icons.Info, label: '本机' }, 
    ];

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-one-float rounded-full px-6 py-3 flex items-center gap-6">
                {tabs.map((t) => {
                    const isActive = active === t.id;
                    return (
                        <button 
                            key={t.id} 
                            onClick={() => onChange(t.id)}
                            className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform w-12"
                        >
                            <div className={`transition-all duration-300 p-2 rounded-full ${isActive ? 'bg-one-primary text-white' : 'text-gray-400'}`}>
                                <t.icon width={22} height={22} strokeWidth={2} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calc');

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans bg-one-bg text-one-text-main flex flex-col items-center fixed inset-0 overscroll-none">
        <div className="w-full h-full max-w-md bg-one-bg flex flex-col relative shadow-2xl md:my-0 overflow-hidden">
            <main className="flex-1 overflow-hidden relative flex flex-col w-full">
                {activeTab === 'food' && <FoodView />}
                {activeTab === 'calc' && <CalcView />}
                {activeTab === 'flashlight' && <FlashlightView />}
                {activeTab === 'info' && <SystemInfoView />}
            </main>
            <OneUINav active={activeTab} onChange={setActiveTab} />
        </div>
    </div>
  );
};

export default App;