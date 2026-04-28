import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface Props {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<Props> = ({ project, index }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const mainImage = project.images?.[0] || "https://images.unsplash.com/photo-1579389083002-421d6837a40b?auto=format&fit=crop&q=80&w=1200";

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % (project.images?.length || 1));
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + (project.images?.length || 1)) % (project.images?.length || 1));

  React.useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        onClick={() => setIsGalleryOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] glitch-hover"
      >
        {/* Project Numbering */}
        <div className="absolute top-10 left-10 z-20 pointer-events-none flex flex-col gap-1 items-center">
           <span className="font-mono text-[10px] font-bold text-brand group-hover:text-cyber-green transition-colors duration-700">
             {(index + 1).toString().padStart(2, '0')}
           </span>
           <div className="h-4 w-[1px] bg-brand/20" />
        </div>

        {/* Vertical Accent */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700 hidden sm:block">
           <span className="writing-vertical font-jp text-[8px] tracking-[0.6em] text-white uppercase">プロジェクト // PROJECT</span>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-square md:aspect-[4/5]">
          <img
            src={mainImage}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          {/* Advanced Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100" />
        </div>
        
        {/* Hover/Touch info - Editorial Style */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0 md:group-hover:translate-y-0 touch-none">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-6 md:w-8 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 delay-300 origin-left"></span>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/70">
                {project.category}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-white font-bold tracking-tight italic leading-[1.0]">
              {project.title}
            </h3>
            <div className="flex items-center gap-3 pt-3">
              <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-white border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md hover:bg-white hover:text-black transition-all">
                Explorar Case
              </span>
            </div>
          </div>
        </div>

        {/* Visible title on mobile (no-hover) */}
        <div className="absolute bottom-6 left-6 z-10 md:hidden group-hover:hidden transition-all duration-500">
           <h3 className="font-display text-xl text-white font-bold italic tracking-tight drop-shadow-md">
              {project.title}
           </h3>
        </div>

        {/* Static info for mobile/no-hover */}
        <div className="absolute top-6 right-6 opacity-80 group-hover:opacity-0 transition-opacity duration-500">
           <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Maximize2 size={16} className="text-white" />
           </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] overflow-hidden bg-black/98"
          >
            {/* Background Layer (Click to close) */}
            <div 
              className="absolute inset-0 z-0 cursor-zoom-out" 
              onClick={() => setIsGalleryOpen(false)} 
            />

            {/* Scrollable Container */}
            <div className="absolute inset-0 z-10 overflow-y-auto px-4 py-12 md:p-10 lg:p-20 scrollbar-hide">
              <div className="min-h-full w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                
                <div 
                  className="w-full flex flex-col lg:flex-row gap-10 md:gap-16 items-start lg:items-center justify-center pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Image Container */}
                  <div className="relative flex-1 w-full flex items-center justify-center group/modal bg-white/5 rounded-[2rem] overflow-hidden p-2 md:p-6 min-h-[300px]">
                    <img 
                      src={(project.images && project.images[currentImgIndex]) || mainImage} 
                      className="max-w-full h-auto max-h-[70vh] lg:max-h-[85vh] object-contain shadow-2xl transition-transform duration-700"
                      alt={project.title}
                      referrerPolicy="no-referrer"
                    />
                    
                    {project.images?.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); prevImg(); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 md:p-5 bg-black/40 hover:bg-brand text-white rounded-full backdrop-blur-xl border border-white/10 transition-all z-20 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); nextImg(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 md:p-5 bg-black/40 hover:bg-brand text-white rounded-full backdrop-blur-xl border border-white/10 transition-all z-20 cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}

                    {/* Image Counter Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/50 border border-white/10">
                      {currentImgIndex + 1} / {project.images?.length || 0}
                    </div>
                  </div>

                  {/* Info Container */}
                  <div className="w-full lg:w-[450px] text-white flex flex-col space-y-8 md:space-y-10 relative">
                    {/* Minimal Hanko in Gallery */}
                    <div className="absolute -right-20 top-0 opacity-20 hidden xl:block">
                      <div className="hanko-stamp scale-150">
                        <span>ウ</span>
                        <span>オ</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="h-px w-10 bg-brand"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand font-mono">Case Study [NODE_0x{index}]</span>
                      </div>
                      <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold italic tracking-tighter leading-[0.85]">
                        {project.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-white/60 text-lg md:text-xl leading-relaxed italic font-medium">
                        "{project.description}"
                      </p>
                      <div className="flex flex-wrap gap-4">
                         <div className="text-[10px] font-black uppercase tracking-widest px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white/70">
                           {project.category}
                         </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                       <button 
                         onClick={() => setIsGalleryOpen(false)}
                         className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] bg-white text-black hover:bg-brand hover:text-white transition-all rounded-full"
                       >
                         Voltar ao Portfólio
                       </button>
                       <a
                         href={`https://wa.me/?text=Olá, vi seu projeto "${project.title}" e gostei bastante!`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 text-white hover:bg-white/10 transition-all rounded-full flex items-center justify-center"
                       >
                         Interessado
                       </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Close Button - FIXED relative to window */}
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="fixed top-6 right-6 md:top-12 md:right-12 text-white hover:text-brand transition-all p-5 z-[100] bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-2xl cursor-pointer group shadow-2xl"
              aria-label="Close Gallery"
            >
              <X size={28} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectCard;
