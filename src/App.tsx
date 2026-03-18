import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  ChevronLeft, 
  Settings, 
  Share, 
  Type, 
  Smile, 
  Music, 
  Plus, 
  Image as ImageIcon,
  Info,
  Palette,
  Wifi,
  Signal,
  Battery,
  Aperture
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { extractDominantColor, generateStoryGradient, extractTwoToneColors, generateDualGradient, generateOriginalGradient, GradientResult } from './utils/colorAlgorithm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [comparisonData, setComparisonData] = useState<{
    original: GradientResult | null;
    single: GradientResult | null;
    dual: GradientResult | null;
  }>({
    original: null,
    single: null,
    dual: null
  });

  const updateStrategyData = (strategy: 'original' | 'single' | 'dual', data: GradientResult) => {
    setComparisonData(prev => ({ ...prev, [strategy]: data }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ImageIcon size={18} className="text-white" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight uppercase">Story Color Extraction Lab</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest hidden sm:block">
              Side-by-Side Comparison Mode
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Left: Algorithm Info */}
          <div className="xl:col-span-3 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400">
                <Info size={16} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Extracted Data Comparison</h2>
              </div>
              
              <div className="space-y-4">
                {(['original', 'single', 'dual'] as const).map((strategy) => (
                  <div key={strategy} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{strategy}</h3>
                      {comparisonData[strategy] && (
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: comparisonData[strategy]!.top }} />
                          <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: comparisonData[strategy]!.bottom }} />
                        </div>
                      )}
                    </div>

                    {comparisonData[strategy] ? (
                      <div className="font-mono text-[9px] space-y-2 opacity-80">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: comparisonData[strategy]!.top }} />
                            <span className="text-neutral-500 uppercase font-bold text-[8px]">Top</span>
                          </div>
                          <div className="flex justify-between pl-3">
                            <span>L: {comparisonData[strategy]!.topOklch.l.toFixed(1)}%</span>
                            <span>C: {comparisonData[strategy]!.topOklch.c.toFixed(3)}</span>
                            <span>H: {comparisonData[strategy]!.topOklch.h.toFixed(0)}°</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: comparisonData[strategy]!.bottom }} />
                            <span className="text-neutral-500 uppercase font-bold text-[8px]">Bottom</span>
                          </div>
                          <div className="flex justify-between pl-3">
                            <span>L: {comparisonData[strategy]!.bottomOklch.l.toFixed(1)}%</span>
                            <span>C: {comparisonData[strategy]!.bottomOklch.c.toFixed(3)}</span>
                            <span>H: {comparisonData[strategy]!.bottomOklch.h.toFixed(0)}°</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-600 italic">No data</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400">
                <Settings size={16} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Parameters</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Merging Tolerance", value: "24" },
                  { label: "Chroma Limit", value: "0.18" },
                  { label: "Delta Range", value: "6 - 12" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center bg-neutral-900/30 px-3 py-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-neutral-400">{item.label}</span>
                    <span className="text-[10px] font-mono text-neutral-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Center: Comparison View */}
          <div className="xl:col-span-9">
            <ComparisonSet onDataUpdate={updateStrategyData} />
          </div>
        </div>
      </main>
    </div>
  );
}

