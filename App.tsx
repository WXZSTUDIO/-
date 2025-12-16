import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from './constants';
import { geminiService } from './services/geminiService';

// --- Types ---
type Tab = 'food' | 'calc' | 'measure' | 'support';
type MeasureMode = 'compass' | 'level';

interface Option {
  id: string;
  text: string;
  weight: number; 
  desc?: string; 
}

interface HistoryEvent {
    year: string;
    event: string;
}

// --- Shared Components ---

// Dark Glass Card (Replaces M3Card)
const DarkCard = ({ 
    children, 
    className = '', 
    onClick, 
    variant = 'surface' 
}: { 
    children: React.ReactNode, 
    className?: string, 
    onClick?: () => void,
    variant?: 'surface' | 'primary' | 'secondary' | 'tertiary'
}) => {
    let bgStyle = "bg-[#111] border-white/10";
    if (variant === 'primary') bgStyle = "bg-white/10 border-white/20"; 
    
    return (
        <div 
            onClick={onClick}
            className={`
                backdrop-blur-md border rounded-[24px] p-6 transition-all duration-300
                ${bgStyle} ${className} 
                ${onClick ? 'active:scale-[0.98] cursor-pointer hover:bg-white/5' : ''}
            `}
        >
            {children}
        </div>
    );
};

// Reusable Background Grid
const GridBackground = () => (
    <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
        style={{ 
            backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
        }}>
    </div>
);

// --- Feature Components ---

// 1. Food View - Transparent Wireframe & Glowing Text
const PastelWheel = ({ options, rotation, isSpinning, onSpin }: { options: Option[]; rotation: number; isSpinning: boolean; onSpin: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 600; 
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20; 

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

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let startAngle = 0;

    options.forEach((opt, i) => {
      const sliceAngle = (opt.weight / totalWeight) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      
      // No Fill - Transparent
      // Separator lines - Subtle White
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; 
      ctx.lineWidth = 1.5; 
      ctx.stroke();

      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Glowing Text
      ctx.fillStyle = '#FFFFFF'; 
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 8;
      
      const fontSize = sliceAngle < 0.2 ? 24 : 32; 
      ctx.font = `600 ${fontSize}px "Roboto Flex", sans-serif`; 
      ctx.fillText(opt.text, radius - 50, 0);
      ctx.restore();
      startAngle = endAngle;
    });
  }, [options]);

  return (
    <div className="relative w-[256px] h-[256px] flex items-center justify-center my-8 group">
       {/* Decor: Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.05)] pointer-events-none"></div>
      
      {/* STATIC Glass Background Layer - Prevents wobble caused by rotating backdrop filters */}
      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-md z-0"></div>

      {/* Rotating Content Layer - Smoother Easing */}
      <div 
        className="relative w-full h-full rounded-full transition-transform duration-[5000ms] ease-[cubic-bezier(0.2,0,0,1)] will-change-transform z-10"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Center Pin - Minimalist (Scaled down ~20% from 60px to 48px) */}
      <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_10px_white] z-20"></div>
          <div className="absolute w-[48px] h-[48px] rounded-full border border-white/10 bg-black/20 backdrop-blur-md"></div>
      </div>
      
      {/* Indicator - Red Glowing Triangle (Scaled down ~20% from 16px to 13px) */}
      <div className="absolute -top-[13px] left-1/2 transform -translate-x-1/2 z-40">
         <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[13px] border-t-red-500 drop-shadow-[0_0_12px_rgba(255,59,48,0.8)]"></div>
      </div>
    </div>
  );
};

