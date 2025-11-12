'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plane, Cloud, Gauge, MapPin, MessageSquare, Home, ExternalLink } from 'lucide-react';

// Import all components
import GradientButton from '@/components/kokonutui/gradient-button';
import AttractButton from '@/components/kokonutui/attract-button';
import ColorfulButton from '@/components/kokonutui/colorful-button';
import SlideTextButton from '@/components/kokonutui/slide-text-button';
import HoldToActionButton from '@/components/kokonutui/hold-to-action-button';
import ProcessingButton from '@/components/kokonutui/processing-button';
import ShadowButton from '@/components/kokonutui/shadow-button';
import CopyButton from '@/components/kokonutui/copy-button';
import WelcomeButton from '@/components/kokonutui/welcome-button';
import FancyButton from '@/components/kokonutui/fancy-button';
import ShareButton from '@/components/kokonutui/share-button';
import SwitchButton from '@/components/kokonutui/switch-button';
import RippleEffect from '@/components/kokonutui/ripple-effect';

import ActivityRing from '@/components/kokonutui/activity-ring';
import BentoGrid from '@/components/kokonutui/bento-grid';
import MetricCard from '@/components/kokonutui/metric-card';
import StatsCard from '@/components/kokonutui/stats-card';
import InfiniteMarquee from '@/components/kokonutui/infinite-marquee';
import NotificationToast from '@/components/kokonutui/notification-toast';
import SparklineChart from '@/components/kokonutui/sparkline-chart';

import StatusBadge from '@/components/kokonutui/status-badge';
import SearchBar from '@/components/kokonutui/search-bar';
import TagInput from '@/components/kokonutui/tag-input';
import SkeletonLoader from '@/components/kokonutui/skeleton-loader';
import DataTable from '@/components/kokonutui/data-table';

import CardFlip from '@/components/kokonutui/card-flip';
import CardStack from '@/components/kokonutui/card-stack';
import ExpandableCard from '@/components/kokonutui/expandable-card';
import SmoothDrawer from '@/components/kokonutui/smooth-drawer';
import Timeline from '@/components/kokonutui/timeline';
import ProgressCircle from '@/components/kokonutui/progress-circle';
import SmoothTab from '@/components/kokonutui/smooth-tab';

import LiquidGlassCard from '@/components/kokonutui/liquid-glass-card';
import MouseEffectCard from '@/components/kokonutui/mouse-effect-card';
import BackgroundPaths from '@/components/kokonutui/background-paths';
import ParallaxCard from '@/components/kokonutui/parallax-card';

import AIInput from '@/components/kokonutui/ai-input';
import TweetCard from '@/components/kokonutui/tweet-card';
import BeamsBackground from '@/components/kokonutui/beams-background';

import ProfileDropdown from '@/components/kokonutui/profile-dropdown';
import TeamSelector from '@/components/kokonutui/team-selector';
import FloatingDock from '@/components/kokonutui/floating-dock';
import Toolbar from '@/components/kokonutui/toolbar';
import GradientUnderline from '@/components/kokonutui/gradient-underline';

import Loader from '@/components/kokonutui/loader';
import LoadingProgress from '@/components/kokonutui/loading-progress';
import ShapeHero from '@/components/kokonutui/shape-hero';
import ParticleAnimation from '@/components/kokonutui/particle-animation';
import SpotlightEffect from '@/components/kokonutui/spotlight-effect';
import FileUpload from '@/components/kokonutui/file-upload';

interface PageLink {
 label: string;
 href: string;
}

interface ComponentShowcaseProps {
 title: string;
 usedOn: string[];
 bestFor: string;
 pageLinks: PageLink[];
 children: React.ReactNode;
}

