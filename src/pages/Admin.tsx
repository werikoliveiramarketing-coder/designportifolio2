import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { 
  LogIn, Plus, Trash2, Edit2, LogOut, Save, Box, Palette, 
  CheckCircle, AlertCircle, X, Search,
  Zap, Globe, Sparkles, Layout, Monitor, Camera, Smartphone, 
  PenTool, Code, Share2, Layers, Figma, Cloud, MessageSquare,
  Gift, Heart, Star, ShoppingBag, Coffee, Music, Video,
  Play, Pause, Award, Book, Briefcase, Calendar, MapPin, 
  Target, TrendingUp, Users, Smile, HardDrive, Smartphone as Phone,
  Search as SearchIcon, Mail, Info, 
  Activity, Airplay, Anchor, Aperture, Archive, AtSign, BarChart, 
  Battery, Bell, Bluetooth, Bold, Box as BoxIcon, Brush, Calculator, 
  Cast, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, 
  Chrome, Clipboard, Clock, CloudLightning, CloudRain, CloudSnow, 
  Command, Compass, Cpu, CreditCard, Crop, Crosshair, Database, 
  Disc, Download, Droplet, Edit, ExternalLink, Eye, Facebook, 
  FastForward, Feather, File, Film, Filter, Flag, Folder, 
  Framer, Frown, Gamepad, Ghost, Github, Gitlab, Hash, Headset, 
  Home, Image, Instagram, Key, Laptop, LifeBuoy, Link, Linkedin, 
  List, Loader, Lock, Map, Maximize, Mic, Minimize, Moon, 
  MousePointer, Move, Package, Paperclip, Percent, PhoneCall, PieChart, 
  Pocket, Power, Printer, Radio, RefreshCw, Repeat, Rewind, Rocket, 
  Rss, Scissors, Settings, Shield, ShieldOff, Shuffle, Sidebar, 
  Slack, Sliders, Sun, Sunset, Tablet, Tag, Terminal, Thermometer, 
  ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight, Trash, Trello, Tv, 
  Twitch, Twitter, Umbrella, Underline, Unlock, Upload, User, 
  Watch, Wifi, Wind, Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Project, ContactInfo, Service } from "../types";

const AVAILABLE_ICONS_RAW: Record<string, any> = {
  zap: Zap, globe: Globe, sparkles: Sparkles, layout: Layout, monitor: Monitor, camera: Camera, smartphone: Smartphone, 
  pentool: PenTool, code: Code, share2: Share2, layers: Layers, figma: Figma, cloud: Cloud, messagesquare: MessageSquare,
  gift: Gift, heart: Heart, star: Star, shoppingbag: ShoppingBag, coffee: Coffee, music: Music, video: Video,
  play: Play, pause: Pause, award: Award, book: Book, briefcase: Briefcase, calendar: Calendar, mappin: MapPin, 
  target: Target, trendingup: TrendingUp, users: Users, smile: Smile, harddrive: HardDrive, phone: Phone,
  search: SearchIcon, mail: Mail, info: Info, palette: Palette,
  activity: Activity, airplay: Airplay, anchor: Anchor, aperture: Aperture, archive: Archive, atsign: AtSign, barchart: BarChart, 
  battery: Battery, bell: Bell, bluetooth: Bluetooth, bold: Bold, box: BoxIcon, brush: Brush, calculator: Calculator, 
  cast: Cast, check: Check, chevrondown: ChevronDown, chevronleft: ChevronLeft, chevronright: ChevronRight, chevronup: ChevronUp, 
  chrome: Chrome, clipboard: Clipboard, clock: Clock, cloudlightning: CloudLightning, cloudrain: CloudRain, cloudsnow: CloudSnow, 
  command: Command, compass: Compass, cpu: Cpu, creditcard: CreditCard, crop: Crop, crosshair: Crosshair, database: Database, 
  disc: Disc, download: Download, droplet: Droplet, edit: Edit, externallink: ExternalLink, eye: Eye, facebook: Facebook, 
  fastforward: FastForward, feather: Feather, file: File, film: Film, filter: Filter, flag: Flag, folder: Folder, 
  framer: Framer, frown: Frown, gamepad: Gamepad, ghost: Ghost, github: Github, gitlab: Gitlab, hash: Hash, headset: Headset, 
  home: Home, image: Image, instagram: Instagram, key: Key, laptop: Laptop, lifebuoy: LifeBuoy, link: Link, linkedin: Linkedin, 
  list: List, loader: Loader, lock: Lock, map: Map, maximize: Maximize, mic: Mic, minimize: Minimize, moon: Moon, 
  mousepointer: MousePointer, move: Move, package: Package, paperclip: Paperclip, percent: Percent, phonecall: PhoneCall, piechart: PieChart, 
  pocket: Pocket, power: Power, printer: Printer, radio: Radio, refreshcw: RefreshCw, repeat: Repeat, rewind: Rewind, rocket: Rocket, 
  rss: Rss, scissors: Scissors, settings: Settings, shield: Shield, shieldoff: ShieldOff, shuffle: Shuffle, sidebar: Sidebar, 
  slack: Slack, sliders: Sliders, sun: Sun, sunset: Sunset, tablet: Tablet, tag: Tag, terminal: Terminal, thermometer: Thermometer, 
  thumbsdown: ThumbsDown, thumbsup: ThumbsUp, toggleleft: ToggleLeft, toggleright: ToggleRight, trash: Trash, trello: Trello, tv: Tv, 
  twitch: Twitch, twitter: Twitter, umbrella: Umbrella, underline: Underline, unlock: Unlock, upload: Upload, user: User, 
  watch: Watch, wifi: Wifi, wind: Wind, youtube: Youtube
};

