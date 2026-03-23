/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Send, CheckCircle2, Loader2, ExternalLink, AlertCircle, Play, Sparkles, Layers, Zap, Instagram, Youtube, Globe, X } from 'lucide-react';

const WEBHOOK_URL = 'https://automacoes-n8n.2vxsdz.easypanel.host/webhook/transcrever-video';

// Logo component that uses an image if available, otherwise a stylized text logo
const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          {/* Stylized sun/spark icon matching the provided logo */}
          <path d="M50 5L58 35L88 35L64 55L75 85L50 68L25 85L36 55L12 35L42 35L50 5Z" fill="#FFCC00" />
          <circle cx="50" cy="50" r="12" fill="#FFCC00" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-extrabold tracking-tight text-white">Brl</span>
        <span className="text-xl font-light tracking-tight text-white">Educação</span>
      </div>
    </div>
  </div>
);

export default function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ message: string; link?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoTitle = async (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          return data.title;
        }
      }
    } catch (e) {
      console.error('Error fetching title:', e);
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const title = await fetchVideoTitle(videoUrl);

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: videoUrl,
          title: title || 'Título não identificado'
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar o link. Por favor, tente novamente.');
      }

      const text = await res.text();
      
      let message = '';
      let folderLink = '';

      if (res.ok) {
        // Default link
        folderLink = 'https://drive.google.com/drive/u/0/folders/1bcWtLHE68F6d29QvocNb4FvmwtQjG0Sl';
        
        try {
          // Try to parse JSON to get a specific link or message if available
          const data = JSON.parse(text);
          const extractedLink = data.link || data.url || data.folder || data.driveLink || data.output;
          if (extractedLink) folderLink = extractedLink;
          message = data.message || data.text || 'O processamento foi iniciado com sucesso!';
        } catch (e) {
          // If not JSON, use the text as message if it's not just "certo"
          message = text.length < 100 && text.length > 0 ? text : 'Vídeo enviado com sucesso para processamento!';
          
          // Try to find a link in the raw text
          const linkMatch = text.match(/https?:\/\/[^\s]+/);
          if (linkMatch) folderLink = linkMatch[0];
        }

        // Ensure we have the Drive link as fallback
        if (!folderLink) folderLink = 'https://drive.google.com/drive/u/0/folders/1bcWtLHE68F6d29QvocNb4FvmwtQjG0Sl';
        
        setResponse({ message, link: folderLink });
        setVideoUrl('');
      } else {
        throw new Error(text || 'O servidor retornou uma resposta de erro.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FFCC00] selection:text-black overflow-x-hidden">
      {/* Success Modal / Popup */}
      <AnimatePresence>
        {response && response.link && (
          <motion.div 
            key="success-modal-container"
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResponse(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[40px] p-10 shadow-[0_0_100px_rgba(255,204,0,0.15)] overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFCC00]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FFCC00]/5 rounded-full blur-3xl" />
              
              <button 
                onClick={() => setResponse(null)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 bg-[#FFCC00] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,204,0,0.3)]">
                  <CheckCircle2 size={40} className="text-black" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Vídeo Pronto!</h2>
                  <p className="text-gray-400 leading-relaxed">
                    {response.message || 'O processamento foi concluído com sucesso. Clique abaixo para acessar o seu vídeo na pasta do Google Drive.'}
                  </p>
                </div>

                <motion.a
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  href={response.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-full py-8 bg-[#FFCC00] text-black rounded-[30px] font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(255,204,0,0.2)] hover:shadow-[0_25px_50px_rgba(255,204,0,0.3)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Youtube size={28} />
                    <span>Acessar Vídeo</span>
                    <Zap size={24} className="group-hover:scale-125 transition-transform" />
                  </div>
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-[30px] border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                </motion.a>
                
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">
                  Brl Educação • Premium Service
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFCC00]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FFCC00]/3 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          <Logo />
          <nav className="hidden lg:flex items-center gap-12">
            {['Início', 'Tecnologia', 'Planos', 'Suporte'].map((item) => (
              <a key={item} href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-gray-400 hover:text-[#FFCC00] transition-all relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#FFCC00] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium transition-all">
              <Globe size={12} />
              PT-BR
            </button>
            <a 
              href="https://drive.google.com/drive/u/0/folders/1bcWtLHE68F6d29QvocNb4FvmwtQjG0Sl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-sm font-bold transition-all flex items-center gap-3 group"
            >
              <Youtube size={18} className="text-[#FFCC00] group-hover:scale-110 transition-transform" />
              Pasta de Vídeos
            </a>
            <button className="px-8 py-3 bg-[#FFCC00] hover:bg-white text-black rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,204,0,0.2)]">
              Entrar
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-40">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#FFCC00]/10 border border-[#FFCC00]/20 rounded-full"
            >
              <Sparkles size={14} className="text-[#FFCC00]" />
              <span className="text-xs font-medium text-[#FFCC00]">Inteligência Artificial de elite</span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl md:text-8xl font-bold tracking-tight leading-[1.1]"
              >
                Transcrição <br />
                <span className="text-[#FFCC00] drop-shadow-[0_0_30px_rgba(255,204,0,0.1)]">sem limites.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-400 max-w-xl leading-relaxed font-medium"
              >
                A plataforma definitiva para converter vídeos do YouTube e Instagram em transcrições perfeitas. Tecnologia BRL Educação para resultados profissionais.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-12 pt-4"
            >
              <div className="space-y-2">
                <div className="text-4xl font-black text-white tracking-tighter italic">99.8%</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">Precisão Absoluta</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-black text-white tracking-tighter italic">&lt; 30s</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">Tempo de Resposta</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-black text-white tracking-tighter italic">10k+</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">Usuários Ativos</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <div className="bg-[#0F0F0F] border border-white/10 rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FFCC00] to-transparent opacity-40" />
                
                <div className="space-y-10">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">Processar vídeo</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">Nossa IA analisará o conteúdo e gerará a transcrição completa em instantes.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <label htmlFor="url" className="text-sm font-semibold text-[#FFCC00] flex items-center gap-3">
                        <Link size={14} />
                        Endereço do conteúdo
                      </label>
                      <div className="relative group/input">
                        <input
                          id="url"
                          type="url"
                          required
                          placeholder="Cole o link aqui..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full px-8 py-6 bg-black border border-white/10 rounded-3xl focus:outline-none focus:border-[#FFCC00]/40 focus:ring-[12px] focus:ring-[#FFCC00]/5 transition-all placeholder:text-gray-800 text-base font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !videoUrl}
                      className="w-full bg-[#FFCC00] hover:bg-white disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-black font-bold py-6 rounded-3xl shadow-2xl shadow-[#FFCC00]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Processando informações...
                        </>
                      ) : (
                        <>
                          <Play size={18} className="fill-black" />
                          Gerar transcrição
                        </>
                      )}
                    </button>
                  </form>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error-message-box"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-start gap-5 text-red-400"
                      >
                        <AlertCircle className="shrink-0 mt-1" size={20} />
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Falha no Sistema</p>
                          <p className="text-xs leading-relaxed opacity-80">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white text-black px-6 py-4 rounded-2xl shadow-2xl z-20 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Servidor Online</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/5 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <Logo className="opacity-50 grayscale hover:grayscale-0 transition-all" />
            
            <div className="flex items-center gap-12">
              <a href="https://drive.google.com/drive/u/0/folders/1bcWtLHE68F6d29QvocNb4FvmwtQjG0Sl" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#FFCC00] hover:text-white transition-colors flex items-center gap-2">
                <Youtube size={16} />
                Pasta Drive
              </a>
              <a href="#" className="text-gray-600 hover:text-[#FFCC00] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-600 hover:text-[#FFCC00] transition-colors"><Youtube size={20} /></a>
              <a href="#" className="text-gray-600 hover:text-[#FFCC00] transition-colors"><Globe size={20} /></a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-xs text-gray-600 font-medium">
                © {new Date().getFullYear()} Brl Educação • Premium Service
              </p>
              <p className="text-[10px] text-gray-800 font-bold tracking-widest uppercase">
                Powered by Advanced Neural Networks
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


