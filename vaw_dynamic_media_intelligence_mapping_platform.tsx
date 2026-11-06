import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ShieldCheck, Filter, Globe, BarChart2, 
  DollarSign, Info, Calendar, MapPin, ExternalLink, ChevronRight, 
  Layers, Search, AlertTriangle, FileText, Activity, TrendingUp,
  Download, Building, Award, CheckCircle, Zap
} from 'lucide-react';

// Leaflet CDN dynamic loading handler
const loadLeafletAssets = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(true);
      return;
    }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(true);
    document.head.appendChild(script);
  });
};

// Mock National Media Dataset (Initial Seed Data with dates spanning across months)
const INITIAL_INCIDENTS = [
  {
    id: 'vaw-001',
    title: 'High Court Directs Action on Domestic Violence Case in Capital',
    date: '2024-01-12',
    category: 'Domestic Abuse',
    city: 'Islamabad',
    country: 'Pakistan',
    lat: 33.6844,
    lng: 73.0479,
    media: 'Dawn News',
    mediaUrl: 'https://dawn.com',
    verified: true,
    severity: 'High',
    summary: 'The provincial high court took notice of a reported severe domestic abuse incident, directing local law enforcement to ensure victim protection and speedy trial.'
  },
  {
    id: 'vaw-002',
    title: 'Police Arrest Suspect in Metro Cyber Harassment Probe',
    date: '2024-01-28',
    category: 'Cyber-Violence',
    city: 'Lahore',
    country: 'Pakistan',
    lat: 31.5204,
    lng: 74.3587,
    media: 'The Express Tribune',
    mediaUrl: 'https://tribune.com.pk',
    verified: true,
    severity: 'Medium',
    summary: 'Specialized cybercrime unit apprehended an individual accused of online blackmail and harassment against university students following digital forensic trace.'
  },
  {
    id: 'vaw-003',
    title: 'National Survey Triggers Special Parliamentary Committee on Workplace Safety',
    date: '2024-02-04',
    category: 'Harassment',
    city: 'Karachi',
    country: 'Pakistan',
    lat: 24.8607,
    lng: 67.0011,
    media: 'Geo News',
    mediaUrl: 'https://geo.tv',
    verified: true,
    severity: 'Medium',
    summary: 'Following investigative reports on workplace harassment in industrial zones, lawmakers have convened a joint commission to review legal protections.'
  },
  {
    id: 'vaw-004',
    title: 'Femicide Case in Suburban District Leads to Public Outcry',
    date: '2024-02-19',
    category: 'Femicide',
    city: 'Peshawar',
    country: 'Pakistan',
    lat: 34.0151,
    lng: 71.5249,
    media: 'Business Recorder',
    mediaUrl: 'https://brecorder.com',
    verified: true,
    severity: 'Critical',
    summary: 'National daily reports on tragic loss of life leading to widespread civil society calls for strict enforcement of anti-femicide legislation.'
  },
  {
    id: 'vaw-005',
    title: 'Taskforce Formed to Counter Physical Assaults in Public Transport',
    date: '2024-03-02',
    category: 'Physical Assault',
    city: 'Rawalpindi',
    country: 'Pakistan',
    lat: 33.5651,
    lng: 73.0169,
    media: 'The Nation',
    mediaUrl: 'https://nation.com.pk',
    verified: true,
    severity: 'High',
    summary: 'Transport authority mandates camera installation and emergency hotlines across public bus fleets following reported assault incidents.'
  },
  {
    id: 'vaw-006',
    title: 'Investigative Report Details Gender Violence Trends in Regional Hubs',
    date: '2024-03-15',
    category: 'Domestic Abuse',
    city: 'Faisalabad',
    country: 'Pakistan',
    lat: 31.4504,
    lng: 73.1350,
    media: 'Daily Times',
    mediaUrl: 'https://dailytimes.com.pk',
    verified: true,
    severity: 'High',
    summary: 'Comprehensive analysis published by national paper highlights legal aid gaps for survivors of intra-family violence.'
  },
  {
    id: 'vaw-007',
    title: 'Strict Bail Conditions Imposed in Workplace Intimidation Trial',
    date: '2024-04-01',
    category: 'Harassment',
    city: 'Quetta',
    country: 'Pakistan',
    lat: 30.1798,
    lng: 66.9750,
    media: 'Dawn News',
    mediaUrl: 'https://dawn.com',
    verified: true,
    severity: 'Medium',
    summary: 'Session court refuses unconditional bail for accused in corporate harassment case citing strong preliminary electronic evidence.'
  },
  {
    id: 'vaw-008',
    title: 'International Alert: Media Reports Increase in Gender Violence Incidents',
    date: '2024-04-18',
    category: 'Physical Assault',
    city: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lng: 77.2090,
    media: 'The Hindu',
    mediaUrl: 'https://thehindu.com',
    verified: true,
    severity: 'Critical',
    summary: 'National press analysis indicates a surge in emergency call center reports regarding physical safety violations in metropolitan belts.'
  },
  {
    id: 'vaw-009',
    title: 'Legislative Reform Bill Introduced Following Cyber Harassment Case',
    date: '2024-05-02',
    category: 'Cyber-Violence',
    city: 'Dhaka',
    country: 'Bangladesh',
    lat: 23.8103,
    lng: 90.4125,
    media: 'The Daily Star',
    mediaUrl: 'https://thedailystar.net',
    verified: true,
    severity: 'High',
    summary: 'Parliament opens discussion on tightening digital protection framework after major investigative series exposed online abuse rings.'
  },
  {
    id: 'vaw-010',
    title: 'Protest Marches Demanding Rapid Justice for Femicide Victims',
    date: '2024-05-20',
    category: 'Femicide',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    media: 'The Guardian',
    mediaUrl: 'https://theguardian.com',
    verified: true,
    severity: 'Critical',
    summary: 'Widespread coverage of national rallies urging structural police reforms and specialized court benches for domestic femicide trials.'
  },
  {
    id: 'vaw-011',
    title: 'Domestic Abuse Prevention Protocol Standardized Across Emergency Services',
    date: '2024-06-05',
    category: 'Domestic Abuse',
    city: 'Cairo',
    country: 'Egypt',
    lat: 30.0444,
    lng: 31.2357,
    media: 'Al Ahram',
    mediaUrl: 'https://ahram.org.eg',
    verified: true,
    severity: 'Medium',
    summary: 'National health ministry launches unified triage guidelines for hospital emergency units responding to suspected domestic violence cases.'
  },
  {
    id: 'vaw-012',
    title: 'Judicial Inquiry Ordered into Police Response Delays in Assault Case',
    date: '2024-06-22',
    category: 'Physical Assault',
    city: 'Multan',
    country: 'Pakistan',
    lat: 30.1575,
    lng: 71.5249,
    media: 'The Express Tribune',
    mediaUrl: 'https://tribune.com.pk',
    verified: true,
    severity: 'High',
    summary: 'High court magistrate orders departmental probe into delayed dispatch response times during a critical distress call.'
  }
];