const FoodView = () => {
    const DEFAULT_OPTIONS = [
        { id: '1', text: '火锅', weight: 5 }, 
        { id: '2', text: '烧烤', weight: 5 }, 
        { id: '3', text: '麻辣烫', weight: 5 }
    ];
    const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
    const [newOptionText, setNewOptionText] = useState('');
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Option | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const spinWheel = () => {
        if (isSpinning || options.length < 2) return;
        setIsSpinning(true);
        setWinner(null);
        
        const randomOffset = Math.random() * 360;
        const newRotation = rotation + 1800 + randomOffset;
        setRotation(newRotation);
        
        setTimeout(() => {
            const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
            const actualRotation = newRotation % 360;
            let angleAtPointer = (270 - actualRotation) % 360;
            if (angleAtPointer < 0) angleAtPointer += 360;
            
            let currentAngle = 0;
            let foundWinner = null;
            
            for (const opt of options) {
                const sliceAngle = (opt.weight / totalWeight) * 360;
                if (angleAtPointer >= currentAngle && angleAtPointer < currentAngle + sliceAngle) {
                    foundWinner = opt;
                    break;
                }
                currentAngle += sliceAngle;
            }

            setWinner(foundWinner || options[0]); 
            setIsSpinning(false);
        }, 5000); 
    };

    const addOption = () => {
        if (!newOptionText.trim()) return;
        setIsAdding(true);
        const newId = Date.now().toString();
        setTimeout(() => {
            setOptions([...options, { id: newId, text: newOptionText.trim(), weight: 5 }]);
            setNewOptionText('');
            setIsAdding(false);
        }, 150);
    };

    const removeOption = (id: string) => {
        setOptions(options.filter(o => o.id !== id));
    };

    const randomizeWeights = () => {
        const newOptions = options.map(opt => ({
            ...opt,
            weight: Math.floor(Math.random() * 10) + 1 
        }));
        setOptions(newOptions);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden transition-colors duration-500">
             <GridBackground />
            
             {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32 relative z-10 flex flex-col justify-center">
                <div className="flex flex-col items-center">
                    <PastelWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                    
                    {/* Controls Container */}
                    <div className="w-full mt-8 space-y-6 max-w-xs mx-auto">
                        
                        {/* Primary Action Group */}
                        <div className="flex gap-4 px-2 justify-center">
                             {/* Spin Button */}
                             <button 
                                onClick={spinWheel}
                                disabled={isSpinning || options.length < 2}
                                className={`
                                    h-16 w-32 bg-white text-black rounded-full 
                                    text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]
                                    active:scale-[0.92] active:shadow-none
                                    transition-all duration-300 ease-spring 
                                    disabled:opacity-50 disabled:grayscale
                                    flex items-center justify-center gap-2
                                `}
                            >
                                {isSpinning ? '...' : '开始'}
                            </button>

                            {/* Randomize Button */}
                            <button
                                onClick={randomizeWeights}
                                disabled={isSpinning}
                                className="h-16 w-16 bg-[#1A1A1A] text-white border border-white/20 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-300"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                  <path d="M16 8h.01"></path>
                                  <path d="M8 8h.01"></path>
                                  <path d="M8 16h.01"></path>
                                  <path d="M16 16h.01"></path>
                                  <path d="M12 12h.01"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Input & List Section */}
                        <div className="bg-[#111] border border-white/10 rounded-[24px] p-5">
                             <div className={`
                                flex items-center gap-2 mb-4 bg-black rounded-full px-2 py-1.5 
                                border border-white/10 focus-within:border-white/40 transition-all duration-300
                                ${isAdding ? 'scale-[0.98]' : 'scale-100'}
                             `}>
                                 <input 
                                    type="text" 
                                    value={newOptionText}
                                    onChange={(e) => setNewOptionText(e.target.value)}
                                    placeholder="添加选项"
                                    className="flex-1 h-9 bg-transparent px-3 outline-none text-base text-white placeholder-white/20 font-medium"
                                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                                 />
                                 <button 
                                    onClick={addOption} 
                                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center active:rotate-90 transition-transform hover:bg-gray-200"
                                >
                                     <Icons.Add width={18} height={18} />
                                 </button>
                             </div>

                             <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                                {options.map((opt, i) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => removeOption(opt.id)}
                                        className="
                                            group relative pl-3 pr-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
                                            flex items-center gap-2 border border-white/10 bg-white/5 text-gray-300
                                            hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50
                                            transition-all active:scale-95
                                        "
                                    >
                                        {opt.text}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Winner Reveal - Minimalist Dark Modal */}
            {winner && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl transition-opacity duration-300" 
                    onClick={() => setWinner(null)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xs text-center animate-[springUp_0.6s_both]"
                    >
                        <div className="text-[80px] mb-4">🎉</div>
                        <div className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-4">结果</div>
                        <h3 className="text-5xl font-light text-white mb-12 leading-tight">
                            {winner.text}
                        </h3>
                        <button 
                            onClick={() => setWinner(null)} 
                            className="w-full h-14 border border-white/20 hover:bg-white/10 text-white rounded-full text-sm font-bold tracking-widest uppercase transition-colors"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Calculator View - Dark Grid Style
const CalcView = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
    const [history, setHistory] = useState<string>('');

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) { setDisplay(digit); setWaitingForSecondOperand(false); } 
        else { setDisplay(display === '0' || display === 'Error' ? digit : display + digit); }
    };
    const inputDot = () => {
        if (waitingForSecondOperand) { setDisplay('0.'); setWaitingForSecondOperand(false); return; }
        if (!display.includes('.')) setDisplay(display + '.');
    };
    const clearAll = () => { setDisplay('0'); setHistory(''); setFirstOperand(null); setOperator(null); setWaitingForSecondOperand(false); };
    const deleteLast = () => { if (waitingForSecondOperand) return; setDisplay(display.length === 1 ? '0' : display.slice(0, -1)); };
    const toggleSign = () => { const val = parseFloat(display); if (val !== 0) setDisplay(String(val * -1)); };
    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);
        if (operator && waitingForSecondOperand) { setOperator(nextOperator); return; }
        if (firstOperand === null) { setFirstOperand(inputValue); } else if (operator) {
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
        switch (op) { case '+': return first + second; case '-': return first - second; case '×': return first * second; case '÷': return second === 0 ? 'Error' : first / second; default: return second; }
    };
    const handleEqual = () => {
        if (!operator || firstOperand === null) return;
        const inputValue = parseFloat(display);
        const result = calculate(firstOperand, inputValue, operator);
        setDisplay(String(result).slice(0,12));
        setFirstOperand(null); setOperator(null); setWaitingForSecondOperand(true); setHistory('');
    };
    const handlePress = (btn: string) => {
        if (btn === 'C') clearAll(); else if (btn === '⌫') deleteLast(); else if (btn === '+/-') toggleSign();
        else if (['÷', '×', '-', '+'].includes(btn)) performOperation(btn); else if (btn === '=') handleEqual(); else if (btn === '.') inputDot(); else inputDigit(btn);
    };
    const buttons = [['C', '()', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '-'], ['1', '2', '3', '+'], ['+/-', '0', '.', '=']];

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden">
            <GridBackground />
            
            <div className="flex-1 flex flex-col justify-end items-end px-8 pb-8 relative z-10">
                <div className="text-sm text-gray-500 font-mono mb-2 tracking-widest">{history}</div>
                <div className={`text-[72px] font-light text-white leading-none tracking-tighter ${display.length > 8 ? 'text-[48px]' : ''}`}>{display}</div>
            </div>
            
            {/* Dark Keypad */}
            <div className="px-6 pb-28 pt-4 relative z-10">
                <div className="grid grid-cols-4 gap-4">
                    {buttons.flat().map((btn, i) => {
                         const isAction = btn === '=';
                         const isOp = ['÷','×','-','+'].includes(btn);
                         const isFunc = ['C', '()', '%'].includes(btn);
                         
                         let bg = "bg-[#1A1A1A] text-white border border-white/5"; // Number
                         if (isAction) bg = "bg-red-600 text-white border-none shadow-[0_0_15px_rgba(220,38,38,0.5)]"; // Red for Equals (Compass Needle)
                         if (isOp) bg = "bg-[#2A2A2A] text-white border border-white/5";
                         if (isFunc) bg = "bg-[#2A2A2A] text-gray-300";

                         return (
                             <button key={i} onClick={() => handlePress(btn)} className={`aspect-square rounded-full text-2xl font-light active:scale-90 transition-transform duration-200 flex items-center justify-center ${bg}`}>
                                 {btn === '⌫' ? <Icons.Trash className="w-5 h-5" /> : btn}
                             </button>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

// 3. App Support View - Dark Grid Style
const AppSupportView = () => {
    
    // Author Card - Clean Dark
    const AuthorCard = () => (
        <DarkCard variant="primary" className="mb-4 relative overflow-hidden group">
            <div className="flex flex-col items-center text-center p-2 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    WXZ
                </div>
                <h2 className="text-xl font-bold text-white mb-1">WXZ 出品</h2>
                <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest">
                    工程与设计
                </p>
                <a 
                    href="https://wxzstudio.edgeone.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors text-sm font-medium"
                >
                    访问官网
                </a>
            </div>
        </DarkCard>
    );

    // Exchange Rate - HUD Style
    const ExchangeRateCard = () => {
        const [amount, setAmount] = useState<string>('100');
        const [rates, setRates] = useState<any>({});

        const fetchRates = async () => {
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
                const data = await res.json();
                setRates(data.rates);
            } catch (e) {
                setRates({ CNY: 1, USD: 0.14, JPY: 20.8, KRW: 185.5, TWD: 4.4 });
            }
        };

        useEffect(() => { fetchRates(); }, []);
        const convert = (c: string) => rates[c] ? (parseFloat(amount||'0')*rates[c]).toFixed(2) : '--';

        return (
            <DarkCard className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">实时汇率</h3>
                    <span className="text-[10px] text-red-500 font-bold border border-red-500/30 px-2 py-0.5 rounded">LIVE</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-6 border-b border-white/10 pb-2">
                    <span className="text-lg text-white font-light">CNY</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent flex-1 text-right text-3xl font-light text-white outline-none"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {['USD', 'JPY', 'KRW', 'TWD'].map(cur => (
                        <div key={cur} className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold">{cur}</span>
                            <span className="text-xl text-white font-mono">{convert(cur)}</span>
                        </div>
                    ))}
                </div>
            </DarkCard>
        );
    };

    // Image Converter
    const ImageConverterCard = () => {
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        return (
            <DarkCard className="mb-4">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">图片工具</h3>
                 <button className="w-full h-12 border border-dashed border-white/30 rounded-lg flex items-center justify-center text-sm text-gray-400 hover:border-white hover:text-white transition-colors">
                    上传图片
                 </button>
            </DarkCard>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white">
            <GridBackground />
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-24 pt-12 relative z-10">
                <AuthorCard />
                <ExchangeRateCard />
                <ImageConverterCard />
            </div>
        </div>
    );
};

// 4. Compass & Level View (Unchanged logic, just ensure consistency)
const CompassLevelView = () => {
    const [mode, setMode] = useState<MeasureMode>('compass');
    const [heading, setHeading] = useState(0); 
    const [tiltX, setTiltX] = useState(0); 
    const [tiltY, setTiltY] = useState(0); 
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
            setPermissionGranted(true);
        }
    }, []);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        if (event.alpha !== null) setHeading(event.alpha);
        if (event.beta !== null) setTiltX(event.beta);
        if (event.gamma !== null) setTiltY(event.gamma);
    }, []);

    useEffect(() => {
        if (permissionGranted) {
            window.addEventListener('deviceorientation', handleOrientation);
            return () => window.removeEventListener('deviceorientation', handleOrientation);
        }
    }, [permissionGranted, handleOrientation]);

    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === 'granted') setPermissionGranted(true);
            } catch (e) { console.error(e); }
        }
    };

    const bubbleX = 50 + (tiltY / 45) * 40;
    const bubbleY = 50 + (tiltX / 45) * 40;
    const clampedX = Math.max(10, Math.min(90, bubbleX));
    const clampedY = Math.max(10, Math.min(90, bubbleY));
    const compassStyle = { transform: `rotate(${-heading}deg)` };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white relative overflow-hidden">
             <GridBackground />

             {!permissionGranted && (
                 <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                     <p className="mb-6 text-gray-300">需要指南针权限</p>
                     <button onClick={requestPermission} className="px-6 py-3 bg-white text-black rounded-full font-bold">开启</button>
                 </div>
             )}

             <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                {mode === 'compass' ? (
                    <div className="relative w-72 h-72">
                         <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"></div>
                         <div className="absolute inset-2 transition-transform duration-200 ease-out will-change-transform" style={compassStyle}>
                             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-red-600 rounded-full shadow-[0_0_10px_red]"></div>
                             <div className="absolute top-7 left-1/2 -translate-x-1/2 text-red-500 font-bold text-lg">N</div>
                             <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 text-xs font-medium">东</div>
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-medium">南</div>
                             <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-xs font-medium">西</div>
                             {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                                 <div key={deg} className="absolute top-0 left-1/2 w-[1px] h-full origin-center pointer-events-none" style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}>
                                     <div className="w-[1px] h-3 bg-white/20 mx-auto mt-0"></div>
                                 </div>
                             ))}
                         </div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                             <div className="text-6xl font-light tracking-tighter">{Math.round(heading)}°</div>
                             <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">磁北</div>
                         </div>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12 items-center">
                        <div className="relative w-64 h-64 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner flex items-center justify-center">
                            <div className="absolute w-full h-[1px] bg-white/10"></div>
                            <div className="absolute h-full w-[1px] bg-white/10"></div>
                            <div className="absolute w-32 h-32 rounded-full border border-white/10"></div>
                            <div 
                                className="absolute w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)_inset]"
                                style={{ left: `${clampedX}%`, top: `${clampedY}%`, transform: 'translate(-50%, -50%)' }}
                            ></div>
                            <div className="absolute text-center pointer-events-none z-20 mix-blend-difference">
                                <div className="text-5xl font-light">{Math.round(Math.abs(tiltX))}°</div>
                            </div>
                        </div>
                    </div>
                )}
             </div>

             <div className="pb-32 flex justify-center z-20">
                 <div className="bg-[#111] rounded-full p-1 flex shadow-lg border border-white/10">
                     <button onClick={() => setMode('compass')} className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === 'compass' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}>指南针</button>
                     <button onClick={() => setMode('level')} className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${mode === 'level' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}>水平仪</button>
                 </div>
             </div>
        </div>
    );
};

