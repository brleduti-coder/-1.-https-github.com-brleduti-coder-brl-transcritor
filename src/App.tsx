import { useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Download, Share2, Check, X, ArrowRight } from 'lucide-react';

const WEBHOOK_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/webhook/transcrever-video/sync`
  : '/webhook/transcrever-video/sync';

export default function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ message: string; link?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchVideoTitle = async (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) return (await res.json()).title;
      }
    } catch {}
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, title: title || 'Título não identificado' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Falha ao processar. Tente novamente.');
      }

      const data = await res.json();
      setResponse({ message: data.message || 'Transcrição concluída!', link: data.link });
      setVideoUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#FFCC00] selection:text-black flex flex-col" translate="no">

      {/* ── Success Modal ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {response?.link && (
            <motion.div key="modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setResponse(null)}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-[360px] bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Top accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#FFCC00]/50 to-transparent" />

                <div className="p-8">
                  <button
                    onClick={() => setResponse(null)}
                    className="absolute top-3 right-3 p-1.5 text-white/20 hover:text-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex flex-col items-center text-center space-y-5">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-white/[0.06]"
                    >
                      <img src="/icon.png" alt="BRL" className="w-full h-full object-cover" />
                    </motion.div>

                    <div className="space-y-1.5">
                      <h2 className="text-lg font-semibold">Pronto!</h2>
                      <p className="text-[13px] text-white/40 leading-relaxed">{response.message}</p>
                    </div>

                    <motion.a
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      href={response.link}
                      download
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#FFCC00] text-black rounded-xl font-semibold text-[13px] transition-colors hover:bg-[#ffe066]"
                    >
                      <Download size={16} strokeWidth={2.5} />
                      Baixar .docx
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-40%] right-[-20%] w-[70%] h-[70%] bg-[#FFCC00]/[0.03] blur-[100px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-50 border-b border-white/[0.04]">
        <div className="max-w-2xl mx-auto px-5 h-18 flex items-center justify-between">
          <img src="/logo.png" alt="BRL Educação" className="h-10" />
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/30 hover:text-white/60 text-[11px] font-medium transition-colors"
          >
            {copied ? <Check size={12} className="text-[#FFCC00]" /> : <Share2 size={12} />}
            {copied ? 'Copiado' : 'Compartilhar'}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[640px] space-y-8">

          {/* Copy + Meio Asterisco */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Label */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFCC00]/70 text-center">
              Marketing &middot; CS &middot; Consultores
            </p>

            {/* Headline + icon row */}
            <div className="flex items-center justify-center gap-4">
              {/* Ícone starburst completo */}
              <img
                src="/meio-asterisco.svg"
                alt=""
                className="hidden sm:block shrink-0 w-[90px] h-auto self-stretch object-contain"
              />

              <div>
                <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight leading-[1.1]">
                  Transcreva vídeos<br />
                  <span className="bg-[#FFCC00] text-black px-2 py-0.5 inline-block">em um clique.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-[15px] text-white/35 leading-relaxed mt-3 max-w-[380px]">
                  Ferramentas internas com uso ilimitado, feitas para facilitar o dia a dia dos colaboradores da BRL.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="Cole o link do vídeo aqui"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[14px] placeholder:text-white/15 focus:outline-none focus:border-[#FFCC00]/30 focus:bg-white/[0.06] transition-all"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !videoUrl}
                className="px-5 bg-[#FFCC00] hover:bg-[#ffe066] disabled:bg-white/[0.04] disabled:text-white/10 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-[13px] shrink-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Transcrever
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-white/15 pl-1">
              YouTube e Instagram &middot; Resultado em .docx
            </p>
          </motion.form>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="px-4 py-3 bg-red-500/[0.06] border border-red-500/10 rounded-xl"
              >
                <p className="text-[12px] text-red-400/80">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-5">
        <p className="text-center text-[11px] text-white/10">
          © {new Date().getFullYear()} Brl Educação
        </p>
      </footer>
    </div>
  );
}
