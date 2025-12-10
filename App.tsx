import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from './constants';

// --- Types ---
type Tab = 'food' | 'calc' | 'calendar' | 'scan';

interface Option {
  id: string;
  text: string;
}

// Updated Default Options
const DEFAULT_OPTIONS: Option[] = [
  { id: '1', text: '羊肉串' }, 
  { id: '2', text: '麻辣烫' }, 
  { id: '3', text: '辣鸡爪' }, 
  { id: '4', text: '火锅' }, 
  { id: '5', text: '涮串' }
];

// Pastel Palette (Low Saturation)
const PASTEL_PALETTE = [
  '#F9E0E0', // Red
  '#FDECC8', // Orange
  '#FEF9C3', // Yellow
  '#DCFCE7', // Green
  '#D1FAE5', // Mint
  '#CFFAFE', // Cyan
  '#E0F2FE', // Azure
  '#DBEAFE', // Blue
  '#F3E8FF', // Violet
  '#FAE8FF'  // Purple
];

// Expanded Holidays (Includes CN/KR examples for 2024/2025 context)
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

// 1. Food View (Smartisan Clean Style)
const ClockWheel = ({ options, rotation, isSpinning, onSpin }: { options: Option[]; rotation: number; isSpinning: boolean; onSpin: () => void }) => {
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

    const arc = (2 * Math.PI) / options.length;

    options.forEach((opt, i) => {
      const angle = i * arc;
      ctx.save();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      
      // Use random pastel colors from the palette
      ctx.fillStyle = PASTEL_PALETTE[i % PASTEL_PALETTE.length]; 
      ctx.fill();
      
      // Fine separator lines (slightly darker to be visible on pastels)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#555555'; // Dark gray text for contrast
      ctx.font = '500 28px "Noto Sans SC", sans-serif'; 
      ctx.fillText(opt.text, radius - 40, 10);
      
      ctx.restore();
    });
    
    // Outer Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [options]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Container Shadow for Depth */}
      <div className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full bg-white shadow-smart-float flex items-center justify-center">
      </div>
      
      <div 
        className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full transition-transform duration-[5000ms] ease-[cubic-bezier(0.15,0.85,0.35,1)] will-change-transform z-10 overflow-hidden"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Central Knob - Clean Plastic Look */}
      <div className="absolute z-20">
          <button 
            onClick={onSpin}
            disabled={isSpinning || options.length < 2}
            className={`
                w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95
                bg-white border border-[#E5E5E5] shadow-smart-btn
            `}
        >
             <span className={`text-lg font-bold ${isSpinning ? 'text-smart-red' : 'text-smart-text-main'}`}>
                 {isSpinning ? '...' : '开始'}
             </span>
        </button>
      </div>

      {/* Indicator */}
      <div className="absolute top-[8%] z-30 pointer-events-none">
         <div className="w-4 h-4 bg-smart-red rotate-45 transform origin-center shadow-sm rounded-[2px] border border-white"></div>
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
        <div className="flex flex-col h-full bg-[#F5F5F5] relative">
            {/* Header */}
            <div className="h-12 bg-[#F9F9F9] border-b border-smart-divider flex items-center justify-center shadow-sm z-10">
                {/* Updated Title */}
                <span className="font-bold text-smart-text-main">命运之轮</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center py-6 space-y-6">
                
                {/* Wheel Section */}
                <div className="flex-none h-[340px] md:h-[420px] w-full flex items-center justify-center">
                    <ClockWheel options={options} rotation={rotation} isSpinning={isSpinning} onSpin={spinWheel} />
                </div>

                {/* Chips Container - Smartisan Style */}
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-smart-lg shadow-smart-card p-4">
                        <div className="text-xs text-smart-text-sub mb-3 pl-1">选项列表</div>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {options.map((opt) => (
                                <div key={opt.id} className="relative group">
                                    <div className="px-4 py-2 bg-smart-chip-redBg text-smart-chip-redText rounded-full text-sm font-medium flex items-center gap-2 border border-transparent group-hover:border-smart-chip-redText/20 transition-all">
                                        {opt.text}
                                        <button 
                                            onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5"
                                        >
                                            <Icons.Close width={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center">
                                 <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                                    placeholder="+ 添加"
                                    className="px-4 py-2 bg-white border border-smart-chip-grayBorder rounded-full text-sm text-smart-text-main placeholder:text-smart-text-light outline-none focus:border-smart-blue transition-colors w-24 focus:w-32"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-2 border-t border-smart-divider">
                            <button onClick={() => setOptions(DEFAULT_OPTIONS)} className="text-xs text-smart-blue font-medium px-2 py-1 hover:bg-blue-50 rounded">
                                重置默认
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smartisan Dialog Modal */}
            {winner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 smart-dialog-mask animate-fade-in">
                    <div className="w-full max-w-[300px] bg-white rounded-smart-lg shadow-2xl overflow-hidden animate-scale-up">
                        <div className="pt-6 pb-4 px-6 text-center">
                            <h3 className="text-lg font-bold text-smart-text-main mb-2">结果公示</h3>
                            <p className="text-sm text-smart-text-sub leading-relaxed">
                                命运之轮选择了：
                                <br />
                                <span className="text-xl font-bold text-smart-red mt-2 block">{winner.text}</span>
                            </p>
                        </div>
                        
                        <div className="flex border-t border-smart-divider h-12">
                            <button 
                                onClick={() => setWinner(null)}
                                className="flex-1 text-sm font-medium text-smart-text-sub hover:bg-gray-50 active:bg-gray-100 transition-colors border-r border-smart-divider"
                            >
                                再转一次
                            </button>
                            <button 
                                onClick={() => setWinner(null)}
                                className="flex-1 text-sm font-bold text-smart-blue hover:bg-blue-50 active:bg-blue-100 transition-colors"
                            >
                                欣然接受
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
            {/* Screen Area */}
            <div className="h-[35%] flex flex-col justify-end p-8 pb-4">
                 <div className="text-right">
                     <span className="text-6xl font-light text-[#333] tracking-tight">{display}</span>
                 </div>
            </div>
            
            {/* Keypad Area - White card with buttons */}
            <div className="flex-1 bg-white rounded-t-[24px] shadow-smart-float p-6 pb-2">
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
            <div className="p-4">
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === 'camera') {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
                .catch(console.error);
        }
    }, [status]);

    const handleCapture = () => {
        setStatus('processing');
        setTimeout(() => setStatus('result'), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-black relative">
            {status === 'camera' && (
                <>
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-10 flex items-center justify-between px-6 text-white">
                        <Icons.Flash className="w-6 h-6" />
                        <span className="text-sm font-medium tracking-wide opacity-90">文字扫描</span>
                        <Icons.Close className="w-6 h-6" />
                    </div>

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
                    
                    {/* Controls */}
                    <div className="h-32 bg-black flex items-center justify-around px-8 pb-8">
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
                    <p className="text-sm text-smart-text-sub">正在处理...</p>
                </div>
            )}

            {status === 'result' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 smart-dialog-mask">
                    <div className="w-full max-w-[320px] bg-white rounded-smart-lg shadow-2xl overflow-hidden animate-scale-up">
                         <div className="p-6">
                             <h3 className="text-lg font-bold text-smart-text-main mb-4">识别成功</h3>
                             <div className="bg-[#F9F9F9] border border-smart-divider rounded-md p-4 mb-4">
                                 <p className="text-sm text-smart-text-main leading-relaxed">
                                     Smartisan Design 风格已应用。系统检测到图像中的文本内容。
                                 </p>
                             </div>
                             <div className="flex gap-3">
                                 <button onClick={() => setStatus('camera')} className="flex-1 h-10 rounded-smart-btn bg-white border border-smart-divider text-smart-text-main font-medium text-sm hover:bg-gray-50">
                                     取消
                                 </button>
                                 <button onClick={() => setStatus('camera')} className="flex-1 h-10 rounded-smart-btn bg-smart-blue text-white font-medium text-sm hover:bg-blue-600 shadow-sm">
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


// 5. Tab Bar - Smartisan Style
const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
    const tabs: { id: Tab; icon: React.FC<any>; label: string }[] = [
        { id: 'food', icon: Icons.Food, label: '吃什么' },
        { id: 'calendar', icon: Icons.Calendar, label: '日历' },
        { id: 'calc', icon: Icons.Calculator, label: '计算器' },
        { id: 'scan', icon: Icons.Scan, label: '扫一扫' },
    ];

    return (
        <div className="h-[56px] bg-white shadow-tab-bar flex items-center justify-around z-50 pb-safe">
            {tabs.map((t) => {
                const isActive = active === t.id;
                return (
                    <button 
                        key={t.id} 
                        onClick={() => onChange(t.id)}
                        className="flex flex-col items-center justify-center w-full h-full pt-1"
                    >
                        <div className={`transition-colors duration-200 ${isActive ? 'text-[#333]' : 'text-[#999]'}`}>
                            <t.icon width={22} height={22} strokeWidth={2} />
                        </div>
                        <span className={`text-[10px] mt-0.5 font-medium transform scale-90 ${isActive ? 'text-[#333]' : 'text-[#999]'}`}>
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

  return (
    <div className="h-[100dvh] w-screen overflow-hidden font-sans bg-[#F2F2F2] text-[#333] flex flex-col items-center">
        {/* Main Content Container */}
        <div className="w-full h-full max-w-md bg-[#F2F2F2] flex flex-col relative shadow-2xl md:my-0">
            
            {/* Viewport */}
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'food' && <FoodView />}
                {activeTab === 'calc' && <CalcView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'scan' && <ScanView />}
            </main>

            {/* Bottom Navigation */}
            <div className="flex-none bg-white">
                <TabBar active={activeTab} onChange={setActiveTab} />
            </div>
        </div>
    </div>
  );
};

export default App;