// 5. Dark Minimal Navbar
const M3NavBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'measure', icon: Icons.Compass, label: '工具箱' },
        { id: 'calc', icon: Icons.Calculator, label: '计算器' },
        { id: 'support', icon: Icons.Apps, label: '应用' }, 
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#050505] border-t border-white/5 z-50 flex items-center justify-around px-4 pb-4">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button 
                        key={t.id} 
                        onClick={() => onChange(t.id)}
                        className="flex flex-col items-center justify-center gap-2 w-16 group"
                    >
                        <div className={`
                            h-10 w-16 rounded-full flex items-center justify-center transition-all duration-300
                            ${isActive ? 'bg-[#333] shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'bg-transparent'}
                        `}>
                            <t.icon 
                                width={20} 
                                height={20} 
                                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`} 
                                strokeWidth={2}
                            />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                            {t.label}
                        </span>
                    </button>
                )
            })}
        </div>
    );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('food'); // Default to Food

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans bg-[#050505] text-white flex flex-col items-center fixed inset-0 overscroll-none">
        <div className="w-full h-full max-w-md bg-[#050505] flex flex-col relative shadow-2xl md:my-0 overflow-hidden">
            <main className="flex-1 overflow-hidden relative flex flex-col w-full">
                {activeTab === 'food' && <FoodView />}
                {activeTab === 'calc' && <CalcView />}
                {activeTab === 'measure' && <CompassLevelView />}
                {activeTab === 'support' && <AppSupportView />}
            </main>
            <M3NavBar active={activeTab} onChange={setActiveTab} />
        </div>
        <style>{`
            @keyframes springUp {
                0% { transform: translateY(50px) scale(0.9); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
        `}</style>
    </div>
  );
};

export default App;