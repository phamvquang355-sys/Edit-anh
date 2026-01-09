
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { EditControls } from './components/EditControls';
import { ImageAnnotator } from './components/ImageAnnotator';
import { Button } from './components/Button';
import { EditOptions, LoadingState } from './types';
import { generateEditedImage } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { t } = useLanguage();
  
  // File & Image State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null); 
  const [isEditing, setIsEditing] = useState(false);

  // Result State
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // App Init
  useEffect(() => {
    const initializeApp = async () => {
      // Check API key requirement
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsApiKey(true);
        }
      }
    };
    initializeApp();
  }, []);

  // Options State (Only Edit Options remain)
  const [editOptions, setEditOptions] = useState<EditOptions>({
    additionalPrompt: '',
    imageCount: 1,
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: 'idle',
    message: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnnotatedImage(null); // Reset annotation
      setResultUrls([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const selectedFile = e.dataTransfer.files[0];
       setFile(selectedFile);
       setPreviewUrl(URL.createObjectURL(selectedFile));
       setAnnotatedImage(null); // Reset annotation
       setResultUrls([]);
    }
  };

  const handleAnnotateComplete = (dataUrl: string) => {
    setAnnotatedImage(dataUrl);
    setIsEditing(false);
  };

  // Allow using a generated result as the new input for further editing
  const handleRefineResult = async (imageUrl: string) => {
    try {
        setLoadingState({ status: 'generating', message: 'Loading image for refinement...' });
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "refined_image.png", { type: "image/png" });
        
        setFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnnotatedImage(null);
        setResultUrls([]);
        setLoadingState({ status: 'idle', message: '' });
        setIsEditing(true); // Automatically open annotator
    } catch (e) {
        console.error("Failed to transfer image", e);
        setLoadingState({ status: 'error', message: "Could not load image" });
    }
  };

  const handleGenerate = async () => {
    if (!annotatedImage && !file) return;

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsApiKey(true);
        return;
      }
    }

    setLoadingState({ status: 'generating', message: t('processingEdit') });
    
    try {
        // Prepare input image
        let inputImage = annotatedImage;
        if (!inputImage && file) {
             const reader = new FileReader();
             inputImage = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
             });
        }

        if (inputImage) {
            const generatedImages = await generateEditedImage(inputImage, editOptions);
            setResultUrls(generatedImages);
        }

      setLoadingState({ status: 'success', message: t('renderComplete') });
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("Requested entity was not found.")) {
        setNeedsApiKey(true);
      }
      setLoadingState({ status: 'error', message: t('error') });
    }
  };

  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-wedding-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-wedding-200">
          <div className="w-16 h-16 bg-wedding-100 rounded-full flex items-center justify-center mx-auto mb-6 text-wedding-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818l5.73-5.73a1.5 1.5 0 0 0 .43-1.563 6 6 0 1 1 10.5-4.5V5.25z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-wedding-900 mb-4 uppercase tracking-tight">Kích hoạt Gemini Pro</h2>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            Để sử dụng tính năng Diễn họa 3D chất lượng cao, bạn cần chọn một API Key từ dự án Google Cloud có trả phí.
          </p>
          <Button onClick={handleOpenKeyDialog} fullWidth>Chọn API Key</Button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-4 text-xs text-wedding-600 hover:underline font-medium"
          >
            Tìm hiểu về Billing & API Key
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-wedding-50">
      <Header />
      
      {/* Edit Overlay */}
      {isEditing && previewUrl && (
        <ImageAnnotator 
          imageSrc={previewUrl} 
          onSave={handleAnnotateComplete} 
          onCancel={() => setIsEditing(false)} 
        />
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-wedding-100">
                <h2 className="font-serif text-2xl font-semibold mb-6 text-wedding-900">{t('designStudio')}</h2>
                
                {/* Image Preview / Annotation Status */}
                {file && (previewUrl || annotatedImage) && (
                  <div className="mb-6 p-4 bg-wedding-50/50 rounded-lg border border-wedding-200">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-wedding-900 uppercase tracking-widest">
                            {annotatedImage ? t('annotatedImage') : t('originalSketch')}
                        </span>
                        <button onClick={() => { setFile(null); setPreviewUrl(null); setAnnotatedImage(null); setResultUrls([]); setLoadingState({ status: 'idle', message: '' }); }} className="text-xs text-red-500 hover:text-red-600 font-medium underline">
                          {t('removeChange')}
                        </button>
                     </div>
                     <div className="rounded-md overflow-hidden border border-wedding-200 bg-white shadow-sm relative group">
                        <img src={annotatedImage || previewUrl || ''} alt="Input" className="w-full h-auto max-h-60 object-contain mx-auto" />
                        
                        {/* Edit Button Overlay */}
                        {!annotatedImage && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => setIsEditing(true)} variant="secondary" className="shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                    {t('performEdit')}
                                </Button>
                             </div>
                        )}
                        {annotatedImage && (
                             <div className="absolute bottom-2 right-2">
                                <button onClick={() => setIsEditing(true)} className="bg-white p-2 rounded-full shadow-md hover:bg-wedding-50 text-wedding-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                             </div>
                        )}
                     </div>
                     {!annotatedImage && (
                         <div className="mt-2 text-center">
                            <Button onClick={() => setIsEditing(true)} fullWidth variant="outline">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                                {t('performEdit')}
                            </Button>
                         </div>
                     )}
                  </div>
                )}
                
                <EditControls options={editOptions} setOptions={setEditOptions} />

                <div className="mt-8 pt-6 border-t border-wedding-100">
                  <Button onClick={handleGenerate} fullWidth isLoading={loadingState.status === 'generating'} disabled={!file}>
                    {loadingState.status === 'generating' ? t('generating') : t('generateEdit')}
                  </Button>
                  {loadingState.status === 'error' && <p className="mt-2 text-sm text-red-500 text-center">{loadingState.message}</p>}
                </div>
              </div>
            </div>

            {/* Right Column: Upload / Results */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {!file && (
                 <div onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-wedding-300 rounded-xl bg-white/50 hover:bg-white hover:border-wedding-500 transition-all cursor-pointer min-h-[500px]">
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   <div className="w-16 h-16 rounded-full bg-wedding-100 flex items-center justify-center mb-4 text-wedding-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg></div>
                   <h3 className="font-serif text-xl text-slate-700">{t('uploadSketch')}</h3>
                   <p className="text-slate-500 mt-2">{t('dragDrop')}</p>
                 </div>
              )}

              {file && (
                <div className="flex flex-col gap-6 h-full">
                  <div className="relative flex-grow min-h-[500px] bg-black/5 rounded-xl overflow-hidden shadow-inner border border-wedding-200 group">
                    {loadingState.status === 'generating' ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                          <div className="w-16 h-16 border-4 border-wedding-200 border-t-wedding-600 rounded-full animate-spin mb-4"></div>
                          <p className="font-serif text-lg text-wedding-800 animate-pulse">{loadingState.message}</p>
                       </div>
                    ) : resultUrls.length > 0 ? (
                      <div className="relative h-full w-full p-6 bg-slate-900 overflow-y-auto">
                        <div className={`grid gap-6 ${resultUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} h-full content-center`}>
                          {resultUrls.map((url, idx) => (
                            <div key={idx} className="relative group/img animate-in fade-in duration-700">
                               <img 
                                 src={url} 
                                 alt={`Result ${idx}`} 
                                 className="w-full h-auto object-contain rounded-lg border border-white/10 cursor-zoom-in hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
                                 onClick={() => setZoomedImage(url)}
                               />
                               <div className="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col gap-2">
                                  {/* Download */}
                                  <a 
                                    href={url} 
                                    download={`wedding_result_${idx+1}.png`} 
                                    className="bg-white/90 px-3 py-2 rounded-full shadow-lg text-slate-900 hover:bg-white flex items-center gap-2 backdrop-blur-sm transition-all" 
                                    title={t('downloadBtn')} 
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                    <span className="text-[10px] font-bold uppercase">{t('downloadBtn')}</span>
                                  </a>

                                  <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleRefineResult(url);
                                      }}
                                      className="bg-white/90 px-3 py-2 rounded-full shadow-lg text-slate-900 hover:bg-white flex items-center gap-2 backdrop-blur-sm transition-all" 
                                      title={t('editBtn')}
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                      </svg>
                                      <span className="text-[10px] font-bold uppercase">{t('editBtn')}</span>
                                  </button>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-wedding-50">
                         <p className="font-serif text-slate-400 italic text-lg">{t('configurePrompt')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-200" />
          <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all" onClick={() => setZoomedImage(null)}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <p className="absolute bottom-6 text-white/50 text-xs tracking-widest uppercase font-medium">Nhấp vào bất kỳ đâu để đóng</p>
        </div>
      )}
    </div>
  );
}

export default App;
