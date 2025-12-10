import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from './constants';
import { geminiService } from './services/geminiService';

// --- Types ---
type Tab = 'food' | 'calc' | 'calendar' | 'scan';

interface Option {
  id: string;
  text: string;
  desc?: string; 
}

// --- Design Constants ---
const THEME = {
    bg: '#F5F5F5',
    textMain: '#333333',
    textSub: '#999999',
    chipRedBg: '#FFF0F0',
    chipRedText: '#D9534F',
    chipGrayBorder: '#E1E1E1',
    // Solid pastel colors
    wheelColors: [
        '#C2F0D8', // Green
        '#C5E8D0', // Mint
        '#FAD4D1', // Pink
        '#FDE0B8', // Apricot
        '#FFF5A8', // Yellow
    ]
};

const DEFAULT_OPTIONS: Option[] = [
  { id: '1', text: '火锅' }, 
  { id: '2', text: '涮串' }, 
  { id: '3', text: '羊肉串' }, 
  { id: '4', text: '麻辣烫' }, 
  { id: '5', text: '辣鸡爪' }
];

const HOLIDAYS: Record<string, string> = {
  '01-01': '元旦',
  '02-09': '除夕',
  '02-10': '春节',
  '02-14': '情人节',
  '02-24': '元宵节',
  '03-01': '三一节(韩)',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '04-04': '清明',
  '04-10': '国会选举(韩)',
  '05-01': '劳动节',
  '05-04': '青年节',
  '05-05': '儿童节(韩)',
  '05-15': '佛诞节',
  '06-01': '儿童节',
  '06-06': '显忠日(韩)',
  '06-10': '端午节',
  '07-01': '建党节',
  '08-01': '建军节',
  '08-15': '光复节',
  '09-10': '教师节',
  '09-17': '中秋节',
  '10-01': '国庆节',
  '10-03': '开天节(韩)',
  '10-09': '韩文日(韩)',
  '10-11': '重阳节',
  '10-24': '程序员节',
  '12-25': '圣诞节',
};

// --- Sub-Components ---

// Common Header
const Header = ({ title }: { title: string }) => (
    <div className="h-12 flex items-center justify-center bg-[#F5F5F5] border-b border-[#E5E5E5]/50 sticky top-0 z-20 flex-none w-full">
        <h1 className="text-base font-bold text-[#333]">{title}</h1>
    </div>
);

// 1. Food View (Pastel Wheel Style)
const PastelWheel = ({ options, rotation, isSpinning, onSpin }: { options: Option[]; rotation: number; isSpinning: boolean; onSpin: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 600; 
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10; // Slightly larger radius relative to container

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
    
    // Use theme colors
    const colors = THEME.wheelColors;

    options.forEach((opt, i) => {
      const angle = i * arc;
      ctx.save();
      
      // 1. Draw Slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // 2. Draw Thin White Separator
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2; // Thinner lines
      ctx.stroke();

      // 3. Draw Text
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#555'; 
      ctx.font = 'bold 34px "Noto Sans SC", sans-serif'; 
      
      ctx.fillText(opt.text, radius - 40, 0);
      
      ctx.restore();
    });

  }, [options]);

  return (
    <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center my-4">
      
      {/* Container with Thin White Border */}
      <div className="absolute inset-[-4px] rounded-full bg-white border border-[#E5E5E5] shadow-sm pointer-events-none"></div>

      {/* Spinning Part */}
      <div 
        className="relative w-full h-full rounded-full transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0.85,0.35,1)] will-change-transform z-10 overflow-hidden"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Center Button (Start) */}
      <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none">
          <button 
            onClick={onSpin}
            disabled={isSpinning}
            className={`
                pointer-events-auto
                w-[80px] h-[80px] rounded-full bg-white text-[#333] font-bold text-2xl tracking-wide
                shadow-md
                flex items-center justify-center
                transition-transform active:scale-95
                border border-gray-100
            `}
          >
             {isSpinning ? '...' : '开始'}
          </button>
      </div>

      {/* Indicator - Red Diamond at Top */}
      <div className="absolute -top-[14px] left-1/2 transform -translate-x-1/2 z-40">
         <div className="w-4 h-4 bg-[#D44E45] rotate-45 rounded-[1px] shadow-sm border-[1.5px] border-white"></div>
      </div>
    </div>
  );
};

