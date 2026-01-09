
import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';

interface ImageAnnotatorProps {
  imageSrc: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

type Tool = 'arrow' | 'text';

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({ imageSrc, onSave, onCancel }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('arrow');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean; value: string } | null>(null);
  
  // State for restoring canvas during drawing previews
  const [savedImageData, setSavedImageData] = useState<ImageData | null>(null);

  // Initialize Canvas with Image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // Safety check
        if (containerWidth === 0 || containerHeight === 0) return;

        // Calculate scale to fit
        const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
        
        const width = img.width * scale;
        const height = img.height * scale;

        setCanvasSize({ width, height });
        
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
      }
    };
  }, [imageSrc]);

  const getMousePos = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // If we are in text mode, clicking creates a new input
    // If an input is already open, the blur event on that input will handle saving it first
    if (activeTool === 'text') {
      const pos = getMousePos(e);
      // Slight delay to allow blur event of previous input to fire if it exists
      setTimeout(() => {
        setTextInput({ x: pos.x, y: pos.y, visible: true, value: '' });
      }, 50);
      return;
    }

    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPos(pos);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      setSavedImageData(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || activeTool !== 'arrow' || !canvasRef.current || !savedImageData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Restore original state before drawing new line position (preview)
    ctx.putImageData(savedImageData, 0, 0);

    const currentPos = getMousePos(e);
    
    ctx.beginPath();
    ctx.strokeStyle = '#FF0000'; // Red color for annotations
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    // Draw Arrow Head
    const angle = Math.atan2(currentPos.y - startPos.y, currentPos.x - startPos.x);
    const headLen = 15;
    ctx.beginPath();
    ctx.moveTo(currentPos.x, currentPos.y);
    ctx.lineTo(currentPos.x - headLen * Math.cos(angle - Math.PI / 6), currentPos.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(currentPos.x - headLen * Math.cos(angle + Math.PI / 6), currentPos.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fillStyle = '#FF0000';
    ctx.fill();
  };

  const onMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setSavedImageData(null);
    }
  };

  // Called when the input loses focus or Enter is pressed
  const commitText = () => {
    if (!textInput || !canvasRef.current || !textInput.value.trim()) {
        setTextInput(null);
        return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
       ctx.font = 'bold 20px Arial';
       ctx.textBaseline = 'top'; 
       
       // Draw white outline (stroke) for visibility
       ctx.strokeStyle = 'white';
       ctx.lineWidth = 3;
       ctx.strokeText(textInput.value, textInput.x + 4, textInput.y + 4);

       // Draw red filled text
       ctx.fillStyle = '#FF0000';
       ctx.fillText(textInput.value, textInput.x + 4, textInput.y + 4);
    }
    setTextInput(null);
  };

  const clearCanvas = () => {
     const img = new Image();
     img.src = imageSrc;
     img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
     };
     setTextInput(null);
  };

  const handleSave = () => {
    // If there is an active text input, commit it first
    if (textInput) {
        commitText();
    }
    if (canvasRef.current) {
       onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      
      {/* Toolbar */}
      <div className="bg-white rounded-xl p-2 mb-4 flex gap-4 shadow-lg">
        <button 
          onClick={() => setActiveTool('arrow')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${activeTool === 'arrow' ? 'bg-wedding-600 text-white' : 'bg-wedding-50 text-slate-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
          {t('toolArrow')}
        </button>
        <button 
          onClick={() => setActiveTool('text')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${activeTool === 'text' ? 'bg-wedding-600 text-white' : 'bg-wedding-50 text-slate-600'}`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          {t('toolText')}
        </button>
        <div className="w-px bg-wedding-200 mx-2"></div>
        <button onClick={clearCanvas} className="px-4 py-2 rounded-lg font-medium text-sm text-red-500 hover:bg-red-50">
          {t('toolClear')}
        </button>
      </div>

      {/* Editor Area */}
      <div 
        ref={containerRef} 
        className="relative w-full max-w-5xl flex-grow bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-white/20"
      >
        {/* Relative wrapper with exact canvas dimensions ensures input absolute position is correct */}
        <div style={{ position: 'relative', width: canvasSize.width, height: canvasSize.height }}>
            <canvas 
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              className="cursor-crosshair shadow-2xl block"
            />

            {textInput && (
              <input
                autoFocus
                type="text"
                value={textInput.value}
                onChange={(e) => setTextInput(prev => prev ? ({...prev, value: e.target.value}) : null)}
                onBlur={commitText}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur(); // Triggers onBlur which calls commitText
                    }
                }}
                placeholder={t('textInputPlaceholder')}
                style={{ 
                    left: textInput.x, 
                    top: textInput.y,
                    font: 'bold 20px Arial',
                    color: '#FF0000',
                    textShadow: '0px 0px 2px white'
                }}
                className="absolute bg-transparent border border-dashed border-red-500/80 px-1 py-1 outline-none min-w-[150px] shadow-sm z-10"
              />
            )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex gap-4">
        <Button variant="secondary" onClick={onCancel}>
          {t('cancelEdit')}
        </Button>
        <Button onClick={handleSave}>
          {t('saveEdit')}
        </Button>
      </div>
    </div>
  );
};
