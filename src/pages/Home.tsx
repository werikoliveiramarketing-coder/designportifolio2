import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import * as LucideIcons from "lucide-react";
import { Instagram, Mail, MessageCircle, ArrowDown, Linkedin, Twitter, Facebook, Github, Gitlab } from "lucide-react";
import { Project, ContactInfo, Service } from "../types";
import ProjectCard from "../components/ProjectCard";

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const iconEntries = Object.entries(LucideIcons);
  const found = iconEntries.find(([key]) => key.toLowerCase() === name.toLowerCase());
  const Icon = found ? (found[1] as any) : LucideIcons.Zap;
  return <Icon className={className} />;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [settings, setSettings] = useState<any>(null);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioRes = await fetch("/api/portfolio");
        if (portfolioRes.ok) {
          const data = await portfolioRes.json();
          setProjects(data);
        }

        const servicesRes = await fetch("/api/services");
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data);
        }

        const contactRes = await fetch("/api/contact");
        if (contactRes.ok) {
          const data = await contactRes.json();
          setContact(data);
        }

        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const [filter, setFilter] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const filteredProjects = projects.filter(p => filter === "All" || p.category === filter);
  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];

  return (
    <div className="flex flex-col overflow-x-hidden selection:bg-brand selection:text-white relative bg-white cyber-grid">
      {/* Visual Overlays */}
      <div className="scanline-overlay" />
      
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md px-6 md:px-12 py-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-black/5">
        <span className="text-brand text-lg tracking-tighter">{'ウ>オ'}</span>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-12">
          {[
            { id: "about", label: "Sobre", jp: "概要" },
            { id: "services", label: "Serviços", jp: "事業" },
            { id: "portfolio", label: "Trabalhos", jp: "作品" },
            { id: "contact", label: "Contato", jp: "連絡" }
          ].map((link) => (
            <button 
              key={link.id}
              onClick={() => scrollToSection(link.id)} 
              className="hover:text-brand transition-colors flex flex-col items-center group cursor-pointer"
            >
              <span>{link.label}</span>
              <span className="text-[7px] opacity-0 group-hover:opacity-40 transition-opacity font-jp tracking-normal">
                {link.jp}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-900"
        >
          <LucideIcons.Menu size={20} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={isMenuOpen ? { x: 0 } : { x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-100 bg-white md:hidden flex flex-col items-center justify-center gap-10"
      >
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6 p-4 text-slate-900"
        >
          <LucideIcons.X size={24} />
        </button>
        
        {['about', 'services', 'portfolio', 'contact'].map((item) => (
          <button 
            key={item}
            onClick={() => {
              scrollToSection(item);
              setIsMenuOpen(false);
            }} 
            className="font-display text-4xl font-bold tracking-tighter italic text-slate-900 hover:text-brand transition-colors capitalize"
          >
            {item === 'about' ? 'Sobre' : item === 'services' ? 'Serviços' : item === 'portfolio' ? 'Trabalhos' : 'Contato'}
          </button>
        ))}
      </motion.div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center px-4 pt-20 overflow-hidden">
        {/* Decorative Corners */}
        <div className="absolute top-10 left-10 w-32 h-32 pointer-events-none opacity-20">
          <div className="cyber-corner cyber-corner-tl" />
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 pointer-events-none opacity-20 text-right">
          <div className="cyber-corner cyber-corner-tr" />
          <span className="font-mono text-[6px] tracking-widest block pt-2 pr-6">L_SYS_INIT_0.1</span>
        </div>

        {/* Hanko Stamp */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-32 left-8 md:left-12 z-40"
        >
          <div className="hanko-stamp">
            <span>ウ</span>
            <span>オ</span>
          </div>
        </motion.div>

        {/* Vertical Japanese Accents */}
        <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-8">
          <span className="writing-vertical text-[10px] font-jp font-light tracking-[0.8em] text-slate-300 opacity-50 uppercase">クリエイティブ / CREATIVE</span>
          <div className="h-24 w-px bg-slate-100" />
          <span className="font-mono text-[8px] text-slate-300 tracking-tighter">[BOOT_v.2.4]</span>
        </div>

        {/* Watermark Section 1 */}
        <motion.div 
          style={{ y: watermarkY, opacity: 0.03 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
        >
          <span className="font-display font-black text-[25vw] tracking-tighter uppercase leading-none text-slate-900 whitespace-nowrap select-none">
            Portfolio
          </span>
        </motion.div>

        <motion.div style={{ y: textY, opacity: heroOpacity, scale }} className="text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <span className="font-jp text-[12px] tracking-[0.8em] text-brand opacity-40 block mb-2 uppercase">ウィリアン オリベイラ</span>
            <div className="inline-block border border-brand/20 px-6 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-[.4em] text-brand">
              Digital Designer
            </div>
          </motion.div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[12rem] font-bold leading-[0.8] tracking-tighter">
            <span className="text-brand">Willian</span> <br /> 
            <span className="text-slate-900">Oliveira</span>
          </h1>
          <p className="mx-auto mt-12 max-w-lg text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            Design minimalista, estratégico e focado em resultados reais para marcas que buscam excelência.
          </p>
        </motion.div>

        {/* Subtle Background Parallax elements */}
        <motion.div 
          style={{ y: bgY }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -right-40 -top-40 w-[600px] h-[600px] border border-brand/10 rounded-full"
        />
        <motion.div 
          style={{ y: heroY }}
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute left-1/4 -bottom-20 w-[400px] h-[400px] bg-brand/3 blur-[120px] rounded-full"
        />

        <motion.button
          onClick={() => scrollToSection("about")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-3 hover:text-brand transition-all cursor-pointer group"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <ArrowDown size={14} className="opacity-40 group-hover:opacity-100" />
          </motion.div>
        </motion.button>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-40 px-6 md:px-20 bg-white border-y border-slate-100">
        {/* Japanese Title Watermark */}
        <div className="absolute left-[5%] top-40 z-0 opacity-10 hidden lg:block overflow-hidden h-[400px]">
          <span className="writing-vertical text-9xl font-jp font-bold text-slate-100 leading-tight">職人としてのこだわり</span>
        </div>
        
        <div className="absolute right-8 bottom-20 z-0 opacity-[0.03] pointer-events-none hidden lg:block uppercase font-mono text-[120px] leading-none tracking-tighter italic">
          Profile
        </div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="flex-1 relative group"
          >
            <div className="aspect-[3/4] bg-slate-50 overflow-hidden shadow-2xl relative z-10">
               <img 
                 src={contact?.profileImageUrl || "https://images.unsplash.com/photo-1579389083395-4507e9f4a1cc?auto=format&fit=crop&q=80&w=800"} 
                 alt="Willian Oliveira"
                 className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                 referrerPolicy="no-referrer"
               />
            </div>
            <div className="absolute -inset-8 border border-brand/20 -z-0 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex-1 space-y-10"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand block font-mono">/ profile</span>
              <h2 className="font-display text-4xl md:text-6xl font-bold leading-none tracking-tight text-slate-900 italic">
                Onde a <br /> <span className="text-brand">Simplicidade</span> <br /> encontra a <br /> excelência.
              </h2>
            </div>
            
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-xl">
              {contact?.about || "Menos é mais. Acredito que o design deve ser invisível até que seja necessário. Meu processo foca em destilar a complexidade em formas puras e mensagens diretas."}
            </p>

            <div className="flex flex-wrap gap-8 md:gap-16 pt-10 border-t border-slate-100">
               <div className="group">
                 <p className="font-display text-5xl font-black text-slate-900 group-hover:text-brand transition-colors">+{settings?.identitiesCreated || 150}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Identidades</p>
               </div>
               <div className="group">
                 <p className="font-display text-5xl font-black text-slate-900 group-hover:text-brand transition-colors">+{settings?.yearsExperience || 5}Y</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Experiência</p>
               </div>
               <div className="group">
                 <p className="font-display text-5xl font-black text-slate-900 group-hover:text-brand transition-colors">+{settings?.artsCreated || 500}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Artes Criadas</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section (Light Theme with White Cards) */}
      <section id="services" className="py-40 px-6 md:px-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl relative">
              <div className="absolute -left-12 top-0 h-full w-px bg-brand/20 hidden md:block" />
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand block font-mono">/ expertise [CORE_02]</span>
                <span className="font-jp text-[12px] text-slate-300">専門知識</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-slate-900 uppercase italic">
                Soluções <br /> Estratégicas
              </h2>
            </div>
            <p className="text-slate-400 font-bold max-w-[200px] text-right uppercase tracking-[0.2em] text-[10px] leading-loose">
              Elevando o potencial <br /> de marcas através de <br /> design de alto nível.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 text-brand/5 group-hover:text-brand/10 transition-colors">
                   <IconComponent name={s.iconName} className="w-32 h-32 rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand transition-colors duration-500">
                    <IconComponent name={s.iconName} className="w-8 h-8 text-brand group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{s.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-700 transition-colors">
                    {s.description}
                  </p>
                </div>
                
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-brand group-hover:w-full transition-all duration-700"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid (High-End Modular Editorial Layout) */}
      <section id="portfolio" className="relative bg-white py-40 px-4 md:px-12 overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-0 right-0 py-20 pointer-events-none opacity-[0.02] select-none scale-125 md:scale-150 origin-right">
           <span className="font-display font-black text-[20vh] md:text-[30vh] leading-none uppercase tracking-tighter block">Selected</span>
           <span className="font-display font-black text-[20vh] md:text-[30vh] leading-none uppercase tracking-tighter block -mt-10 md:-mt-20">Works</span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24 md:mb-40 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-brand rotate-45" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand font-mono">Archive [v.01]</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-8xl text-slate-900 tracking-tighter font-bold lowercase leading-[0.85]">
                Selected <br /> <span className="text-brand italic font-normal">Projects</span>
              </h2>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-8">
              <p className="md:text-right text-slate-400 font-medium max-w-[280px] leading-relaxed">
                Uma curadoria de identidades visuais e experiências digitais focadas em clareza, impacto e estética minimalista.
              </p>
              <div className="flex flex-wrap gap-3 justify-end">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setFilter(cat)}
                     className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${filter === cat ? 'bg-brand border-brand text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-brand/40 hover:text-brand'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 md:gap-x-8 lg:gap-x-10"
          >
            {filteredProjects.map((project: Project, idx: number) => {
              // High-end editorial layout with reduced card sizes (approx 30% smaller)
              const layoutClasses = [
                "lg:col-span-5 col-span-1",                                 
                "lg:col-span-4 lg:pt-24 col-span-1",                        
                "lg:col-span-4 col-span-1 lg:col-start-2",                                 
                "lg:col-span-5 lg:-mt-24 col-span-1",                       
                "lg:col-span-6 lg:col-start-4 lg:py-16 col-span-1",         
                "lg:col-span-4 col-span-1",                                 
                "lg:col-span-4 lg:pt-16 col-span-1",                        
              ];
              const gridClass = layoutClasses[idx % layoutClasses.length];

              return (
                <div key={project.id} className={`${gridClass}`}>
                  <ProjectCard project={project} index={idx} />
                </div>
              );
            })}
          </motion.div>

          <div className="mt-20 md:mt-40 pt-10 md:pt-20 border-t border-slate-100 flex flex-col items-center gap-6">
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Quer ver mais?</p>
             <button 
               onClick={() => scrollToSection("contact")}
               className="group flex flex-col md:flex-row items-center gap-4 text-slate-900 hover:text-brand transition-colors"
             >
                <span className="font-display text-3xl md:text-4xl font-bold tracking-tight">Iniciar um Projeto</span>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 md:group-hover:translate-x-2">
                   <IconComponent name="ArrowRight" className="w-4 h-4 md:w-5 md:h-5 group-hover:text-white" />
                </div>
             </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-40 px-6 bg-white overflow-hidden border-t border-slate-50">
        {/* Background Kanji Watermark */}
        <div className="absolute inset-0 z-0 opacity-[0.02] flex items-center justify-center pointer-events-none select-none">
          <span className="text-[30vw] font-jp font-bold">連絡</span>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-12 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-[8px] font-mono font-bold tracking-[0.4em] text-slate-400 uppercase">Status: Online // Connection_Established</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand block font-mono">/ connect_now [PORT_80]</span>
            <span className="font-jp text-[12px] text-slate-300">お問い合わせ</span>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row justify-center items-center gap-16">
            {contact?.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <MessageCircle size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">WhatsApp</span>
              </a>
            )}
            
            {contact?.instagram && (
              <a
                href={contact.instagram}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Instagram size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">Instagram</span>
              </a>
            )}

            {contact?.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Linkedin size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">LinkedIn</span>
              </a>
            )}

            {contact?.twitter && (
              <a
                href={contact.twitter}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Twitter size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">Twitter</span>
              </a>
            )}

            {contact?.facebook && (
              <a
                href={contact.facebook}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Facebook size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">Facebook</span>
              </a>
            )}

            {contact?.github && (
              <a
                href={contact.github}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Github size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">GitHub</span>
              </a>
            )}

            {contact?.gitlab && (
              <a
                href={contact.gitlab}
                target="_blank"
                rel="no-referrer"
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Gitlab size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">GitLab</span>
              </a>
            )}

            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="group flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-translate-y-2">
                  <Mail size={28} className="text-slate-900 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.4em] text-slate-300 group-hover:text-brand">E-mail</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-20 px-12 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-[.4em] text-slate-300">
        <div className="flex items-center gap-10">
          <p>© {new Date().getFullYear()} Willian Oliveira</p>
          <a href="/admin" className="hover:text-brand transition-colors">CMS Access</a>
        </div>
        <div className="flex gap-12 items-center">
            <div className="flex flex-col gap-1 items-end">
              <span className="font-jp text-[8px] opacity-40">デザインと整合性</span>
              <p className="cursor-default">Creative Solutions</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col gap-1">
              <span className="font-jp text-[8px] opacity-40 font-bold text-brand">東京</span>
              <p className="cursor-default">EST. 2024</p>
            </div>
        </div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-brand transition-colors cursor-pointer opacity-50 hover:opacity-100">
          Top
        </button>
      </footer>

      {/* Floating WhatsApp for mobile */}
      <div className="fixed bottom-10 right-10 md:hidden z-50">
        <a
          href={`https://wa.me/${contact?.whatsapp}`}
          target="_blank"
          rel="no-referrer"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-2xl shadow-brand/30 hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
}
