import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from './constants';
import { geminiService } from './services/geminiService';

// --- Types ---
type Tab = 'food' | 'calc' | 'flashlight' | 'support';

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

// --- Common One UI Components ---

const OneUIHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="w-full pt-16 pb-6 px-8 flex flex-col justify-end min-h-[140px] flex-none z-10 bg-[#F2F2F2]">
        {subtitle && <span className="text-sm font-medium text-one-text-sub mb-1 tracking-wide">{subtitle}</span>}
        <h1 className="text-[40px] font-light text-one-text-header leading-tight tracking-tight">{title}</h1>
    </div>
);

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

  const colors = [
      '#FFC1C1', '#FFE4B5', '#FFFACD', '#E0F8D0', '#D0E8FF', '#E6E6FA'
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
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4; 
      ctx.stroke();

      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#444'; 
      const fontSize = sliceAngle < 0.2 ? 24 : 32; 
      ctx.font = `500 ${fontSize}px "Roboto", sans-serif`; 
      ctx.fillText(opt.text, radius - 50, 0);
      ctx.restore();
      startAngle = endAngle;
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
        { id: '1', text: '火锅', weight: 5 }, 
        { id: '2', text: '烧烤', weight: 5 }, 
        { id: '3', text: '麻辣烫', weight: 5 }
    ];
    const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
    const [newOptionText, setNewOptionText] = useState('');
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Option | null>(null);

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
        const newId = Date.now().toString();
        setOptions([...options, { id: newId, text: newOptionText.trim(), weight: 5 }]);
        setNewOptionText('');
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
        <div className="flex flex-col h-full bg-one-bg pt-10">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32">
                <div className="flex flex-col items-center">
                    <PastelWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                    <div className="w-full mt-2 space-y-4">
                        <div className="flex gap-3">
                             <button 
                                onClick={spinWheel}
                                disabled={isSpinning || options.length < 2}
                                className="flex-1 h-12 bg-one-primary text-white rounded-one text-lg font-medium shadow-one-subtle active:scale-[0.98] transition-transform disabled:opacity-50"
                            >
                                {isSpinning ? '...' : '开始决定'}
                            </button>
                            <button
                                onClick={randomizeWeights}
                                disabled={isSpinning}
                                className="w-12 h-12 bg-white text-one-primary border border-one-primary rounded-one flex items-center justify-center shadow-one-subtle active:scale-[0.95]"
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
                        <div className="bg-white rounded-one p-5 shadow-one-subtle">
                             <div className="flex items-center gap-2 mb-4">
                                 <input 
                                    type="text" 
                                    value={newOptionText}
                                    onChange={(e) => setNewOptionText(e.target.value)}
                                    placeholder="添加新选项..."
                                    className="flex-1 h-12 bg-one-bg rounded-one-sm px-4 outline-none text-one-text-main placeholder-gray-400"
                                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                                 />
                                 <button onClick={addOption} className="w-12 h-12 rounded-one-sm bg-one-control text-one-primary flex items-center justify-center hover:bg-gray-200">
                                     <Icons.Add />
                                 </button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {options.map(opt => (
                                    <div key={opt.id} className="relative group">
                                        <span className={`bg-one-bg text-one-text-main pl-3 pr-2 py-1.5 rounded-full text-sm flex items-center gap-1 border ${opt.weight > 7 ? 'border-one-primary' : 'border-transparent'} transition-all`}>
                                            {opt.text} 
                                            <span className="text-[10px] text-gray-400 font-mono ml-1">x{opt.weight}</span>
                                            <button onClick={() => removeOption(opt.id)} className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500">
                                                <Icons.Close width={14} height={14} />
                                            </button>
                                        </span>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{options.length} 个选项</span>
                                 <button onClick={() => setOptions(DEFAULT_OPTIONS)} className="text-xs text-one-primary font-medium px-2 py-1">重置默认</button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 smart-dialog-mask" onClick={() => setWinner(null)}>
                    <div className="w-full max-w-xs bg-white rounded-one-lg p-8 text-center shadow-one-float scale-in-center">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h3 className="text-2xl font-bold text-one-text-main mb-2">{winner.text}</h3>
                        <p className="text-one-text-sub mb-8">Fate has spoken! <br/><span className="text-xs opacity-60">(Weight: {winner.weight})</span></p>
                        <button onClick={() => setWinner(null)} className="w-full h-12 bg-one-control text-one-text-main rounded-one-sm font-medium">好的</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Calculator View
const CalcView = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
    const [history, setHistory] = useState<string>('');

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' || display === 'Error' ? digit : display + digit);
        }
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
        if (btn === 'C') clearAll(); else if (btn === '⌫') deleteLast(); else if (btn === '+/-') toggleSign(); else if (btn === '%') {} 
        else if (['÷', '×', '-', '+'].includes(btn)) performOperation(btn); else if (btn === '=') handleEqual(); else if (btn === '.') inputDot(); else inputDigit(btn);
    };
    const buttons = [['C', '()', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '-'], ['1', '2', '3', '+'], ['+/-', '0', '.', '=']];

    return (
        <div className="flex flex-col h-full bg-one-bg">
            <div className="flex-1 flex flex-col justify-end items-end px-8 pb-2 pt-4">
                <div className="text-xl text-one-text-sub font-light mb-1 min-h-[1.5rem]">{history}</div>
                <div className={`text-[56px] font-light text-one-text-main leading-none tracking-tight ${display.length > 8 ? 'text-[42px]' : ''}`}>{display}</div>
            </div>
            <div className="w-full h-px bg-gray-200 mx-4 mb-2"></div>
            <div className="px-4 pb-28">
                <div className="grid grid-cols-4 gap-2.5">
                    {buttons.flat().map((btn, i) => {
                         const isAction = btn === '=';
                         const isOp = ['÷','×','-','+'].includes(btn);
                         const isGreenOp = ['C', '()', '%'].includes(btn);
                         return (
                             <button key={i} onClick={() => handlePress(btn)} className={`aspect-square rounded-[24px] text-2xl font-normal transition-all duration-200 flex items-center justify-center ${isAction ? "bg-one-accent active:bg-[#00A396] text-white" : isOp ? "bg-[#F2F2F2] active:bg-[#D4D4D4] text-one-accent" : isGreenOp ? "bg-[#F2F2F2] active:bg-[#D4D4D4] text-one-accent" : "bg-[#F2F2F2] active:bg-[#D4D4D4] text-black"}`}>
                                 {btn === '⌫' ? <Icons.Trash className="w-6 h-6" /> : btn}
                             </button>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

// 3. App Support View (New)
const AppSupportView = () => {
    
    // -- Sub Component: Author Card --
    const AuthorCard = () => (
        <OneUICard className="mb-4">
            <div className="flex flex-col items-center text-center p-2">
                <div className="w-16 h-16 bg-one-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-md">
                    WXZ
                </div>
                <h2 className="text-xl font-bold text-one-text-header mb-1">感谢作者</h2>
                <p className="text-sm text-one-text-sub mb-6">衷心感谢开发者 WXZ Studio 的贡献！<br/>为您提供便捷的工具体验。</p>
                <a 
                    href="https://wxzstudio.edgeone.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full h-12 bg-one-control text-one-primary font-semibold rounded-one-sm flex items-center justify-center active:scale-95 transition-transform"
                >
                    访问官方网站
                </a>
            </div>
        </OneUICard>
    );

    // -- Sub Component: Exchange Rate --
    const ExchangeRateCard = () => {
        const [amount, setAmount] = useState<string>('100');
        const [rates, setRates] = useState<any>({});
        const [loading, setLoading] = useState(true);

        const fetchRates = async () => {
            try {
                // Free API, might be rate limited or blocked in some envs. Fallback to mock if fetch fails.
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
                const data = await res.json();
                setRates(data.rates);
                setLoading(false);
            } catch (e) {
                console.warn("Exchange Rate API failed, using fallback.");
                // Fallback Mock Data (Approximate)
                setRates({ CNY: 1, USD: 0.14, JPY: 20.8, KRW: 185.5, TWD: 4.4 });
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchRates();
            const interval = setInterval(fetchRates, 300000); // 5 mins
            return () => clearInterval(interval);
        }, []);

        const convert = (currency: string) => {
            if (!rates[currency]) return '--';
            const val = parseFloat(amount || '0') * rates[currency];
            return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        };

        return (
            <OneUICard className="mb-4">
                <h3 className="text-lg font-bold text-one-text-header mb-4 flex items-center gap-2">
                    <span className="text-one-primary">¥</span> 实时汇率 (CNY基准)
                </h3>
                <div className="flex flex-col gap-4">
                    <div className="bg-one-bg rounded-one-sm px-4 py-2 flex items-center">
                        <span className="font-bold text-gray-500 mr-2">CNY</span>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-transparent w-full outline-none text-right font-mono text-xl text-one-text-header"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {['USD', 'JPY', 'KRW', 'TWD'].map(cur => (
                            <div key={cur} className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col items-center">
                                <span className="text-xs font-bold text-gray-400 mb-1">{cur}</span>
                                <span className="text-lg font-medium text-one-text-main">
                                    {loading ? '...' : convert(cur)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="text-[10px] text-gray-400 text-center">每5分钟自动刷新 • 数据仅供参考</div>
                </div>
            </OneUICard>
        );
    };

    // -- Sub Component: Image Converter --
    const ImageConverterCard = () => {
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const [preview, setPreview] = useState<string | null>(null);
        const [format, setFormat] = useState('png');
        const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
        const [processing, setProcessing] = useState(false);

        const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setPreview(url);
                setConvertedUrl(null);
            }
        };

        const handleConvert = () => {
            if (!preview) return;
            setProcessing(true);
            
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.drawImage(img, 0, 0);
                    const mime = `image/${format === 'jpg' ? 'jpeg' : format}`;
                    const dataUrl = canvas.toDataURL(mime, 0.9);
                    setTimeout(() => { // Simulate slight delay for effect
                        setConvertedUrl(dataUrl);
                        setProcessing(false);
                    }, 800);
                }
            };
            img.src = preview;
        };

        return (
            <OneUICard className="mb-4">
                 <h3 className="text-lg font-bold text-one-text-header mb-4 flex items-center gap-2">
                    <Icons.Graphic width={20} /> 图片格式转换
                </h3>
                
                {!selectedFile ? (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-one-primary hover:bg-blue-50 transition-colors">
                        <Icons.Upload className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">点击上传图片</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                            <img src={preview!} alt="preview" className="h-full object-contain" />
                            <button 
                                onClick={() => { setSelectedFile(null); setPreview(null); setConvertedUrl(null); }}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                            >
                                <Icons.Close width={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <select 
                                value={format} 
                                onChange={(e) => { setFormat(e.target.value); setConvertedUrl(null); }}
                                className="h-10 px-3 bg-one-bg rounded-lg text-sm font-medium outline-none"
                            >
                                <option value="png">PNG</option>
                                <option value="jpg">JPG</option>
                                <option value="webp">WEBP</option>
                            </select>
                            
                            {convertedUrl ? (
                                <a 
                                    href={convertedUrl} 
                                    download={`converted.${format}`} 
                                    className="flex-1 h-10 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <Icons.Download width={18} /> 下载
                                </a>
                            ) : (
                                <button 
                                    onClick={handleConvert}
                                    disabled={processing}
                                    className="flex-1 h-10 bg-one-primary text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
                                >
                                    {processing ? '转换中...' : '开始转换'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </OneUICard>
        );
    };

    // -- Sub Component: History --
    const HistoryCard = () => {
        const [events, setEvents] = useState<HistoryEvent[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            geminiService.getHistoryOnThisDay().then(data => {
                setEvents(data);
                setLoading(false);
            });
        }, []);

        return (
            <OneUICard className="mb-4">
                <h3 className="text-lg font-bold text-one-text-header mb-4">📜 历史上的今天</h3>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-one-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.length > 0 ? events.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                <span className="font-mono font-bold text-one-primary text-sm min-w-[3rem]">{item.year}</span>
                                <p className="text-sm text-one-text-main leading-snug">{item.event}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center">暂无数据</p>
                        )}
                    </div>
                )}
            </OneUICard>
        );
    };

    return (
        <div className="flex flex-col h-full bg-one-bg">
            <OneUIHeader title="应用支持" subtitle="Tools & Info" />
            <div className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar">
                <AuthorCard />
                <ExchangeRateCard />
                <ImageConverterCard />
                <HistoryCard />
            </div>
        </div>
    );
};

// 4. Flashlight View
const FlashlightView = () => {
    const [isOn, setIsOn] = useState(false);
    const toggle = () => setIsOn(!isOn);
    return (
        <div className="flex flex-col h-full bg-[#121212] transition-colors duration-500">
            <div className="w-full pt-16 pb-6 px-8 flex flex-col justify-end min-h-[140px] flex-none z-10">
                <h1 className="text-[40px] font-light text-white leading-tight tracking-tight">手电筒</h1>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center pb-40">
                <button onClick={toggle} className={`relative w-48 h-80 rounded-[60px] border-[4px] border-[#333] transition-all duration-300 ${isOn ? 'bg-white shadow-[0_0_80px_rgba(255,255,255,0.4)]' : 'bg-[#1C1C1C]'}`}>
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full bg-[#333] transition-all duration-300 flex items-center justify-center ${isOn ? 'top-8 bg-black' : 'bottom-8'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                </button>
                <div className="mt-12 text-gray-500 font-medium tracking-widest text-sm uppercase">{isOn ? '已开启' : '已关闭'}</div>
            </div>
        </div>
    );
};

// 5. Navigation Bar
const OneUINav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'flashlight', icon: Icons.Flashlight, label: '灯光' },
        { id: 'calc', icon: Icons.Calculator, label: '计算' },
        { id: 'support', icon: Icons.Apps, label: '支持' }, 
    ];

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-one-float rounded-full px-6 py-3 flex items-center gap-6">
                {tabs.map((t) => {
                    const isActive = active === t.id;
                    return (
                        <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform w-12">
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
                {activeTab === 'support' && <AppSupportView />}
            </main>
            <OneUINav active={activeTab} onChange={setActiveTab} />
        </div>
    </div>
  );
};

export default App;