function ComponentShowcase({ title, usedOn, bestFor, pageLinks, children }: ComponentShowcaseProps) {
 return (
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
 <div className="mb-4">
 <h3 className="text-lg font-semibold text-text-primary dark:text-slate-50 mb-2">{title}</h3>
 <div className="flex flex-wrap gap-2 mb-2">
 {usedOn.map((page, i) => (
 <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-medium">
 {page}
 </span>
 ))}
 </div>
 <p className="text-sm text-text-secondary dark:text-slate-400 mb-3">💡 Best for: {bestFor}</p>
 <div className="flex flex-wrap gap-2">
 {pageLinks.map((link, i) => (
 <Link
 key={i}
 href={link.href}
 className="text-xs text-blue hover:underline flex items-center gap-1"
 >
 <span>{link.label}</span>
 <ExternalLink size={12} />
 </Link>
 ))}
 </div>
 </div>
 <div className="border-t border-border dark:border-slate-700 pt-4">
 {children}
 </div>
 </div>
 );
}

export default function KokonutTestPage() {
 const router = useRouter();
 const [activeSection, setActiveSection] = useState<string>('dashboard');
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 const [switchValue, setSwitchValue] = useState(false);
 const [tags, setTags] = useState<string[]>(['JFK', 'LAX']);
 const [toastVisible, setToastVisible] = useState(false);

 const sections = [
 { id: 'dashboard', label: 'Dashboard', icon: Gauge },
 { id: 'flights-list', label: 'Flights List', icon: Plane },
 { id: 'flight-detail', label: 'Flight Details', icon: Plane },
 { id: 'weather', label: 'Weather', icon: Cloud },
 { id: 'airports', label: 'Airports', icon: MapPin },
 { id: 'chat', label: 'Chat', icon: MessageSquare },
 { id: 'sidebar', label: 'Sidebar', icon: Home },
 { id: 'global', label: 'Global UI', icon: Home },
 ];

 const mockAlerts = [
 { id: 1, text: '⚠️ Weather alert: Heavy turbulence expected FL350-FL380' },
 { id: 2, text: '✈️ Flight FL123 departed 5 minutes early' },
 { id: 3, text: '📊 On-time performance: 94% this month' },
 ];

 return (
 <div className="flex-1 overflow-auto bg-gradient-to-br from-surface via-white to-surface">
 {/* Header */}
 <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-border dark:border-slate-700">
 <div className="max-w-7xl mx-auto px-8 py-6">
 <button
 onClick={() => router.push('/')}
 className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400 hover:text-text-primary dark:text-slate-50 transition-colors mb-4"
 >
 <ArrowLeft size={16} />
 <span>Back to Dashboard</span>
 </button>
 
 <div className="mb-4">
 <h1 className="text-2xl font-bold text-text-primary dark:text-slate-50 mb-2">
 Kokonutui Component Showcase
 </h1>
 <p className="text-sm text-text-secondary dark:text-slate-400">
 50+ Components organized by FlightOps page usage • Aviation-themed examples • Direct integration links
 </p>
 </div>

 {/* Section Navigation */}
 <div className="flex gap-2 overflow-x-auto pb-2">
 {sections.map((section) => {
 const Icon = section.icon;
 return (
 <button
 key={section.id}
 onClick={() => setActiveSection(section.id)}
 className={`
 px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap
 ${activeSection === section.id
 ? 'bg-blue text-white shadow-md'
 : 'bg-surface dark:bg-slate-800 text-text-secondary dark:text-slate-400 hover:bg-gray-100'
 }
 `}
 >
 <Icon size={16} />
 {section.label}
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="max-w-7xl mx-auto px-8 py-8">
 
 {/* DASHBOARD COMPONENTS */}
 {activeSection === 'dashboard' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Dashboard Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for the main dashboard page showing KPIs, alerts, and overviews</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ComponentShowcase
 title="Activity Rings"
 usedOn={["Dashboard"]}
 bestFor="Progress tracking, KPI visualization, completion metrics"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="flex justify-center gap-8 p-4">
 <ActivityRing progress={67} color="#2563eb" label="Flight Progress" />
 <ActivityRing progress={85} color="#10b981" label="On-Time Rate" size={120} />
 <ActivityRing progress={42} color="#f59e0b" label="Fuel Efficiency" size={120} />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Bento Grid"
 usedOn={["Dashboard"]}
 bestFor="Feature cards, quick stats, modular layout"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <BentoGrid
 items={[
 {
 id: '1',
 title: 'Active Flights',
 value: '23',
 icon: Plane,
 color: '#2563eb',
 span: 'col-span-1',
 },
 {
 id: '2',
 title: 'Weather Alerts',
 value: '3',
 icon: Cloud,
 color: '#f59e0b',
 span: 'col-span-1',
 },
 ]}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Metric Cards"
 usedOn={["Dashboard","Flight Details"]}
 bestFor="Large KPI numbers with trend indicators"
 pageLinks={[
 { label:"View Dashboard", href:"/" },
 { label:"View Flight Details", href:"/flights/FL001" }
 ]}
 >
 <div className="grid grid-cols-2 gap-4">
 <MetricCard label="Altitude" value="32,000" unit="ft" trend={5} />
 <MetricCard label="Speed" value="485" unit="kt" trend={0} />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Stats Card (Animated Counter)"
 usedOn={["Dashboard"]}
 bestFor="Animated number counters for live metrics"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="grid grid-cols-2 gap-4">
 <StatsCard value={156} label="Total Flights" icon={Plane} color="#2563eb" />
 <StatsCard value={94} label="On-Time %" icon={Gauge} color="#10b981" suffix="%" />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Infinite Marquee"
 usedOn={["Dashboard"]}
 bestFor="Breaking alerts, updates ticker, scrolling messages"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="bg-amber-50 border border-amber-200 p-4">
 <InfiniteMarquee
 items={mockAlerts.map(alert => (
 <span key={alert.id} className="text-sm text-amber-800 font-medium">
 {alert.text}
 </span>
 ))}
 speed={30}
 />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Notification Toast"
 usedOn={["All Pages"]}
 bestFor="System notifications, success/error messages"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div>
 <GradientButton onClick={() => setToastVisible(true)}>
 Show Notification
 </GradientButton>
 <NotificationToast
 type="success"
 title="Flight Departed"
 message="FL123 departed JFK at 08:05 EST"
 isVisible={toastVisible}
 onClose={() => setToastVisible(false)}
 />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Sparkline Chart"
 usedOn={["Dashboard","Flight Details"]}
 bestFor="Inline metric trends, compact visualizations"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-sm text-text-secondary dark:text-slate-400">On-Time Performance</span>
 <SparklineChart data={[85, 88, 92, 87, 95, 94, 96]} width={100} height={30} color="#10b981" />
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-text-secondary dark:text-slate-400">Daily Flights</span>
 <SparklineChart data={[120, 135, 128, 145, 156, 142, 150]} width={100} height={30} color="#2563eb" />
 </div>
 </div>
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* FLIGHTS LIST COMPONENTS */}
 {activeSection === 'flights-list' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Flights List Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for the flights list/table page with search and filters</p>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <ComponentShowcase
 title="Data Table (Sortable)"
 usedOn={["Flights Page"]}
 bestFor="Advanced sortable/filterable flight tables"
 pageLinks={[{ label:"View Flights", href:"/flights" }]}
 >
 <DataTable
 columns={[
 { key: 'flight', label: 'Flight #', sortable: true },
 { key: 'route', label: 'Route', sortable: false },
 { key: 'status', label: 'Status', sortable: true },
 ]}
 data={[
 { flight: 'FL123', route: 'JFK → LAX', status: 'En Route' },
 { flight: 'FL456', route: 'BOS → SFO', status: 'Scheduled' },
 { flight: 'FL789', route: 'MIA → SEA', status: 'Delayed' },
 ]}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Search Bar (with Suggestions)"
 usedOn={["Flights Page","Airports Page"]}
 bestFor="Animated search with autocomplete"
 pageLinks={[
 { label:"View Flights", href:"/flights" },
 { label:"View Airports", href:"/airports" }
 ]}
 >
 <SearchBar
 placeholder="Search flights, routes..."
 suggestions={['FL123 - JFK to LAX', 'FL456 - BOS to SFO', 'JFK Airport']}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Tag Input (Multi-Select)"
 usedOn={["Flights Page"]}
 bestFor="Multi-select filters (routes, aircraft types, airports)"
 pageLinks={[{ label:"View Flights", href:"/flights" }]}
 >
 <TagInput
 tags={tags}
 onChange={setTags}
 placeholder="Add airport codes..."
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Status Badge"
 usedOn={["Flights Page","Dashboard","Flight Details"]}
 bestFor="Flight status indicators, colored pills"
 pageLinks={[
 { label:"View Flights", href:"/flights" },
 { label:"View Dashboard", href:"/" }
 ]}
 >
 <div className="flex flex-wrap gap-3">
 <StatusBadge status="SCHEDULED">Scheduled</StatusBadge>
 <StatusBadge status="EN_ROUTE">En Route</StatusBadge>
 <StatusBadge status="DELAYED">Delayed</StatusBadge>
 <StatusBadge status="ARRIVED">Arrived</StatusBadge>
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Skeleton Loader"
 usedOn={["All Pages"]}
 bestFor="Loading states while fetching data"
 pageLinks={[{ label:"View Flights", href:"/flights" }]}
 >
 <SkeletonLoader variant="table" count={3} />
 </ComponentShowcase>

 <ComponentShowcase
 title="Copy Button"
 usedOn={["Flights Page","Flight Details"]}
 bestFor="Copy flight codes, METAR data, coordinates"
 pageLinks={[{ label:"View Flights", href:"/flights" }]}
 >
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <code className="px-3 py-1.5 bg-surface dark:bg-slate-800 text-sm font-mono">
 FL123 - JFK → LAX
 </code>
 <CopyButton text="FL123 - JFK → LAX" size="md" />
 </div>
 </div>
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* FLIGHT DETAILS COMPONENTS */}
 {activeSection === 'flight-detail' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Flight Details Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for individual flight detail pages</p>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <ComponentShowcase
 title="Timeline"
 usedOn={["Flight Details"]}
 bestFor="Flight event history (scheduled → departed → en route → arrived)"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <Timeline
 items={[
 {
 id: '1',
 time: '08:00 EST',
 title: 'Scheduled Departure',
 description: 'JFK Airport - Gate B23',
 icon: Plane,
 status: 'completed',
 },
 {
 id: '2',
 time: '08:05 EST',
 title: 'Departed',
 description: 'Runway 22L',
 icon: Plane,
 status: 'completed',
 },
 {
 id: '3',
 time: '10:30 EST',
 title: 'Cruising',
 description: 'FL350 - 485kt',
 icon: Gauge,
 status: 'current',
 },
 {
 id: '4',
 time: '11:45 PST',
 title: 'Expected Arrival',
 description: 'LAX Airport - Gate 45',
 icon: MapPin,
 status: 'upcoming',
 },
 ]}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Progress Circle"
 usedOn={["Flight Details"]}
 bestFor="Flight completion percentage, circular progress"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <div className="flex justify-center gap-8 p-4">
 <ProgressCircle progress={67} size={120} color="#2563eb" />
 <ProgressCircle progress={85} size={120} color="#10b981" />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Card Stack"
 usedOn={["Flight Details","Dashboard"]}
 bestFor="Stacked flight cards, layered information"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <CardStack
 cards={[
 {
 id: '1',
 title: 'Flight Progress',
 color: '#2563eb',
 content: (
 <div className="space-y-2">
 <p className="text-sm">Currently at FL350</p>
 <StatusBadge status="EN_ROUTE">En Route</StatusBadge>
 </div>
 ),
 },
 {
 id: '2',
 title: 'Weather Status',
 color: '#10b981',
 content: <p className="text-sm">Clear skies ahead</p>,
 },
 ]}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Card Flip"
 usedOn={["Flight Details"]}
 bestFor="Flip between departure/arrival details"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <CardFlip
 front={
 <div className="p-6 bg-blue-50">
 <h4 className="font-semibold mb-2">Departure: JFK</h4>
 <p className="text-sm">Scheduled: 08:00 EST</p>
 <p className="text-sm">Actual: 08:05 EST</p>
 </div>
 }
 back={
 <div className="p-6 bg-green-50">
 <h4 className="font-semibold mb-2">Arrival: LAX</h4>
 <p className="text-sm">Scheduled: 11:40 PST</p>
 <p className="text-sm">Estimated: 11:45 PST</p>
 </div>
 }
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Expandable Card"
 usedOn={["Flight Details"]}
 bestFor="Collapsible risk factors, constraints, airport info"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <ExpandableCard title="Risk Assessment" defaultExpanded={true}>
 <div className="space-y-2">
 <div className="flex items-start gap-2 text-sm">
 <span className="text-amber">⚠️</span>
 <span>Moderate turbulence expected FL350-380</span>
 </div>
 <div className="flex items-start gap-2 text-sm">
 <span className="text-amber">⚠️</span>
 <span>Light icing conditions at destination</span>
 </div>
 </div>
 </ExpandableCard>
 </ComponentShowcase>

 <ComponentShowcase
 title="Smooth Drawer"
 usedOn={["Flight Details"]}
 bestFor="Slide-in panel for weather/aircraft details"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <div>
 <GradientButton onClick={() => setIsDrawerOpen(true)}>
 Open Flight Details
 </GradientButton>
 <SmoothDrawer
 isOpen={isDrawerOpen}
 onClose={() => setIsDrawerOpen(false)}
 title="Flight FL123 Details"
 side="right"
 >
 <div className="space-y-4">
 <div>
 <h3 className="text-sm font-semibold text-text-secondary dark:text-slate-400 uppercase mb-2">Route</h3>
 <p className="text-lg font-mono font-semibold">JFK → LAX</p>
 </div>
 <div>
 <h3 className="text-sm font-semibold text-text-secondary dark:text-slate-400 uppercase mb-2">Status</h3>
 <StatusBadge status="EN_ROUTE">En Route</StatusBadge>
 </div>
 </div>
 </SmoothDrawer>
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Smooth Tab"
 usedOn={["Flight Details","Dashboard"]}
 bestFor="Switch between Overview/Weather/Aircraft tabs"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <SmoothTab
 tabs={[
 { id: 'overview', label: 'Overview', content: <div>Flight overview information</div> },
 { id: 'weather', label: 'Weather', content: <div>Weather conditions and forecasts</div> },
 { id: 'aircraft', label: 'Aircraft', content: <div>Aircraft details and status</div> },
 ]}
 />
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* WEATHER COMPONENTS */}
 {activeSection === 'weather' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Weather Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for weather comparison and visualization pages</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ComponentShowcase
 title="Liquid Glass Card"
 usedOn={["Weather Page"]}
 bestFor="Weather data with frosted glass effect"
 pageLinks={[{ label:"View Weather", href:"/weather" }]}
 >
 <LiquidGlassCard>
 <div className="p-6">
 <h4 className="font-semibold mb-2">JFK Weather</h4>
 <p className="text-sm text-text-secondary dark:text-slate-400">Temperature: 18°C</p>
 <p className="text-sm text-text-secondary dark:text-slate-400">Wind: 040° @ 15kt</p>
 <p className="text-sm text-text-secondary dark:text-slate-400">Visibility: 10 SM</p>
 </div>
 </LiquidGlassCard>
 </ComponentShowcase>

 <ComponentShowcase
 title="Mouse Effect Card"
 usedOn={["Weather Page"]}
 bestFor="Interactive weather cards with cursor effects"
 pageLinks={[{ label:"View Weather", href:"/weather" }]}
 >
 <MouseEffectCard>
 <div className="p-6">
 <h4 className="font-semibold mb-2">LAX Weather</h4>
 <p className="text-sm">Condition: MVFR</p>
 <p className="text-sm">Ceiling: 3000 ft</p>
 </div>
 </MouseEffectCard>
 </ComponentShowcase>

 <ComponentShowcase
 title="Background Paths"
 usedOn={["Weather Page"]}
 bestFor="Animated path lines for wind patterns"
 pageLinks={[{ label:"View Weather", href:"/weather" }]}
 >
 <BackgroundPaths className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-12 min-h-[250px] flex items-center justify-center">
 <div className="text-center">
 <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Wind Patterns</h3>
 <p className="text-text-secondary dark:text-slate-400">Animated background visualization</p>
 </div>
 </BackgroundPaths>
 </ComponentShowcase>

 <ComponentShowcase
 title="Parallax Card"
 usedOn={["Weather Page"]}
 bestFor="3D weather condition cards with tilt effect"
 pageLinks={[{ label:"View Weather", href:"/weather" }]}
 >
 <ParallaxCard className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
 <h4 className="font-semibold mb-2">Departure Weather</h4>
 <p className="text-sm">VFR Conditions</p>
 <p className="text-sm">Perfect flying weather</p>
 </ParallaxCard>
 </ComponentShowcase>

 <ComponentShowcase
 title="Colorful Button"
 usedOn={["Weather Page"]}
 bestFor="Refresh Weather Data standout CTA"
 pageLinks={[{ label:"View Weather", href:"/weather" }]}
 >
 <ColorfulButton onClick={() => {}}>
 <Cloud size={16} />
 <span>Refresh Weather Data</span>
 </ColorfulButton>
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* AIRPORTS COMPONENTS */}
 {activeSection === 'airports' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Airports Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for airport search and detail pages</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ComponentShowcase
 title="Attract Button"
 usedOn={["Airports Page"]}
 bestFor="Primary action users should notice (Search Airports CTA)"
 pageLinks={[{ label:"View Airports", href:"/airports" }]}
 >
 <AttractButton onClick={() => {}}>
 Search Airports
 </AttractButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Welcome Button"
 usedOn={["Airports Page","All Pages"]}
 bestFor="Floating help button for first-time users"
 pageLinks={[{ label:"View Airports", href:"/airports" }]}
 >
 <div className="relative h-32">
 <WelcomeButton>
 Need Help? Click Here
 </WelcomeButton>
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Gradient Underline"
 usedOn={["Airports Page"]}
 bestFor="Active tab indicator, animated links"
 pageLinks={[{ label:"View Airports", href:"/airports" }]}
 >
 <div className="space-y-4">
 <GradientUnderline>Search</GradientUnderline>
 <GradientUnderline>Favorites</GradientUnderline>
 <GradientUnderline>Recent</GradientUnderline>
 </div>
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* CHAT COMPONENTS */}
 {activeSection === 'chat' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Chat Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for AI chat and messaging interfaces</p>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <ComponentShowcase
 title="AI Input (Multi-Mode)"
 usedOn={["Chat Page"]}
 bestFor="Multi-mode chat input (ask, command, search)"
 pageLinks={[{ label:"View Chat", href:"/chat-enhanced" }]}
 >
 <AIInput placeholder="Ask about weather, search flights, or run commands..." />
 </ComponentShowcase>

 <ComponentShowcase
 title="Tweet Card"
 usedOn={["Chat Page","Dashboard"]}
 bestFor="Display AI responses, social proof, updates feed"
 pageLinks={[{ label:"View Chat", href:"/chat-enhanced" }]}
 >
 <TweetCard
 author="FlightOps AI"
 handle="flightops_ai"
 content="Flight FL123 is currently cruising at FL350 with clear weather ahead. ETA LAX: 11:45 PST. All systems nominal."
 timestamp="Just now"
 likes={12}
 retweets={3}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Processing Button"
 usedOn={["Chat Page"]}
 bestFor="Send Message with loading states"
 pageLinks={[{ label:"View Chat", href:"/chat-enhanced" }]}
 >
 <ProcessingButton onProcess={async () => { await new Promise(resolve => setTimeout(resolve, 1000)); }}>
 Send Message
 </ProcessingButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Beams Background"
 usedOn={["Chat Page"]}
 bestFor="Animated background for chat area"
 pageLinks={[{ label:"View Chat", href:"/chat-enhanced" }]}
 >
 <BeamsBackground className="bg-white dark:bg-slate-900 p-12 min-h-[300px] flex items-center justify-center">
 <div className="text-center">
 <h3 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">AI Chat Interface</h3>
 <p className="text-text-secondary dark:text-slate-400">With animated beam background</p>
 </div>
 </BeamsBackground>
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* SIDEBAR COMPONENTS */}
 {activeSection === 'sidebar' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Sidebar Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Components for navigation sidebars and menus</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ComponentShowcase
 title="Profile Dropdown"
 usedOn={["Sidebar","Header"]}
 bestFor="User menu with account/settings"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <ProfileDropdown
 user={{ name: 'John Pilot', email: 'john@flightops.io', avatar: 'JP' }}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Team Selector"
 usedOn={["Sidebar"]}
 bestFor="Switch between airlines/teams"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <TeamSelector
 teams={[
 { id: '1', name: 'Delta Airlines', color: '#ef4444' },
 { id: '2', name: 'United Airlines', color: '#3b82f6' },
 { id: '3', name: 'American Airlines', color: '#10b981' },
 ]}
 defaultTeam="1"
 onSelect={() => {}}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Floating Dock"
 usedOn={["Global"]}
 bestFor="macOS-style quick actions dock"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="relative h-32">
 <FloatingDock
 items={[
 { icon: Gauge, label: 'Dashboard', onClick: () => {} },
 { icon: Plane, label: 'Flights', onClick: () => {} },
 { icon: Cloud, label: 'Weather', onClick: () => {} },
 { icon: MapPin, label: 'Airports', onClick: () => {} },
 ]}
 />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Toolbar"
 usedOn={["All Pages"]}
 bestFor="Floating action toolbar"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <Toolbar
 items={[
 { icon: Plane, label: 'New Flight', onClick: () => {} },
 { icon: Cloud, label: 'Weather', onClick: () => {} },
 { icon: MapPin, label: 'Airports', onClick: () => {} },
 ]}
 />
 </ComponentShowcase>
 </div>
 </section>
 )}

 {/* GLOBAL UI COMPONENTS */}
 {activeSection === 'global' && (
 <section className="space-y-6">
 <div>
 <h2 className="text-xl font-bold text-text-primary dark:text-slate-50 mb-2">Global UI Components</h2>
 <p className="text-sm text-text-secondary dark:text-slate-400">Reusable components used across all pages</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ComponentShowcase
 title="Gradient Button"
 usedOn={["All Pages"]}
 bestFor="Primary CTAs, important actions"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="flex gap-4">
 <GradientButton size="sm">Small</GradientButton>
 <GradientButton size="md">Medium</GradientButton>
 <GradientButton size="lg">Large</GradientButton>
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Shadow Button"
 usedOn={["All Pages"]}
 bestFor="Secondary actions with 3D press effect"
 pageLinks={[{ label:"View Flights", href:"/flights" }]}
 >
 <ShadowButton onClick={() => {}}>
 Secondary Action
 </ShadowButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Slide Text Button"
 usedOn={["All Pages"]}
 bestFor="Animated hover labels"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <SlideTextButton onClick={() => {}}>
 View Details
 </SlideTextButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Hold-to-Action"
 usedOn={["All Pages"]}
 bestFor="Dangerous actions (cancel flight) requiring confirmation"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <HoldToActionButton
 onComplete={() => alert('Flight cancelled')}
 >
 Hold to Cancel Flight
 </HoldToActionButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Fancy Button"
 usedOn={["All Pages"]}
 bestFor="Magnetic cursor attraction effect"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <FancyButton onClick={() => {}}>
 Fancy Interaction
 </FancyButton>
 </ComponentShowcase>

 <ComponentShowcase
 title="Share Button"
 usedOn={["All Pages"]}
 bestFor="Social sharing with animation"
 pageLinks={[{ label:"View Flight Details", href:"/flights/FL001" }]}
 >
 <ShareButton title="Share Flight" />
 </ComponentShowcase>

 <ComponentShowcase
 title="Switch Button"
 usedOn={["All Pages"]}
 bestFor="Toggle settings with smooth animation"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <SwitchButton
 checked={switchValue}
 onChange={setSwitchValue}
 label="Auto-refresh data"
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Ripple Effect"
 usedOn={["All Pages"]}
 bestFor="Button click feedback"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <RippleEffect>
 Click Me!
 </RippleEffect>
 </ComponentShowcase>

 <ComponentShowcase
 title="Loader"
 usedOn={["All Pages"]}
 bestFor="Page loading spinner"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <div className="flex justify-center">
 <Loader size="lg" />
 </div>
 </ComponentShowcase>

 <ComponentShowcase
 title="Loading Progress"
 usedOn={["All Pages"]}
 bestFor="Multi-step operations"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <LoadingProgress
 steps={[
 { label: 'Fetching flight data', description: 'Getting flight information' },
 { label: 'Loading weather info', description: 'Retrieving weather data' },
 { label: 'Calculating route', description: 'Computing optimal route' },
 ]}
 currentStep={1}
 />
 </ComponentShowcase>

 <ComponentShowcase
 title="Shape Hero"
 usedOn={["Landing Pages"]}
 bestFor="Hero sections with falling shapes"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <ShapeHero className="bg-gradient-to-br from-blue-50 to-white border border-border dark:border-slate-700 p-12 min-h-[300px] flex items-center justify-center">
 <div className="text-center max-w-2xl">
 <h2 className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-4">
 Welcome to FlightOps
 </h2>
 <p className="text-lg text-text-secondary dark:text-slate-400 mb-6">
 Next-generation flight operations platform
 </p>
 <GradientButton size="lg">Get Started</GradientButton>
 </div>
 </ShapeHero>
 </ComponentShowcase>

 <ComponentShowcase
 title="Particle Animation"
 usedOn={["Landing Pages","Hero Sections"]}
 bestFor="Floating particles background"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <ParticleAnimation className="bg-gradient-to-br from-blue-50 to-white p-12 min-h-[250px] flex items-center justify-center" particleCount={30}>
 <div className="text-center">
 <h3 className="text-xl font-bold text-text-primary dark:text-slate-50">Particle Background</h3>
 </div>
 </ParticleAnimation>
 </ComponentShowcase>

 <ComponentShowcase
 title="Spotlight Effect"
 usedOn={["Landing Pages","Hero Sections"]}
 bestFor="Mouse-following spotlight"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <SpotlightEffect className="bg-gradient-to-br from-gray-900 to-gray-800 p-12 min-h-[250px] flex items-center justify-center group">
 <div className="text-center">
 <h3 className="text-xl font-bold text-white">Hover to see spotlight</h3>
 </div>
 </SpotlightEffect>
 </ComponentShowcase>

 <ComponentShowcase
 title="File Upload"
 usedOn={["All Pages"]}
 bestFor="Drag & drop file uploads"
 pageLinks={[{ label:"View Dashboard", href:"/" }]}
 >
 <FileUpload
 onUpload={async (file) => { console.log('Uploaded:', file); }}
 acceptedTypes={['.csv', '.xlsx', '.pdf']}
 maxSize={5 * 1024 * 1024}
 />
 </ComponentShowcase>
 </div>
 </section>
 )}
 </div>
 </div>
 );
}
