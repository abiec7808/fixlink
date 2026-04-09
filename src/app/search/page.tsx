'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  SearchIcon
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/context/AuthContext';
import { TRADES } from '@/lib/constants';

// Dynamically import Leaflet with no SSR and proper typing
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Mock data for search results
const MOCK_PROS = [
  {
    id: '1',
    name: 'Johannes "Joe" Smit',
    trade: 'Plumbers',
    rating: 4.9,
    reviews: 124,
    priceRange: 'R450 - R850 / hr',
    description: 'Master plumber with 15 years experience in residential and commercial repairs. Certified Geyser installer.',
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop',
    featured: true,
    location: [-33.9189, 18.4231] as any,
    verified: true
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    trade: 'Electricians (Domestic & Industrial)',
    rating: 4.8,
    reviews: 89,
    priceRange: 'R500 - R900 / hr',
    description: 'Expert in smart home installations and electrical fault finding. Wireman\'s license holder.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    featured: false,
    location: [-33.9249, 18.4141] as any,
    verified: true
  },
  {
    id: '3',
    name: 'Cape Maintenance Pro',
    trade: 'Handymen (General Maintenance)',
    rating: 5.0,
    reviews: 45,
    priceRange: 'R350 - R600 / hr',
    description: 'One stop shop for all your home repair needs. Painting, tiling, and general repairs.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    featured: true,
    location: [-33.9309, 18.4341] as any,
    verified: true
  },
  {
    id: '4',
    name: 'David Ngcobo',
    trade: 'Appliance Repair Technicians',
    rating: 4.7,
    reviews: 67,
    priceRange: 'R400 - R750 / hr',
    description: 'Fast and reliable repair for all major appliance brands. Same day service available.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    featured: false,
    location: [-33.9049, 18.4041] as any,
    verified: true
  }
];

function SearchResultsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || 'General Services';
  const locationParam = searchParams.get('loc') || 'Central Cape Town';
  
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [selectedTrade, setSelectedTrade] = useState<string>(queryParam);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const { getUsersByRole } = await import('@/lib/db');
        const allPros = await getUsersByRole('tradesman');
        
        // Map to search format
        const mappedPros = allPros.map(p => ({
          id: p.id,
          name: p.fullName,
          trade: p.trade || 'Generalist',
          rating: 4.8 + (Math.random() * 0.2), // Random initial rating
          reviews: Math.floor(Math.random() * 150),
          priceRange: 'R450 - R850 / hr',
          description: p.businessName || 'Professional trade specialist registered on Fix Link.',
          image: p.imageUrl || `https://i.pravatar.cc/150?u=${p.id}`,
          featured: p.tier === 'legend',
          location: [-33.9249 + (Math.random() * 0.05 - 0.025), 18.4241 + (Math.random() * 0.05 - 0.025)] as any,
          verified: true,
          tier: p.tier
        }));

        setPros(mappedPros);
      } catch (error) {
        console.error('Search fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, []);

  const filteredPros = pros.filter(pro => 
    selectedTrade === 'General Services' || 
    pro.trade.toLowerCase().includes(selectedTrade.toLowerCase()) ||
    selectedTrade.toLowerCase().includes(pro.trade.toLowerCase())
  );

  const handleContact = (pro: any) => {
    if (!user) {
      router.push(`/login?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    // Logic for contacting if logged in
    alert(`Contacting ${pro.name}... Opening secure chat.`);
  };

  // Cape Town Center
  const centerPosition: any = [-33.9249, 18.4241];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-3">
            <span className="w-8 h-[2px] bg-primary"></span>
            Search Results
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4 uppercase italic">
            Found {filteredPros.length} <span className="text-primary">Professionals</span>
          </h1>
          
          <div className="relative inline-block w-full max-w-sm">
            <button 
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center justify-between w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-primary" />
                <span className="truncate">{selectedTrade}</span>
              </div>
              <motion.div animate={{ rotate: isCategoryOpen ? 180 : 0 }}>
                <Navigation className="w-4 h-4 text-slate-400 rotate-90" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 left-0 right-0 mt-2 p-4 bg-white rounded-3xl border border-slate-100 shadow-2xl max-h-96 overflow-y-auto"
                >
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      onClick={() => {
                        setSelectedTrade('General Services');
                        setIsCategoryOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all"
                    >
                      All Services
                    </button>
                    {TRADES.map((trade) => (
                      <button
                        key={trade}
                        onClick={() => {
                          setSelectedTrade(trade);
                          setIsCategoryOpen(false);
                        }}
                        className={`px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-widest transition-all ${selectedTrade === trade ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600 hover:text-primary'}`}
                      >
                        {trade}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-3xl self-start">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white shadow-xl text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ListView
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'map' ? 'bg-white shadow-xl text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
           MapView
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Results Sidebar / Content */}
        <div className={`lg:col-span-8 space-y-6 ${activeTab === 'map' ? 'hidden lg:block' : ''}`}>
          {filteredPros.map((pro, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={pro.id}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
            >
              {pro.featured && (
                <div className="absolute top-0 right-0 px-8 py-2 bg-accent text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-3xl shadow-lg">
                  Top Rated
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-48 h-48 rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-inner">
                  <img src={pro.image} alt={pro.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-[10px] font-black">{pro.rating}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{pro.name}</h3>
                        {pro.verified && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-primary font-black uppercase tracking-widest text-[10px] italic">{pro.trade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{pro.priceRange.split(' ')[0]} <span className="text-xs text-slate-400">/ hr</span></p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                    {pro.description}
                  </p>

                  <div className="flex flex-wrap gap-3 py-2">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       <MapPin className="w-3 h-3 text-primary" /> 2.4 km away
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       <ShieldCheck className="w-3 h-3 text-primary" /> Verified Pro
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => handleContact(pro)}
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Hire Specialist
                    </button>
                    <button 
                      onClick={() => handleContact(pro)}
                      className="w-14 h-14 border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                    >
                      <MessageSquare className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredPros.length === 0 && (
             <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
                   <SearchIcon className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-4 lowercase">No pros found nearby.</h2>
                <p className="text-muted-foreground max-w-md font-medium mb-12">
                   Try expanding your search or selecting a different category. We're growing fast!
                </p>
                <Link href="/" className="px-10 py-5 bg-primary text-white rounded-3xl font-black shadow-xl shadow-primary/20">
                   Go Back Home
                </Link>
             </div>
          )}
        </div>

        {/* Map Mockup Area */}
        <div className={`lg:col-span-4 sticky top-32 h-[calc(100vh-160px)] ${activeTab === 'list' ? 'hidden lg:block' : 'col-span-1 block'}`}>
          <div className="w-full h-full bg-slate-100 rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl relative">
            {/* Map Container */}
            <div className="absolute inset-0 z-0 bg-[#e5e7eb]">
               <MapContainer 
                 center={centerPosition} 
                 zoom={13} 
                 style={{ height: '100%', width: '100%' }}
                 {...({ scrollWheelZoom: false } as any)}
               >
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                   {...({} as any)}
                 />
                 {filteredPros.map(pro => (
                   <Marker key={pro.id} position={pro.location}>
                     <Popup>
                       <div className="p-1">
                         <p className="font-black text-slate-900">{pro.name}</p>
                         <p className="text-[10px] text-primary uppercase font-bold">{pro.trade}</p>
                       </div>
                     </Popup>
                   </Marker>
                 ))}
               </MapContainer>
            </div>

            {/* Overlays */}
            <div className="absolute top-6 left-6 right-6 z-10">
              <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl shadow-black/10 border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">Scan Complete</p>
                    <p className="text-sm font-black text-slate-900">Cape Town Cluster Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10">
               <div className="bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">System Status</p>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Search</span>
                     </div>
                  </div>
                  <p className="text-white font-bold text-sm mb-6 leading-relaxed">
                    Analyzing <span className="text-primary italic">70km radius</span> around Cape Town Central...
                  </p>
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all">
                    Update Search Area
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Search className="w-10 h-10 text-primary opacity-20" />
        </motion.div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