export default function Admin() {
  const [pin, setPin] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState({ 
    brandColor: "#7b2cff", 
    brandColorLight: "#f5f0ff",
    yearsExperience: 5,
    identitiesCreated: 150,
    artsCreated: 500
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [contact, setContact] = useState<ContactInfo>({
    whatsapp: "",
    instagram: "",
    email: "",
    about: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    github: "",
    gitlab: "",
  });

  // Form States
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    images: [] as string[],
    category: "Identidade visual",
  });

  const [newService, setNewService] = useState({
    title: "",
    description: "",
    iconName: "Zap",
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  const filteredIcons = Object.keys(AVAILABLE_ICONS_RAW).filter(name => 
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("admin_pin");
    if (savedPin) {
      handleLogin(savedPin);
    }
  }, []);

  const handleLogin = async (inputPin: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: inputPin }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setPin(inputPin);
        localStorage.setItem("admin_pin", inputPin);
        fetchData();
        notify("Login realizado com sucesso!");
      } else {
        notify("PIN Inválido", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      const portfolioRes = await fetch("/api/portfolio");
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch portfolio:", portfolioRes.status);
      }

      const servicesRes = await fetch("/api/services");
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data);
      } else {
        console.error("Failed to fetch services:", servicesRes.status);
      }

      const contactRes = await fetch("/api/contact");
      if (contactRes.ok) {
        const data = await contactRes.json();
        setContact(data);
      } else {
        console.error("Failed to fetch contact:", contactRes.status);
      }

      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      } else {
        console.error("Failed to fetch settings:", settingsRes.status);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, pin }),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        
        // Dispatch custom event to notify App.tsx if it's listening 
        // (though in reality after save user might just see it applied if we trigger the property change here too)
        document.documentElement.style.setProperty('--brand', data.brandColor);
        document.documentElement.style.setProperty('--brand-light', data.brandColorLight);
        
        // Dispatch event for other potential components
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: data }));
        
        notify("Cores atualizadas com sucesso!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro: ${errData.error}`, "error");
        } else {
          notify(`Erro no servidor: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão.", "error");
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProject, pin }),
      });
      if (res.ok) {
        setNewProject({ title: "", description: "", images: [], category: "Identidade visual" });
        fetchData();
        notify("Projeto criado com sucesso!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro: ${errData.error || "Desconhecido"}`, "error");
        } else {
          notify(`Erro no servidor: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error("Error creating project:", err);
      notify("Erro de conexão ao criar projeto.", "error");
    }
  };

  const handleBulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("pin", pin);
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch("/api/upload-multiple", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setNewProject({ ...newProject, images: [...newProject.images, ...data.imageUrls] });
        notify(`${data.imageUrls.length} imagens carregadas!`);
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro no upload: ${errData.error || "Desconhecido"}`, "error");
        } else {
          notify(`Erro no upload: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão no upload.", "error");
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${title}"?`)) return;
    
    console.log(`Attempting to delete project ${id} with pin ${pin}`);
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-pin": pin 
        }
      });
      if (res.ok) {
        console.log("Delete successful");
        fetchData();
        notify("Projeto excluído com sucesso!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          console.error("Delete failed", errorData);
          notify(`Erro ao excluir: ${errorData.error}`, "error");
        } else {
          notify(`Erro ao excluir: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error("Delete request error", err);
      notify("Erro de conexão ao excluir.", "error");
    }
  };

  const handleCreateService = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newService, pin }),
      });
      if (res.ok) {
        setNewService({ title: "", description: "", iconName: "Zap" });
        fetchData();
        notify("Serviço adicionado com sucesso!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro: ${errData.error || "Desconhecido"}`, "error");
        } else {
          notify(`Erro no servidor: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão.", "error");
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!window.confirm(`Excluir o serviço "${title}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-pin": pin
        }
      });
      if (res.ok) {
        fetchData();
        notify("Serviço excluído!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro ao excluir: ${errData.error}`, "error");
        } else {
          notify(`Erro ao excluir: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão.", "error");
    }
  };

  const handleUpdateContact = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, pin }),
      });
      if (res.ok) {
        notify("Contatos atualizados!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro: ${errData.error}`, "error");
        } else {
          notify(`Erro no servidor: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão.", "error");
    }
  };

  const handleProfileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);
    formData.append("pin", pin);

    try {
      const res = await fetch("/api/upload-profile", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setContact({ ...contact, profileImageUrl: data.imageUrl });
        notify("Foto atualizada!");
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          notify(`Erro no upload: ${errData.error}`, "error");
        } else {
          notify(`Erro no upload: ${res.status}`, "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Erro de conexão.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_pin");
    setIsLoggedIn(false);
    setPin("");
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-[2rem] bg-black p-10 text-white shadow-2xl">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <LogIn className="text-white" size={32} />
            </div>
          </div>
          <h1 className="mb-2 text-center font-display text-3xl font-black italic">
            Admin Login
          </h1>
          <p className="mb-8 text-center text-sm text-white/50">
            Digite seu PIN para acessar o painel.
          </p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Digite o PIN (Padrão: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-center text-xl tracking-[0.5em] focus:border-white focus:outline-none"
            />
            <button
              onClick={() => handleLogin(pin)}
              className="w-full rounded-full bg-white py-4 font-bold text-black hover:scale-[1.02] transition-transform"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-10">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
          <p className="text-sm opacity-50">Gerencie seu portfólio e contatos.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-all"
        >
          Sair <LogOut size={18} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact & Settings Management */}
        <div className="lg:col-span-1 space-y-10">
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl italic">
              <Palette size={24} /> Identidade Visual
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Cor Principal</label>
                   <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={settings.brandColor}
                        onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border-none"
                      />
                      <input 
                        type="text" 
                        value={settings.brandColor}
                        onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                        className="flex-1 text-xs font-mono border-b border-black/10 py-1 focus:border-black outline-none"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Cor Suave (Light)</label>
                   <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={settings.brandColorLight}
                        onChange={(e) => setSettings({ ...settings, brandColorLight: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border-none"
                      />
                      <input 
                        type="text" 
                        value={settings.brandColorLight}
                        onChange={(e) => setSettings({ ...settings, brandColorLight: e.target.value })}
                        className="flex-1 text-xs font-mono border-b border-black/10 py-1 focus:border-black outline-none"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-brand">Estatísticas Profissionais</label>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Anos de Experiência</label>
                    <input 
                      type="number" 
                      value={settings.yearsExperience}
                      onChange={(e) => setSettings({ ...settings, yearsExperience: parseInt(e.target.value) || 0 })}
                      className="w-full border-b border-black/10 py-2 focus:border-black outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Identidades Criadas</label>
                    <input 
                      type="number" 
                      value={settings.identitiesCreated}
                      onChange={(e) => setSettings({ ...settings, identitiesCreated: parseInt(e.target.value) || 0 })}
                      className="w-full border-b border-black/10 py-2 focus:border-black outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1">Artes Criadas</label>
                    <input 
                      type="number" 
                      value={settings.artsCreated}
                      onChange={(e) => setSettings({ ...settings, artsCreated: parseInt(e.target.value) || 0 })}
                      className="w-full border-b border-black/10 py-2 focus:border-black outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Salvar Configurações <Save size={14} />
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl italic">
              <Edit2 size={24} /> Contatos
            </h2>
            
            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-4 text-brand">Foto de Perfil</label>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-2xl bg-brand-light overflow-hidden border border-brand/10">
                  <img 
                    src={contact.profileImageUrl || "https://images.unsplash.com/photo-1579389083395-4507e9f4a1cc?auto=format&fit=crop&q=80&w=200"} 
                    alt="Perfil" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <label className="flex-1">
                  <div className="cursor-pointer bg-brand/5 border-2 border-dashed border-brand/20 p-4 rounded-xl text-center hover:bg-brand/10 transition-colors">
                    <span className="text-xs font-bold text-brand">Clique para Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                  </div>
                </label>
              </div>
            </div>

            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  className="w-full border-b border-black/10 py-2 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Instagram URL</label>
                <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                  <Instagram size={14} className="opacity-40" />
                  <input
                    type="text"
                    value={contact.instagram}
                    onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                    className="flex-1 outline-none text-sm"
                    placeholder="https://instagram.com/seuusuario"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">LinkedIn URL</label>
                  <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                    <Linkedin size={14} className="opacity-40" />
                    <input
                      type="text"
                      value={contact.linkedin || ""}
                      onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                      className="flex-1 outline-none text-sm"
                      placeholder="https://linkedin.com/in/usuario"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Twitter URL</label>
                  <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                    <Twitter size={14} className="opacity-40" />
                    <input
                      type="text"
                      value={contact.twitter || ""}
                      onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
                      className="flex-1 outline-none text-sm"
                      placeholder="https://twitter.com/usuario"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Facebook URL</label>
                  <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                    <Facebook size={14} className="opacity-40" />
                    <input
                      type="text"
                      value={contact.facebook || ""}
                      onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
                      className="flex-1 outline-none text-sm"
                      placeholder="https://facebook.com/usuario"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">GitHub URL</label>
                  <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                    <Github size={14} className="opacity-40" />
                    <input
                      type="text"
                      value={contact.github || ""}
                      onChange={(e) => setContact({ ...contact, github: e.target.value })}
                      className="flex-1 outline-none text-sm"
                      placeholder="https://github.com/usuario"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">GitLab URL</label>
                <div className="flex items-center gap-3 border-b border-black/10 py-2 focus-within:border-black transition-colors">
                  <Gitlab size={14} className="opacity-40" />
                  <input
                    type="text"
                    value={contact.gitlab || ""}
                    onChange={(e) => setContact({ ...contact, gitlab: e.target.value })}
                    className="flex-1 outline-none text-sm"
                    placeholder="https://gitlab.com/usuario"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full border-b border-black/10 py-2 focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Sobre / Bio</label>
                <textarea
                  rows={4}
                  value={contact.about}
                  onChange={(e) => setContact({ ...contact, about: e.target.value })}
                  className="w-full border border-black/10 p-4 rounded-xl focus:border-black outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
              >
                Salvar Alterações <Save size={18} />
              </button>
            </form>
          </section>
        </div>

        {/* Portfolio Management */}
        <div className="lg:col-span-2 space-y-10">
          {/* Add Project Form */}
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 font-display text-2xl italic">
              <Plus size={24} /> Novo Projeto
            </h2>
            <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Título do Projeto</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full border-b border-black/10 py-2 focus:border-black outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Categoria</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full border-b border-black/10 py-2 focus:border-black outline-none bg-transparent"
                  >
                    <option>Identidade visual</option>
                    <option>arte para impressão</option>
                    <option>Banner para sites</option>
                    <option>Redes Sociais</option>
                    <option>Web Design</option>
                    <option>Motion</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Imagens do Projeto</label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                       {newProject.images.map((img, i) => (
                         <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-black/5 bg-slate-50">
                            <img src={img} alt="" className="h-full w-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setNewProject({...newProject, images: newProject.images.filter((_, idx) => idx !== i)})}
                              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                         </div>
                       ))}
                       <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <Plus size={20} className="opacity-20" />
                          <span className="text-[8px] font-bold uppercase mt-1 opacity-40 text-center">Multi<br/>Upload</span>
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
                       </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição</label>
                  <textarea
                    rows={6}
                    required
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full border border-black/10 p-4 rounded-xl focus:border-black outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-full font-bold hover:opacity-80 transition-opacity"
                >
                  Adicionar ao Portfólio
                </button>
              </div>
            </form>
          </section>

          {/* List Projects */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl italic px-2">Gerenciar Portfólio ({projects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm group">
                  <div className="flex -space-x-4 overflow-hidden">
                    {p.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded-xl border-2 border-white" />
                    ))}
                    {p.images.length > 3 && (
                      <div className="h-16 w-16 bg-slate-100 rounded-xl border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        +{p.images.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{p.title}</h4>
                    <p className="text-[10px] uppercase tracking-widest opacity-40">{p.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteProject(p.id, p.title);
                    }}
                    className="p-4 text-red-500 hover:bg-red-50 rounded-full transition-colors relative z-[50] pointer-events-auto"
                    aria-label="Deletar Projeto"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Service Management */}
          <section className="space-y-10">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 font-display text-xl italic">
                <Box size={24} /> Novo Serviço
              </h2>
              <form onSubmit={handleCreateService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Título do Serviço</label>
                    <input
                      type="text"
                      required
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full border-b border-black/10 py-2 focus:border-black outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Ícone do Serviço</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="flex items-center gap-3 w-full border-b border-black/10 py-3 focus:border-black outline-none text-left"
                      >
                        <div className="h-8 w-8 flex items-center justify-center bg-brand/5 rounded-lg text-brand">
                          {(() => {
                            const IconComponent = AVAILABLE_ICONS_RAW[newService.iconName.toLowerCase()] || Zap;
                            return <IconComponent size={20} />;
                          })()}
                        </div>
                        <span className="font-medium">{newService.iconName}</span>
                      </button>

                      <AnimatePresence>
                        {showIconPicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-black/5 rounded-2xl shadow-xl z-50 p-4"
                          >
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={14} />
                              <input 
                                type="text"
                                placeholder="Buscar ícone..."
                                value={iconSearch}
                                onChange={(e) => setIconSearch(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg pl-9 py-2 text-xs focus:ring-1 focus:ring-brand outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                              {filteredIcons.map(name => {
                                const IconComp = AVAILABLE_ICONS_RAW[name];
                                return (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                      setNewService({ ...newService, iconName: name });
                                      setShowIconPicker(false);
                                    }}
                                    className={`h-10 flex items-center justify-center rounded-lg transition-colors ${newService.iconName === name ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-black'}`}
                                    title={name}
                                  >
                                    <IconComp size={18} />
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição Curta</label>
                    <textarea
                      rows={3}
                      required
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full border border-black/10 p-4 rounded-xl focus:border-black outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-full font-bold hover:opacity-80 transition-opacity"
                  >
                    Adicionar Serviço
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-2xl italic px-2">Gerenciar Serviços ({services.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm group">
                    <div className="h-12 w-12 flex items-center justify-center bg-brand/5 rounded-xl text-brand">
                       {(() => {
                         const IconComponent = AVAILABLE_ICONS_RAW[s.iconName.toLowerCase()] || Zap;
                         return <IconComponent size={24} />;
                       })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{s.title}</h4>
                      <p className="text-xs opacity-40 line-clamp-1">{s.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteService(s.id, s.title);
                      }}
                      className="p-4 text-red-500 hover:bg-red-50 rounded-full transition-colors relative z-[50] pointer-events-auto"
                      aria-label="Deletar Serviço"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
              notification.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm tracking-tight">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
