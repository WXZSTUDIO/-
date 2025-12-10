import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './constants';

// --- Types ---
type Tab = 'food' | 'calc' | 'calendar' | 'scan';

interface Option {
  id: string;
  text: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  description: string;
  aqi?: number; 
}

// --- Weather Helpers ---
const getWeatherDescription = (code: number): string => {
    if (code === 0) return '晴';
    if (code >= 1 && code <= 3) return '多云';
    if (code >= 45 && code <= 48) return '雾';
    if (code >= 51 && code <= 67) return '小雨';
    if (code >= 71 && code <= 77) return '雪';
    if (code >= 80 && code <= 82) return '阵雨';
    if (code >= 95) return '雷雨';
    return '阴';
};

const getCurrentDateString = () => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// --- Sub-Components ---

// 1. Weather Card (Fixed for Mobile size)
const WeatherCard = ({ weather }: { weather: WeatherData | null }) => {
    return (
        <div className="w-full px-6 pt-4 pb-2">
            {/* Reduced Aspect Ratio for mobile compactness */}
            <div className="relative w-full aspect-[2.2/1] md:aspect-[2.5/1] bg-weather-deep rounded-[24px] shadow-glass-lg overflow-hidden text-white flex flex-col justify-between p-5 transition-all">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 opacity-10 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>
                <div className="absolute inset-0 rain-pattern opacity-30"></div>

                {/* Top: Temp */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-start">
                        <span className="text-5xl md:text-6xl font-bold tracking-tighter">
                            {weather ? weather.temperature : '--'}
                        </span>
                        <span className="text-xl font-medium mt-1 ml-1">°C</span>
                    </div>
                    <div className="flex flex-col items-end">
                         <div className="text-sm md:text-base font-semibold">
                                {weather ? weather.description : 'Loading...'}
                         </div>
                         <div className="mt-1 px-1.5 py-0.5 bg-white/20 rounded backdrop-blur-sm text-[10px] font-medium flex items-center gap-1">
                                <span>空气质量</span>
                                <span>{weather?.aqi || 42}</span>
                                <span className="bg-white text-blue-600 px-1 rounded-[2px] font-bold">优</span>
                         </div>
                    </div>
                </div>

                {/* Bottom: Info */}
                <div className="relative z-10 flex justify-between items-end mt-2">
                    <div className="text-[10px] text-white/60 font-medium">
                        {getCurrentDateString()} 更新
                    </div>
                    <button className="flex items-center gap-1 text-[10px] text-white/80 hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-full backdrop-blur-md">
                        查看更多 <Icons.ChevronDown className="w-3 h-3 -rotate-90" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Food View Components
const ClockWheel = ({ options, rotation, isSpinning, onSpin }: { options: Option[]; rotation: number; isSpinning: boolean; onSpin: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 600; 
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 60; 

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
      ctx.fillStyle = i % 2 === 0 ? '#F2F4F8' : '#ECF0F3'; 
      ctx.fill();
      ctx.strokeStyle = '#D1D9E6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#4A5568'; 
      ctx.font = '600 28px "Inter", sans-serif'; 
      ctx.fillText(opt.text, radius - 40, 10);
      ctx.restore();
    });
  }, [options]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full bg-[#F2F4F8] shadow-neu-flat flex items-center justify-center">
          <div className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full shadow-neu-pressed bg-[#F2F4F8]"></div>
      </div>
      <div 
        className="relative w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0.85,0.35,1)] will-change-transform z-10"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute z-20">
          <button 
            onClick={onSpin}
            disabled={isSpinning || options.length < 2}
            className={`
                w-16 h-16 rounded-full bg-[#F2F4F8] flex items-center justify-center text-gray-500 transition-all duration-200
                ${isSpinning ? 'shadow-neu-pressed text-red-400 scale-95' : 'shadow-neu-flat hover:text-red-500 active:shadow-neu-pressed active:scale-95'}
            `}
        >
            {isSpinning ? <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> : <div className="w-4 h-4 rounded-full bg-red-500 shadow-md"></div>}
        </button>
      </div>
      <div className="absolute top-[15%] z-30 pointer-events-none drop-shadow-md">
         <div className="w-1.5 h-10 bg-gray-700 rounded-full transform translate-y-1"></div>
         <div className="w-1.5 h-6 bg-red-500 rounded-full absolute top-0"></div>
      </div>
    </div>
  );
};

const FoodView = ({ weather }: { weather: WeatherData | null }) => {
    const [options, setOptions] = useState<Option[]>([
        { id: '1', text: '火锅' }, { id: '2', text: '烧烤' }, { id: '3', text: '日料' }, { id: '4', text: '汉堡' }, { id: '5', text: '炒菜' }
    ]);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Option | null>(null);
    const [inputValue, setInputValue] = useState('');

    const handleAddOption = () => {
        if (inputValue.trim() && options.length < 20) {
            setOptions([...options, { id: Date.now().toString(), text: inputValue.trim() }]);
            setInputValue('');
        }
    };

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
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                <div className="flex-none pt-4 flex justify-between items-center px-6">
                    <div className="text-xl font-bold text-[#2D3436]">今天吃什么</div>
                    <div className="flex gap-4">
                        <button onClick={() => setOptions([])} className="w-10 h-10 rounded-full shadow-neu-button flex items-center justify-center text-gray-400 hover:text-red-500 active:shadow-neu-pressed transition-all">
                            <Icons.Refresh width={18} />
                        </button>
                    </div>
                </div>
                
                <WeatherCard weather={weather} />

                <div className="flex-1 min-h-[300px] flex items-center justify-center my-4">
                    <div className="scale-90 transform">
                        <ClockWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                    </div>
                </div>

                <div className="px-6 pb-6">
                     {/* Input Area */}
                    <div className="h-14 rounded-2xl bg-[#F2F4F8] shadow-neu-flat flex items-center justify-between px-4 gap-4 mb-4">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                            placeholder="Add item..."
                            className="flex-1 bg-transparent border-none outline-none text-[#2D3436] font-semibold placeholder:text-[#8898AA]"
                        />
                        <button onClick={handleAddOption} className="w-10 h-10 rounded-full bg-[#F2F4F8] shadow-neu-button active:shadow-neu-pressed flex items-center justify-center text-[#2D3436]">
                            <Icons.Add width={20} />
                        </button>
                    </div>
                    {/* Chips */}
                    <div className="flex flex-wrap gap-3">
                        {options.map((opt) => (
                            <div key={opt.id} className="px-4 py-2 rounded-xl bg-[#F2F4F8] shadow-neu-button flex items-center gap-2 text-[#2D3436] font-bold text-xs">
                                {opt.text}
                                <button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="text-[#8898AA] hover:text-red-500">
                                    <Icons.Close width={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Winner Modal */}
            {winner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-[#F2F4F8]/80 backdrop-blur-sm animate-pop">
                    <div className="w-full max-w-xs bg-[#F2F4F8] shadow-neu-flat rounded-[40px] p-8 text-center border border-white/50">
                        <div className="w-20 h-20 mx-auto rounded-full shadow-neu-pressed flex items-center justify-center mb-6 text-3xl">🎉</div>
                        <h3 className="text-[#8898AA] font-bold uppercase text-xs mb-2">今天就吃</h3>
                        <h1 className="text-3xl font-black text-[#2D3436] mb-8">{winner.text}</h1>
                        <button onClick={() => setWinner(null)} className="w-full h-12 rounded-2xl bg-[#F2F4F8] shadow-neu-button active:shadow-neu-pressed text-[#2D3436] font-bold">好的</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Calculator View
const CalcView = () => {
    const [display, setDisplay] = useState('0');
    
    const buttons = [
        ['C', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    const handlePress = (btn: string) => {
        if (btn === 'C') setDisplay('0');
        else if (btn === '=') {
            try {
                // eslint-disable-next-line no-eval
                const res = eval(display.replace('×', '*').replace('÷', '/'));
                setDisplay(String(res).slice(0, 9));
            } catch {
                setDisplay('Error');
            }
        } else {
            setDisplay(display === '0' ? btn : display + btn);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F2F4F8] p-6 max-w-md mx-auto w-full">
            <div className="flex-1 flex items-end justify-end mb-8 p-6 rounded-3xl shadow-neu-pressed bg-[#F2F4F8] text-[#2D3436]">
                <span className="text-5xl font-mono tracking-widest truncate">{display}</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {buttons.flat().map((btn, i) => {
                     const isZero = btn === '0';
                     const isOp = ['÷','×','-','+','='].includes(btn);
                     const isFunc = ['C','%'].includes(btn);
                     return (
                         <button
                            key={i}
                            onClick={() => handlePress(btn)}
                            className={`
                                h-16 md:h-20 rounded-2xl shadow-neu-button active:shadow-neu-pressed flex items-center justify-center text-xl font-bold transition-all
                                ${isZero ? 'col-span-2' : ''}
                                ${isOp ? 'text-orange-500' : isFunc ? 'text-blue-500' : 'text-gray-600'}
                            `}
                         >
                             {btn}
                         </button>
                     );
                })}
            </div>
        </div>
    );
};

// 4. Calendar View (With Mock Lunar/Holiday Data)
const CalendarView = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // Mock Data for "Feb/Mar 2024" Visualization logic
    const getLunar = (day: number) => {
        const mapping: Record<number, string> = { 1: '初一', 10: '初十', 15: '元宵', 24: '龙抬头' };
        return mapping[day] || (day % 10 === 0 ? '初十' : day < 11 ? `初${day}` : day < 20 ? `十${day-10}` : `廿${day-20}`);
    };
    
    const getHoliday = (day: number) => {
        // Example holidays
        if (day === 14) return { text: 'Valentine', color: 'text-pink-500' };
        if (day === 9) return { text: '除夕', color: 'text-red-500' };
        if (day === 10) return { text: '春节', color: 'text-red-500' };
        if (day === 1) return { text: '三一节', color: 'text-blue-500' }; // Korean Holiday example
        return null;
    };

    const days = Array.from({ length: 42 }, (_, i) => {
        const dayNum = i - startDay + 1;
        if (dayNum > 0 && dayNum <= daysInMonth) {
            return { day: dayNum, lunar: getLunar(dayNum), holiday: getHoliday(dayNum) };
        }
        return null;
    });

    return (
        <div className="h-full flex flex-col p-6 max-w-lg mx-auto w-full">
            <div className="flex justify-between items-center mb-8 pt-4">
                 <h2 className="text-2xl font-bold text-[#2D3436]">
                    {today.getFullYear()}年 {today.getMonth() + 1}月
                 </h2>
                 <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-full shadow-neu-button flex items-center justify-center text-gray-500"><Icons.ChevronDown className="rotate-90" /></button>
                     <button className="w-10 h-10 rounded-full shadow-neu-button flex items-center justify-center text-gray-500"><Icons.ChevronDown className="-rotate-90" /></button>
                 </div>
            </div>

            <div className="grid grid-cols-7 gap-y-6 text-center mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-gray-400 text-sm font-semibold">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                {days.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center min-h-[60px]">
                        {item ? (
                            <div className={`
                                w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-bold text-lg mb-1 transition-all
                                ${item.day === today.getDate() 
                                    ? 'shadow-neu-pressed text-blue-600 bg-blue-50/50' 
                                    : 'shadow-neu-flat text-gray-700 active:shadow-neu-pressed'}
                            `}>
                                {item.day}
                            </div>
                        ) : <div className="w-10 h-10"></div>}
                        
                        {item && (
                            <span className={`text-[10px] transform scale-90 ${item.holiday ? item.holiday.color + ' font-bold' : 'text-gray-400'}`}>
                                {item.holiday ? item.holiday.text : item.lunar}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Scan View (Mock OCR/Scan)
const ScanView = () => {
    const [status, setStatus] = useState<'camera' | 'processing' | 'result'>('camera');
    
    const handleCapture = () => {
        setStatus('processing');
        setTimeout(() => setStatus('result'), 2500);
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a1a] relative overflow-hidden">
            {/* Camera Viewfinder */}
            {status === 'camera' && (
                <>
                    <div className="flex-1 relative">
                        {/* Mock Camera Feed Background */}
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <span className="text-white/20">Camera Feed Simulation</span>
                        </div>
                        {/* Overlays */}
                        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between text-white z-10">
                            <Icons.Flash />
                            <span className="font-semibold tracking-wider bg-black/30 px-3 py-1 rounded-full backdrop-blur">OCR 模式</span>
                            <Icons.Close />
                        </div>
                        <div className="absolute inset-12 border-2 border-white/30 rounded-[32px] pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                        </div>
                    </div>
                    {/* Controls */}
                    <div className="h-32 bg-black/40 backdrop-blur-xl flex items-center justify-around px-8">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white"><Icons.Image /></div>
                        <button onClick={handleCapture} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full active:scale-90 transition-transform"></div>
                        </button>
                        <div className="w-12 h-12"></div>
                    </div>
                </>
            )}

            {/* Processing State */}
            {status === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#F2F4F8] text-[#2D3436]">
                    <div className="w-24 h-24 rounded-full shadow-neu-flat flex items-center justify-center mb-8 relative">
                        <Icons.Magic className="w-10 h-10 text-blue-500 animate-pulse" />
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
                    </div>
                    <h2 className="text-xl font-bold mb-2">AI 智能修复中...</h2>
                    <p className="text-sm text-gray-500">正在识别文字并增强画质</p>
                </div>
            )}

            {/* Result State */}
            {status === 'result' && (
                <div className="flex-1 flex flex-col bg-[#F2F4F8] p-6 overflow-y-auto">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#2D3436]">识别结果</h2>
                        <button onClick={() => setStatus('camera')} className="text-blue-500 font-bold text-sm">重新扫描</button>
                     </div>
                     <div className="bg-white rounded-2xl p-6 shadow-neu-flat mb-6">
                        <p className="text-gray-700 leading-relaxed font-serif">
                            "这是模拟的 OCR 识别结果文本。系统检测到中英混合内容。AI 已自动校正倾斜并去除了阴影。"
                            <br/><br/>
                            "This is a simulated OCR result. The system detected mixed Chinese and English content."
                        </p>
                     </div>
                     <div className="flex gap-4">
                         <button className="flex-1 h-12 rounded-xl bg-[#F2F4F8] shadow-neu-button text-[#2D3436] font-bold">复制文本</button>
                         <button className="flex-1 h-12 rounded-xl bg-[#2D3436] text-white shadow-xl font-bold">导出 PDF</button>
                     </div>
                </div>
            )}
        </div>
    );
};


// 6. Tab Bar
const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'calendar', icon: Icons.Calendar, label: '日历' },
        { id: 'calc', icon: Icons.Calculator, label: '计算' },
        { id: 'scan', icon: Icons.Scan, label: '扫描' },
    ];

    return (
        <div className="h-[80px] bg-[#F2F4F8] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex items-center justify-around px-4 pb-2 z-50">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button 
                        key={t.id} 
                        onClick={() => onChange(t.id)}
                        className={`
                            flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                            ${isActive ? 'shadow-neu-pressed text-blue-600 translate-y-1' : 'text-gray-400 hover:text-gray-600'}
                        `}
                    >
                        <t.icon width={24} height={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-blue-600' : 'text-transparent'}`}>
                            {t.label}
                        </span>
                    </button>
                )
            })}
        </div>
    );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('food');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current_weather=true');
            const data = await res.json();
            const cw = data.current_weather;
            const desc = getWeatherDescription(cw.weathercode);
            setWeather({
                temperature: cw.temperature,
                weatherCode: cw.weathercode,
                description: desc,
                aqi: 42
            });
        } catch (e) {
            console.error("Weather Error", e);
        }
    };
    fetchWeather();
  }, []);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden font-sans bg-[#F2F4F8] text-[#2D3436] flex flex-col items-center">
        {/* Main Content Container - Constrained Width for Desktop */}
        <div className="w-full h-full max-w-md bg-[#F2F4F8] flex flex-col relative shadow-2xl md:my-0">
            
            {/* Viewport */}
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'food' && <FoodView weather={weather} />}
                {activeTab === 'calc' && <CalcView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'scan' && <ScanView />}
            </main>

            {/* Bottom Navigation */}
            <div className="flex-none">
                <TabBar active={activeTab} onChange={setActiveTab} />
            </div>
        </div>
    </div>
  );
};

export default App;