const FoodView = () => {
    const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<Option | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const handleAddOption = () => {
        if (inputValue.trim() && options.length < 20) {
            setOptions([
                ...options, 
                { 
                    id: Date.now().toString(), 
                    text: inputValue.trim(),
                }
            ]);
            setInputValue('');
            setIsAdding(false);
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
        <div className="flex flex-col h-full w-full" style={{ backgroundColor: THEME.bg }}>
            {/* Header */}
            <Header title="命运之轮" />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center w-full overflow-x-hidden">
                
                {/* 1. Wheel Section */}
                <div className="w-full flex justify-center py-6 flex-none overflow-hidden">
                    <PastelWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                </div>

                {/* 2. Options List Section (Card Style) */}
                {/* Added more padding bottom (pb-32) to accommodate floating tab bar */}
                <div className="w-full px-4 mt-2 pb-32 flex-none">
                    <div className="bg-white rounded-[20px] p-5 shadow-sm">
                        <div className="text-[12px] text-[#999] mb-3">选项列表 ({options.length})</div>
                        
                        <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto custom-scrollbar content-start">
                            {options.map((opt) => (
                                <div 
                                    key={opt.id} 
                                    className="px-3 py-2 rounded-full text-[14px] flex items-center gap-2 transition-all active:scale-95"
                                    style={{ 
                                        backgroundColor: THEME.chipRedBg, 
                                        color: THEME.chipRedText 
                                    }}
                                >
                                    <span className="font-medium">{opt.text}</span>
                                    <button 
                                        onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                                        className="w-4 h-4 flex items-center justify-center opacity-60 hover:opacity-100"
                                    >
                                        <Icons.Close width={12} height={12} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Button / Input */}
                            {isAdding ? (
                                <div className="flex items-center h-[36px] px-3 rounded-full border border-smart-blue bg-white min-w-[80px]">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddOption();
                                            if (e.key === 'Escape') setIsAdding(false);
                                        }}
                                        onBlur={() => {
                                            if (!inputValue) setIsAdding(false);
                                        }}
                                        className="w-full bg-transparent text-[14px] outline-none text-[#333]"
                                        placeholder="输入..."
                                    />
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsAdding(true)}
                                    className="px-4 py-2 rounded-full text-[13px] text-[#aaa] border border-[#E0E0E0] bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors h-[36px]"
                                >
                                    <span>+ 添加</span>
                                </button>
                            )}
                        </div>

                        {/* Footer Link */}
                        <div className="flex justify-end mt-4 border-t border-[#f0f0f0] pt-3">
                            <button 
                                onClick={() => setOptions(DEFAULT_OPTIONS)} 
                                className="text-[12px] text-smart-blue hover:opacity-80 font-medium"
                            >
                                重置默认
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Result Modal */}
            {winner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 smart-dialog-mask animate-fade-in">
                    <div className="w-full max-w-[280px] bg-white rounded-[20px] overflow-hidden shadow-2xl animate-scale-up flex flex-col items-center pb-6">
                        
                        {/* Header Image/Icon */}
                        <div className="w-full h-20 bg-gradient-to-br from-[#FFF8C4] to-[#FDECEC] flex items-center justify-center mb-4">
                             <div className="text-4xl">🎉</div>
                        </div>
                        
                        <h2 className="text-[20px] font-bold text-[#333] mb-1">{winner.text}</h2>
                        <p className="text-[12px] text-[#999] mb-6">今天就吃这个吧！</p>
                        
                        <div className="flex gap-3 w-full px-6">
                             <button 
                                onClick={() => setWinner(null)}
                                className="flex-1 h-[40px] rounded-full text-[13px] font-medium text-[#666] bg-[#F5F5F5] hover:bg-[#E0E0E0]"
                             >
                                 再转一次
                             </button>
                             <button 
                                onClick={() => setWinner(null)}
                                className="flex-1 h-[40px] rounded-full text-[13px] font-bold text-white bg-smart-blue hover:opacity-90 shadow-sm"
                             >
                                 去吃！
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Calculator View - Smartisan Grid Style
const CalcView = () => {
    const [display, setDisplay] = useState('0');
    
    // Standard layout: 4 columns
    const buttons = [
        ['C', '⌫', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    const handlePress = (btn: string) => {
        if (btn === 'C') {
            setDisplay('0');
        } else if (btn === '⌫') {
            setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (btn === '=') {
            try {
                // eslint-disable-next-line no-eval
                const res = eval(display.replace('×', '*').replace('÷', '/'));
                setDisplay(String(res).slice(0, 9));
            } catch {
                setDisplay('Error');
            }
        } else {
            setDisplay(display === '0' && btn !== '.' ? btn : display + btn);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#E8E8E8]">
            <Header title="计算器" />
            
            {/* Screen Area */}
            <div className="h-[35%] flex flex-col justify-end p-8 pb-4">
                 <div className="text-right">
                     <span className="text-6xl font-light text-[#333] tracking-tight">{display}</span>
                 </div>
            </div>
            
            {/* Keypad Area - White card with buttons */}
            {/* Added pb-28 to avoid overlap with floating nav */}
            <div className="flex-1 bg-white rounded-t-[24px] shadow-smart-float p-6 pb-28">
                <div className="grid grid-cols-4 gap-4 h-full content-center">
                    {buttons.flat().map((btn, i) => {
                         const isZero = btn === '0';
                         const isAction = ['='].includes(btn); 
                         const isOp = ['÷','×','-','+'].includes(btn);
                         const isFunc = ['C','%','⌫'].includes(btn);
                         
                         let btnClass = "bg-[#F7F7F7] text-smart-text-main hover:bg-[#F0F0F0]"; 
                         
                         if (isAction) {
                             btnClass = "bg-smart-orange text-white shadow-md hover:bg-[#E09D3E]";
                         } else if (isOp) {
                             btnClass = "text-smart-orange bg-[#F7F7F7] font-medium"; 
                         } else if (isFunc) {
                             btnClass = "text-smart-text-sub bg-[#F7F7F7]";
                         }

                         return (
                             <button
                                key={i}
                                onClick={() => handlePress(btn)}
                                className={`
                                    rounded-full flex items-center justify-center text-xl transition-all active:scale-95
                                    ${isZero ? 'col-span-2 aspect-[2.2/1]' : 'aspect-square'}
                                    ${btnClass}
                                `}
                             >
                                 {btn}
                             </button>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Smartisan Wheel Picker Components ---

const WheelColumn = ({ items, value, onChange }: { items: string[] | number[]; value: string | number; onChange: (val: any) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 48; // px

    // Scroll to position on mount or value change
    useEffect(() => {
        if (scrollRef.current) {
            const index = items.indexOf(value as never);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, items]);

    return (
        <div className="relative h-[240px] flex-1 overflow-hidden group">
            <div 
                ref={scrollRef}
                className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[96px]" // 96px padding top/bottom to center first/last item
                onScroll={(e) => {
                    // Debounced selection logic could go here for real-time updates, 
                    // but for simplified UI we rely on click-to-select for robust demo behavior
                    // or implement complex scroll-end detection.
                    // For this demo, clicking an item is the primary way to "snap" logically.
                }}
            >
                {items.map((item) => (
                    <div 
                        key={item}
                        onClick={() => onChange(item)}
                        className={`
                            h-[48px] flex items-center justify-center snap-center cursor-pointer transition-colors duration-200
                            ${item === value ? 'text-[#333] font-bold text-lg' : 'text-[#999] text-base'}
                        `}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DatePickerModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    initialDate 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (d: Date) => void; 
    initialDate: Date 
}) => {
    const [selectedDate, setSelectedDate] = useState(initialDate);

    if (!isOpen) return null;

    const years = Array.from({ length: 20 }, (_, i) => 2020 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Calculate days in selected month
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const weekDayStr = selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' });
    const titleStr = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日${weekDayStr}`;

    const handleConfirm = () => {
        onConfirm(selectedDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center smart-dialog-mask animate-fade-in">
            <div className="w-full bg-[#EFEFEF] rounded-t-[16px] overflow-hidden shadow-2xl animate-slide-up pb-safe">
                {/* Header Bar */}
                <div className="h-12 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-4">
                    <button onClick={onClose} className="p-2">
                        <Icons.Close className="w-5 h-5 text-[#999]" />
                    </button>
                    <span className="font-bold text-[#333] text-sm">{titleStr}</span>
                    <button onClick={handleConfirm} className="p-2">
                        <div className="w-5 h-5 text-smart-green">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                             </svg>
                        </div>
                    </button>
                </div>

                {/* Wheel Area */}
                <div className="relative bg-[#F2F2F2] h-[240px] flex justify-center">
                    {/* Highlight Bar (Middle) */}
                    <div className="absolute top-[96px] left-0 right-0 h-[48px] bg-white border-t border-b border-[#E0E0E0] pointer-events-none z-0"></div>
                    
                    {/* Gradients Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-[#F2F2F2]/90 via-transparent to-[#F2F2F2]/90"></div>

                    <div className="w-full max-w-sm flex relative z-20">
                        <WheelColumn 
                            items={years} 
                            value={selectedDate.getFullYear()} 
                            onChange={(y) => setSelectedDate(new Date(y, selectedDate.getMonth(), selectedDate.getDate()))} 
                        />
                        <WheelColumn 
                            items={months} 
                            value={selectedDate.getMonth() + 1} 
                            onChange={(m) => setSelectedDate(new Date(selectedDate.getFullYear(), m - 1, Math.min(selectedDate.getDate(), new Date(selectedDate.getFullYear(), m, 0).getDate())))} 
                        />
                        <WheelColumn 
                            items={days} 
                            value={selectedDate.getDate()} 
                            onChange={(d) => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


// 3. Calendar View - Grid/Table Style
const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const changeMonth = (delta: number) => {
        const newDate = new Date(year, month + delta, 1);
        if (newDate.getFullYear() < 1949 || newDate.getFullYear() > 2049) return;
        setCurrentDate(newDate);
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const getHoliday = (d: number) => {
        const key = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const holidayName = HOLIDAYS[key];
        if (holidayName) return { text: holidayName, isHoliday: true };
        
        // Dynamic Lunar/Solar Term logic is complex, sticking to fixed map for demo + standard holidays
        return null;
    };

    const today = new Date();
    const isToday = (d: number) => 
        d === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear();

    const days = Array.from({ length: 42 }, (_, i) => {
        const dayNum = i - startDay + 1;
        if (dayNum > 0 && dayNum <= daysInMonth) {
            return { day: dayNum, holiday: getHoliday(dayNum) };
        }
        return null;
    });

    return (
        <div className="h-full flex flex-col bg-[#F5F5F5]">
            <Header title="日历" />
            {/* Added pb-32 to scrolling container */}
            <div className="p-4 flex-1 overflow-y-auto pb-32">
                {/* Card Container */}
                <div className="bg-white rounded-smart-lg shadow-smart-card overflow-hidden">
                    
                    {/* Header - Clickable for Picker */}
                    <div 
                        className="h-16 flex items-center justify-between px-6 border-b border-smart-divider bg-white"
                    >
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-smart-text-sub">
                             <Icons.ChevronDown className="rotate-90 w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={() => setIsPickerOpen(true)}
                            className="text-lg font-bold text-smart-text-main px-4 py-1 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            {year}年 {month + 1}月
                        </button>

                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-smart-text-sub">
                             <Icons.ChevronDown className="-rotate-90 w-5 h-5" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 border-b border-smart-divider bg-[#FAFAFA]">
                        {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                            <div key={d} className={`h-10 flex items-center justify-center text-xs ${i === 0 || i === 6 ? 'text-smart-red' : 'text-smart-text-sub'}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7">
                        {days.map((item, idx) => (
                            <div key={idx} className="h-14 border-b border-r border-smart-divider/50 flex flex-col items-center justify-center relative">
                                {item ? (
                                    <>
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                                            ${isToday(item.day) ? 'bg-smart-blue text-white shadow-md' : 'text-smart-text-main'}
                                        `}>
                                            {item.day}
                                        </div>
                                        {item.holiday && (
                                            <span className="text-[9px] text-smart-red mt-0.5 transform scale-90">{item.holiday.text}</span>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Info Text */}
                <div className="mt-4 text-center">
                     <p className="text-xs text-smart-text-light">
                        点击上方日期可快速跳转
                     </p>
                </div>
            </div>

            {/* Smartisan Date Picker Modal */}
            <DatePickerModal 
                isOpen={isPickerOpen} 
                onClose={() => setIsPickerOpen(false)} 
                onConfirm={(d) => setCurrentDate(d)}
                initialDate={currentDate}
            />
        </div>
    );
};

// 4. Scan View
const ScanView = () => {
    const [status, setStatus] = useState<'camera' | 'processing' | 'result'>('camera');
    const [ocrResult, setOcrResult] = useState<{ language: string; text: string } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'camera') {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
                .catch(console.error);
        }
    }, [status]);

    const handleCapture = async () => {
        if (!videoRef.current) return;
        
        setStatus('processing');
        
        try {
            // Capture image from video
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            
            // Get base64 string without data header
            const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
            
            // Call Gemini
            const result = await geminiService.recognizeImage(base64Image);
            setOcrResult(result);
            setStatus('result');
        } catch (error) {
            console.error(error);
            setOcrResult({ language: 'Error', text: '识别失败，请重试' });
            setStatus('result');
        }
    };

    return (
        <div className="h-full flex flex-col bg-black relative">
            <Header title="扫一扫" />
            {status === 'camera' && (
                <>
                    {/* Viewfinder */}
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                         <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-80" />
                         {/* Framing */}
                         <div className="absolute w-64 h-64 border border-white/30 rounded-lg">
                             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-smart-blue"></div>
                             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-smart-blue"></div>
                             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-smart-blue"></div>
                             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-smart-blue"></div>
                         </div>
                         <div className="absolute bottom-24 text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">
                             对准文字，自动识别
                         </div>
                    </div>
                    
                    {/* Controls - Increased height/padding to move buttons above floating nav */}
                    <div className="h-40 pb-20 bg-black flex items-center justify-around px-8">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white"
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => setStatus('processing')} />
                            <Icons.Image className="w-5 h-5" />
                        </button>
                        
                        <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-white border-4 border-[#CCCCCC] flex items-center justify-center active:scale-95 transition-transform">
                            <div className="w-12 h-12 rounded-full border border-black/10 bg-white"></div>
                        </button>
                        
                        <div className="w-10 h-10"></div>
                    </div>
                </>
            )}

            {status === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F5F5]">
                    <div className="w-10 h-10 border-2 border-smart-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-smart-text-sub">正在识别...</p>
                </div>
            )}

            {status === 'result' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 smart-dialog-mask">
                    <div className="w-full max-w-[320px] bg-white rounded-smart-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[80vh]">
                         <div className="p-6 flex flex-col h-full">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-smart-text-main">识别结果</h3>
                                <span className="text-xs bg-blue-50 text-smart-blue px-2 py-1 rounded-full border border-blue-100">
                                    {ocrResult?.language || '未知语言'}
                                </span>
                             </div>
                             
                             <div className="bg-[#F9F9F9] border border-smart-divider rounded-md p-4 mb-4 flex-1 overflow-y-auto min-h-[120px]">
                                 <p className="text-sm text-smart-text-main leading-relaxed whitespace-pre-wrap">
                                     {ocrResult?.text || '未检测到文本'}
                                 </p>
                             </div>
                             
                             <div className="flex gap-3 mt-auto">
                                 <button onClick={() => setStatus('camera')} className="flex-1 h-10 rounded-smart-btn bg-white border border-smart-divider text-smart-text-main font-medium text-sm hover:bg-gray-50">
                                     返回
                                 </button>
                                 <button 
                                    onClick={() => {
                                        if(ocrResult?.text) navigator.clipboard.writeText(ocrResult.text);
                                    }} 
                                    className="flex-1 h-10 rounded-smart-btn bg-smart-blue text-white font-medium text-sm hover:bg-blue-600 shadow-sm"
                                 >
                                     复制文本
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// 5. Tab Bar - Floating Glass Style
const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'calendar', icon: Icons.Calendar, label: '日历' },
        { id: 'calc', icon: Icons.Calculator, label: '计算器' },
        { id: 'scan', icon: Icons.Scan, label: '扫一扫' },
    ];

    return (
        <div className="absolute bottom-6 left-4 right-4 z-50">
            <div className="h-[72px] bg-white/85 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[24px] flex items-center justify-around px-2">
                {tabs.map((t) => {
                    const isActive = active === t.id;
                    return (
                        <button 
                            key={t.id} 
                            onClick={() => onChange(t.id)}
                            className="flex flex-col items-center justify-center w-16 h-full active:scale-95 transition-transform"
                        >
                            <div className={`transition-all duration-300 p-1 rounded-xl ${isActive ? 'text-[#333] bg-black/5' : 'text-[#999]'}`}>
                                <t.icon width={24} height={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-[#333]' : 'text-[#999]'}`}>
                                {t.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('food');

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans bg-[#F2F2F2] text-[#333] flex flex-col items-center fixed inset-0 overscroll-none">
        {/* Main Content Container */}
        <div className="w-full h-full max-w-md bg-[#F2F2F2] flex flex-col relative shadow-2xl md:my-0 overflow-hidden">
            
            {/* Viewport */}
            <main className="flex-1 overflow-hidden relative flex flex-col w-full">
                {activeTab === 'food' && <FoodView />}
                {activeTab === 'calc' && <CalcView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'scan' && <ScanView />}
            </main>

            {/* Bottom Navigation (Floating) */}
            <TabBar active={activeTab} onChange={setActiveTab} />
        </div>
    </div>
  );
};

export default App;