export default function App() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'analytics', 'monetization'
  
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Time-Slider Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 5x
  const [currentDateIndex, setCurrentDateIndex] = useState(100); // 0 to 100 percentage of total timeline range

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Time boundaries
  const timeBounds = useMemo(() => {
    const dates = incidents.map(item => new Date(item.date).getTime()).sort((a, b) => a - b);
    return {
      min: dates[0] || new Date('2024-01-01').getTime(),
      max: dates[dates.length - 1] || new Date('2024-06-30').getTime()
    };
  }, [incidents]);

  // Current active date based on time slider percentage
  const activeCutoffDate = useMemo(() => {
    const totalDuration = timeBounds.max - timeBounds.min;
    const currentMillis = timeBounds.min + (totalDuration * (currentDateIndex / 100));
    return new Date(currentMillis);
  }, [currentDateIndex, timeBounds]);

  // Filtered incidents based on UI controls + Time Slider
  const visibleIncidents = useMemo(() => {
    return incidents.filter(item => {
      const itemDate = new Date(item.date);
      if (itemDate > activeCutoffDate) return false;

      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedCountry !== 'All' && item.country !== selectedCountry) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        const matchesMedia = item.media.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCity && !matchesMedia) return false;
      }
      return true;
    });
  }, [incidents, activeCutoffDate, selectedCategory, selectedCountry, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    loadLeafletAssets().then(() => {
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstance.current) return;

    // Dark Map Tile Layer (CartoDB Dark Matter)
    const map = window.L.map(mapRef.current, {
      center: [28.0, 72.0],
      zoom: 4,
      zoomControl: false
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    window.L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstance.current = map;
  }, [leafletReady]);

  // Update Map Markers dynamically whenever visibleIncidents changes
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    // Clear old markers
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    visibleIncidents.forEach(item => {
      // Create glowing pulsating red marker
      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-2 rounded-full bg-red-600/40 animate-ping"></div>
          <div class="relative w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-[0_0_12px_rgba(239,68,68,0.9)] flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: markerHtml,
        className: 'custom-vaw-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(mapInstance.current)
        .on('click', () => {
          setSelectedIncident(item);
          mapInstance.current.flyTo([item.lat, item.lng], 7, { duration: 1.2 });
        });

      markersRef.current.push(marker);
    });
  }, [visibleIncidents]);

  // Time Slider Animation Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDateIndex(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + (0.5 * speedMultiplier));
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Formatting helpers
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Femicide': return 'bg-red-950 border-red-600 text-red-400';
      case 'Physical Assault': return 'bg-orange-950 border-orange-600 text-orange-400';
      case 'Domestic Abuse': return 'bg-rose-950 border-rose-600 text-rose-400';
      case 'Harassment': return 'bg-amber-950 border-amber-600 text-amber-400';
      case 'Cyber-Violence': return 'bg-purple-950 border-purple-600 text-purple-400';
      default: return 'bg-gray-800 border-gray-600 text-gray-300';
    }
  };

  // Stats calculation
  const totalReportsCount = incidents.length;
  const visibleReportsCount = visibleIncidents.length;
  const uniqueCitiesCount = new Set(visibleIncidents.map(i => i.city)).size;
  const uniqueCountriesCount = new Set(visibleIncidents.map(i => i.country)).size;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* TOP NAVBAR */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
            <Globe className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-wider text-white">VAW.MEDIA</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-700/50 text-red-400 tracking-widest font-semibold">
                National Media Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">Global Violence Against Women Monitoring & Dynamic Spatial Analytics</p>
          </div>
        </div>

        {/* View Switching Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'map' ? 'bg-slate-800 text-red-400 shadow-sm border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'analytics' ? 'bg-slate-800 text-red-400 shadow-sm border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics & Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'monetization' ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commercialization & Strategy</span>
          </button>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">100% National Media Verified</span>
          </div>
          <button className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* VIEW 1: INTERACTIVE MAP & DASHBOARD */}
        {activeTab === 'map' && (
          <div className="flex-1 flex relative w-full h-full">
            
            {/* LEFT FILTER & STATS CONTROL PANEL */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col z-20 shrink-0">
              
              {/* Header Stats Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/40 grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Incidents</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{visibleReportsCount}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Of {totalReportsCount} indexed total</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Coverage</span>
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{uniqueCitiesCount}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cities in {uniqueCountriesCount} countries</div>
                </div>
              </div>

              {/* Search & Filter Form */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Search Media Feed</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search title, city, publisher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-red-600 transition-colors placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Incident Category Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Incident Category</label>
                  <div className="space-y-1">
                    {['All', 'Femicide', 'Physical Assault', 'Domestic Abuse', 'Harassment', 'Cyber-Violence'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                          selectedCategory === cat 
                            ? 'bg-red-950/80 border border-red-700/60 text-red-300 font-medium' 
                            : 'hover:bg-slate-800/60 text-slate-400'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Geography / Country</label>
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors"
                  >
                    <option value="All">All Countries (Global Feed)</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Egypt">Egypt</option>
                  </select>
                </div>

                {/* Live News Stream List */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">National Feed ({visibleIncidents.length})</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {visibleIncidents.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setSelectedIncident(item);
                          if (mapInstance.current) {
                            mapInstance.current.flyTo([item.lat, item.lng], 7, { duration: 1.2 });
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedIncident?.id === item.id 
                            ? 'bg-slate-800 border-red-500 text-white shadow-md' 
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-mono text-red-400 font-semibold">{item.media}</span>
                          <span>{item.date}</span>
                        </div>
                        <h4 className="font-medium text-slate-200 line-clamp-2 leading-tight mb-1.5">{item.title}</h4>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.city}, {item.country}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* MAP CONTAINER & OVERLAYS */}
            <div className="flex-1 relative h-full bg-slate-950">
              
              {/* Leaflet Div */}
              <div ref={mapRef} className="w-full h-full z-10" />

              {/* Map Canvas Visual Indicator */}
              <div className="absolute top-4 left-4 z-20 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-medium">Map Pulse Density Active</span>
                </div>
                <div className="h-3 w-px bg-slate-800"></div>
                <span className="text-xs text-slate-400">Date Threshold: <span className="text-white font-mono font-semibold">{formatDate(activeCutoffDate)}</span></span>
              </div>

              {/* INCIDENT DETAILS DRAWER / MODAL */}
              {selectedIncident && (
                <div className="absolute top-4 right-4 z-20 w-96 bg-slate-900/95 border border-slate-800 backdrop-blur-lg rounded-2xl p-5 shadow-2xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${getCategoryColor(selectedIncident.category)}`}>
                      {selectedIncident.category}
                    </span>
                    <button 
                      onClick={() => setSelectedIncident(null)}
                      className="text-slate-400 hover:text-white text-lg font-bold p-1 leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-2 leading-snug">{selectedIncident.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {selectedIncident.summary}
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Location:</span>
                      <span className="text-slate-200 font-medium">{selectedIncident.city}, {selectedIncident.country}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Date Reported:</span>
                      <span className="text-slate-200 font-medium">{selectedIncident.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Source Outlet:</span>
                      <span className="text-emerald-400 font-semibold font-mono">{selectedIncident.media}</span>
                    </div>
                  </div>

                  <a 
                    href={selectedIncident.mediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Read Full National Report</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              )}

              {/* BOTTOM CHRONOLOGICAL TIME-SLIDER CONTROLS BAR */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-4xl bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col gap-2">
                
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Chronological Map Progression Engine</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span>Start: <span className="text-slate-300">{formatDate(new Date(timeBounds.min))}</span></span>
                    <span className="text-red-400 font-bold">Current: {formatDate(activeCutoffDate)}</span>
                    <span>End: <span className="text-slate-300">{formatDate(new Date(timeBounds.max))}</span></span>
                  </div>
                </div>

                {/* Slider Input */}
                <div className="relative flex items-center">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={currentDateIndex}
                    onChange={(e) => setCurrentDateIndex(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                  />
                </div>

                {/* Playback Control Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                        isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentDateIndex(0);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                      title="Reset Timeline"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      {isPlaying ? 'Playing Accumulation...' : 'Paused'}
                    </span>
                  </div>

                  {/* Speed Controls */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 px-2 font-mono">SPEED</span>
                    {[1, 2, 5].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setSpeedMultiplier(spd)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          speedMultiplier === spd ? 'bg-slate-800 text-red-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: ANALYTICS & INTELLIGENCE TAB */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-8 bg-slate-950 overflow-y-auto space-y-6">
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-red-500" />
                  National Media Coverage & Spatial Intelligence
                </h2>
                <p className="text-sm text-slate-400 mt-1">Aggregated statistics extracted automatically from verified mainstream news feeds.</p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Verified Events</div>
                  <div className="text-3xl font-bold text-white font-mono">{incidents.length}</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" /> +14% vs previous month
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Top Incident Category</div>
                  <div className="text-2xl font-bold text-red-400">Domestic Abuse</div>
                  <div className="text-xs text-slate-500 mt-2">Accounts for 35% of reports</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Primary Media Outlet</div>
                  <div className="text-2xl font-bold text-blue-400">Dawn News</div>
                  <div className="text-xs text-slate-500 mt-2">28% of verified index items</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Verification Score</div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">100%</div>
                  <div className="text-xs text-slate-500 mt-2">Strict whitelist media source rule</div>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Category Breakdown */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-400" /> Incident Distribution by Category
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Domestic Abuse', count: 4, pct: 33, color: 'bg-rose-500' },
                      { label: 'Physical Assault', count: 3, pct: 25, color: 'bg-orange-500' },
                      { label: 'Harassment', count: 2, pct: 17, color: 'bg-amber-500' },
                      { label: 'Femicide', count: 2, pct: 17, color: 'bg-red-600' },
                      { label: 'Cyber-Violence', count: 2, pct: 17, color: 'bg-purple-500' }
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{item.label}</span>
                          <span className="font-mono text-slate-400">{item.count} reports ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country Breakdown */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Geographic Breakdown
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Pakistan', count: 7, pct: 58, color: 'bg-emerald-500' },
                      { label: 'India', count: 1, pct: 8, color: 'bg-blue-500' },
                      { label: 'Bangladesh', count: 1, pct: 8, color: 'bg-cyan-500' },
                      { label: 'United Kingdom', count: 1, pct: 8, color: 'bg-indigo-500' },
                      { label: 'Egypt', count: 1, pct: 8, color: 'bg-amber-500' }
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{item.label}</span>
                          <span className="font-mono text-slate-400">{item.count} incidents</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: MONETIZATION & COMMERCIAL VIABILITY STRATEGY TAB */}
        {activeTab === 'monetization' && (
          <div className="flex-1 p-8 bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <div className="border-b border-slate-800 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-semibold mb-3">
                  <Zap className="w-3.5 h-3.5" /> Sustainable Revenue & Business Blueprint
                </div>
                <h2 className="text-2xl font-bold text-white">Commercialization Strategy for VAW.MEDIA</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
                  Transforming media data into structured spatial risk intelligence allows this application to operate as a high-impact social venture with sustainable monetization models across enterprise, institutional, and research sectors.
                </p>
              </div>

              {/* 4 Pillars of Revenue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Revenue Model 1 */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700/50 flex items-center justify-center text-blue-400 mb-4">
                      <Building className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">1. Enterprise ESG & CSR Risk Compliance</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Multinational corporations operating in developing markets require real-time social safety & workplace security data for ESG compliance, duty of care reporting, and supply chain audit certifications.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Workplace Safety & Regional Heatmaps for HR Ops</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Custom Annual Corporate ESG Safety Audits</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono">TARGET ARR</span>
                    <span className="text-emerald-400 font-bold font-mono">$15,000 - $50,000 / enterprise</span>
                  </div>
                </div>

                {/* Revenue Model 2 */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-4">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">2. UN & Institutional Data Licensing</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      International bodies (UN Women, UNDP, World Bank), policy think tanks, and global human rights organizations require verified spatial media data to benchmark legislative efficacy and deploy field resources.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Clean Structured JSON/PostGIS Data Feeds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Custom Legislative Policy Briefing Downloads</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono">MODEL</span>
                    <span className="text-emerald-400 font-bold font-mono">Annual Data API Subscriptions</span>
                  </div>
                </div>

                {/* Revenue Model 3 */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400 mb-4">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">3. Premium Media & Investigative API</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Journalism networks and media agencies can license the standardized database to integrate live map widgets and cross-regional violence statistics into their own investigative storytelling.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Embeddable Interactive Map Widgets</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Real-Time Breaking Media Alert Notifications</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono">MODEL</span>
                    <span className="text-emerald-400 font-bold font-mono">Tiered Developer API Keys</span>
                  </div>
                </div>

                {/* Revenue Model 4 */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700/50 flex items-center justify-center text-red-400 mb-4">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">4. Sponsored Donor & NGO Dashboards</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      High-impact philanthropic foundations can sponsor country-specific chapters (e.g., "VAW Pakistan Map brought to you by Global Rights Fund") ensuring free public transparency while fully funding core operations.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Country Platform Sponsorship Branding</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Direct Grant & Philanthropic Backing</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono">MODEL</span>
                    <span className="text-emerald-400 font-bold font-mono">Institutional Grants / Sponsorship</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}