const ComparisonSet: React.FC<{ onDataUpdate: (strategy: 'original' | 'single' | 'dual', data: GradientResult) => void }> = ({ onDataUpdate }) => {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-neutral-900/20">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
        {image ? (
          <div className="relative group">
            <img src={image} alt="Source" className="h-48 w-auto rounded-xl shadow-2xl border border-white/10" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl font-bold text-xs"
            >
              CHANGE IMAGE
            </button>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-4 text-neutral-500 hover:text-white transition-colors"
          >
            <div className="p-6 bg-white/5 rounded-full">
              <Upload size={48} strokeWidth={1} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">Upload Image to Compare</p>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">01. Original</h3>
            <p className="text-[10px] text-neutral-600 mt-1">80% to 40% Opacity Overlay</p>
          </div>
          <StoryFrame 
            image={image}
            strategy="original"
            onDataUpdate={(data) => onDataUpdate('original', data)}
          />
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">02. Single</h3>
            <p className="text-[10px] text-neutral-600 mt-1">Dominant Color OKLCH Delta</p>
          </div>
          <StoryFrame 
            image={image}
            strategy="single"
            onDataUpdate={(data) => onDataUpdate('single', data)}
          />
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">03. Dual</h3>
            <p className="text-[10px] text-neutral-600 mt-1">Two-Tone Region Extraction</p>
          </div>
          <StoryFrame 
            image={image}
            strategy="dual"
            onDataUpdate={(data) => onDataUpdate('dual', data)}
          />
        </div>
      </div>
    </div>
  );
};

interface StoryFrameProps {
  image: string | null;
  strategy: 'single' | 'dual' | 'original';
  onDataUpdate: (data: GradientResult) => void;
}

const StoryFrame: React.FC<StoryFrameProps> = ({ image, strategy, onDataUpdate }) => {
  const [gradient, setGradient] = useState<GradientResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      setIsProcessing(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = Math.min(200 / img.width, 200 / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let result: GradientResult;
        if (strategy === 'original') {
          const dominant = extractDominantColor(canvas);
          result = generateOriginalGradient(dominant.r, dominant.g, dominant.b);
        } else if (strategy === 'single') {
          const dominant = extractDominantColor(canvas);
          result = generateStoryGradient(dominant.r, dominant.g, dominant.b);
        } else {
          const { top, bottom } = extractTwoToneColors(canvas);
          result = generateDualGradient(top, bottom);
        }
        
        setGradient(result);
        onDataUpdate(result);
        setIsProcessing(false);
      };
    } else if (!image) {
      setGradient(null);
    }
  }, [image, strategy]);

  const defaultGradient = "linear-gradient(to bottom, #2d2d2d, #1a1a1a)";
  const currentGradient = gradient 
    ? (strategy === 'original' 
        ? `linear-gradient(to bottom, ${gradient.top}, ${gradient.bottom}), #000000` 
        : `linear-gradient(to bottom, ${gradient.top}, ${gradient.bottom})`)
    : defaultGradient;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <motion.div 
        layout
        className={cn(
          "relative aspect-[9/19.5] rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-neutral-900 transition-transform"
        )}
        style={{ background: currentGradient }}
      >
        {/* Mockup Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-7 z-30">
          <span className="text-[14px] font-semibold tracking-tight">9:41</span>
          
          <div className="flex items-center gap-1.5">
            <Signal size={16} strokeWidth={2.5} />
            <Wifi size={16} strokeWidth={2.5} />
            <Battery size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Top Left: Back Button */}
        <div className="absolute top-12 left-3 z-20">
          <ChevronLeft size={28} strokeWidth={2.5} className="text-white drop-shadow-md cursor-pointer" />
        </div>

        {/* Right Sidebar: Tools */}
        <div className="absolute top-12 right-4 flex flex-col items-center gap-6 z-20">
          <Settings size={28} strokeWidth={2} className="text-white drop-shadow-md cursor-pointer hover:rotate-45 transition-transform" />
          <Share size={28} strokeWidth={2} className="text-white drop-shadow-md cursor-pointer hover:scale-110 transition-transform" />
          
          <div className="w-8 h-[1px] bg-white/20" />

          <div className="flex flex-col items-center gap-6">
            <div className="relative cursor-pointer hover:scale-110 transition-transform flex flex-col items-center">
              <span className="text-2xl font-medium leading-none">Aa</span>
            </div>
            <Smile size={28} strokeWidth={2} className="text-white drop-shadow-md cursor-pointer hover:scale-110 transition-transform" />
            <Music size={28} strokeWidth={2} className="text-white drop-shadow-md cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Main Image Content */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {image ? (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group"
              >
                <img 
                  src={image} 
                  alt="Story content" 
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    isProcessing ? "opacity-50 grayscale" : "opacity-100"
                  )}
                  referrerPolicy="no-referrer"
                />
                
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-white/20">
                <div className="p-4 bg-white/5 rounded-full">
                  <ImageIcon size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Waiting for image</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Mockup Bottom Bar - Home Indicator only */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
          <div className="h-1 w-1/3 bg-white/40 mx-auto rounded-full" />
        </div>

        {/* Gradient Overlay for stability */}
        <div className="absolute inset-0 pointer-events-none bg-black/5" />
      </motion.div>
    </div>
  );
}
