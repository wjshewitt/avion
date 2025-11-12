"use client";

import React from"react";
import { FlightChatHero } from"@/components/hero/flight-chat-hero";
import CornerBracket from"@/components/corner-bracket";
import StatusBadge from"@/components/kokonutui/status-badge";
import GradientButton from"@/components/kokonutui/gradient-button";
import SlideTextButton from"@/components/kokonutui/slide-text-button";
import { AnimatedGridPattern } from"@/components/ui/animated-grid-pattern";
import BeamsBackground from"@/components/kokonutui/beams-background";
import ParticleAnimation from"@/components/kokonutui/particle-animation";
import { motion } from"framer-motion";
import {
 Plane,
 Cloud,
 MapPin,
 Navigation,
 Radio,
 AlertTriangle,
 Calendar,
 Shield,
 Database,
 MessageSquare,
 TrendingUp,
 Clock,
 Search,
 ChevronDown,
} from"lucide-react";

// Floating Icons Component
function FloatingIcons() {
 const icons = [
 { Icon: Plane, top: '20%', left: '10%', delay: 0 },
 { Icon: Cloud, top: '60%', right: '15%', delay: 1 },
 { Icon: Navigation, top: '40%', left: '85%', delay: 2 },
 { Icon: MapPin, top: '75%', left: '20%', delay: 1.5 }
 ];

 return (
 <>
 {icons.map((item, i) => (
 <motion.div
 key={i}
 className="absolute text-blue-400/10"
 style={{
 top: item.top,
 left: item.left,
 right: item.right
 }}
 animate={{
 y: [0, -20, 0],
 rotate: [-5, 5, -5],
 opacity: [0.1, 0.2, 0.1]
 }}
 transition={{
 duration: 8 + i,
 repeat: Infinity,
 delay: item.delay,
 ease: 'easeInOut'
 }}
 >
 <item.Icon size={48} />
 </motion.div>
 ))}
 </>
 );
}

export default function Home() {
 // Bento grid items for core capabilities
 const capabilities = [
 {
 id:"1",
 title:"AI Flight Planning",
 description:"Generate optimized routes with weather & risk analysis",
 icon: Plane,
 color:"#2563eb",
 gradient:"linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
 },
 {
 id:"2",
 title:"Live Weather Intelligence",
 description:"Real-time METAR/TAF with AI translations",
 icon: Cloud,
 color:"#10b981",
 gradient:"linear-gradient(135deg, #10b981 0%, #34d399 100%)",
 },
 {
 id:"3",
 title:"Risk Assessment",
 description:"Automated flight safety evaluation",
 icon: AlertTriangle,
 color:"#f59e0b",
 gradient:"linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
 },
 {
 id:"4",
 title:"Airport Database",
 description:"Runways, frequencies, navigation aids",
 icon: MapPin,
 color:"#8b5cf6",
 gradient:"linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
 },
 {
 id:"5",
 title:"Operations Dashboard",
 description:"Active flight monitoring and alerts",
 icon: TrendingUp,
 color:"#06b6d4",
 gradient:"linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
 },
 {
 id:"6",
 title:"Chat Assistant",
 description:"Natural language queries for ops data",
 icon: MessageSquare,
 color:"#ec4899",
 gradient:"linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
 },
 ];

 // Timeline items for workflow
 const workflowSteps = [
 {
 id:"1",
 time:"Step 1",
 title:"Plan",
 description:"AI analyzes route, weather, and operational risks",
 icon: Navigation,
 status:"completed" as const,
 },
 {
 id:"2",
 time:"Step 2",
 title:"Review",
 description:"Dashboard shows comprehensive flight briefing",
 icon: Database,
 status:"completed" as const,
 },
 {
 id:"3",
 time:"Step 3",
 title:"Monitor",
 description:"Live tracking and alerts during flight",
 icon: Radio,
 status:"current" as const,
 },
 {
 id:"4",
 time:"Step 4",
 title:"Complete",
 description:"Post-flight reporting and analytics",
 icon: Calendar,
 status:"upcoming" as const,
 },
 ];

 // Popular route suggestions for search demo
 const popularRoutes = [
"KJFK to KLAX",
"KBOS to KMIA",
"KDFW to KSFO",
"KORD to KATL",
 ];

 return (
 <div className="min-h-screen">
 {/* Hero Section */}
 <FlightChatHero />

 {/* Core Capabilities Section */}
 <section className="py-24 px-6 bg-gradient-to-b from-white via-slate-50 to-gray-50">
 <div className="mx-auto max-w-7xl">
 <div className="text-center mb-16">
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-900 to-text-primary bg-clip-text text-transparent mb-4">
 Comprehensive Flight Operations Platform
 </h2>
 <p className="text-lg text-text-secondary dark:text-slate-400 max-w-2xl mx-auto">
 Everything you need to manage private charter operations with
 AI-powered intelligence
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {capabilities.map((item, index) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: index * 0.1 }}
 className="group"
 >
 <CornerBracket size="md" variant="hover">
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 h-full relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative">
 <div className="mb-4 p-3 inline-flex" style={{ backgroundColor: `${item.color}15` }}>
 <item.icon size={28} style={{ color: item.color }} />
 </div>
 <h3 className="text-md font-semibold text-text-primary dark:text-slate-50 mb-2">
 {item.title}
 </h3>
 <p className="text-sm text-text-secondary dark:text-slate-400">
 {item.description}
 </p>
 </div>
 </div>
 </CornerBracket>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* Operational Metrics Section */}
 <section className="py-24 px-6 bg-gradient-to-b from-gray-50 via-blue-50/20 to-white relative">
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20" />
 <div className="mx-auto max-w-7xl relative z-10">
 <div className="text-center mb-16">
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-600 to-text-primary bg-clip-text text-transparent mb-4">
 Built for Scale & Reliability
 </h2>
 <p className="text-lg text-text-secondary dark:text-slate-400">
 Trusted by flight operators worldwide
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { icon: MapPin, value:"500+", label:"Airports in Database", color:"#2563eb" },
 { icon: Clock, value:"24/7", label:"Operations Monitoring", color:"#10b981" },
 { icon: TrendingUp, value:"100%", label:"Real-time Updates", color:"#8b5cf6" },
 { icon: Shield, value:"99.9%", label:"AI Accuracy Rate", color:"#06b6d4" }
 ].map((stat, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: index * 0.1 }}
 className="group"
 >
 <CornerBracket size="md" variant="hover">
 <div className="bg-white/80 backdrop-blur-sm border border-border dark:border-slate-700 p-6 h-full hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
 <div className="flex items-start justify-between mb-4">
 <div 
 className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
 style={{ backgroundColor: `${stat.color}20` }}
 >
 <stat.icon size={24} style={{ color: stat.color }} />
 </div>
 </div>
 <div className="text-3xl font-bold text-text-primary dark:text-slate-50 mb-1 font-mono">
 {stat.value}
 </div>
 <div className="text-sm text-slate-600">{stat.label}</div>
 </div>
 </CornerBracket>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* Workflow Visualization Section */}
 <section className="py-24 px-6 bg-white dark:bg-slate-900">
 <div className="mx-auto max-w-7xl">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 <div>
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-700 to-text-primary bg-clip-text text-transparent mb-4">
 Streamlined Charter Flight Workflow
 </h2>
 <p className="text-lg text-slate-600 mb-8">
 From initial planning to post-flight analysis, our platform
 guides you through every phase of private charter operations
 with AI-powered insights and real-time intelligence.
 </p>
 <div className="flex gap-4">
 <GradientButton size="lg">
 <Plane size={18} />
 <span>Start Planning</span>
 </GradientButton>
 <SlideTextButton>Learn More</SlideTextButton>
 </div>
 </div>
 <CornerBracket size="lg" variant="hover">
 <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-gray-50 p-8 border border-border dark:border-slate-700 hover:border-blue-200 transition-colors duration-300 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300" />
 <div className="space-y-0">
 {workflowSteps.map((step, index) => {
 const Icon = step.icon;
 const isLast = index === workflowSteps.length - 1;
 const statusColors = {
 completed: { dot: '#10b981', line: '#10b981', bg: '#f0fdf4' },
 current: { dot: '#3b82f6', line: '#e5e7eb', bg: '#eff6ff' },
 upcoming: { dot: '#e5e7eb', line: '#e5e7eb', bg: '#f9fafb' },
 };
 const colors = statusColors[step.status];

 return (
 <div key={step.id} className="relative flex gap-4">
 {!isLast && (
 <div
 className="absolute left-6 top-12 w-0.5 h-full"
 style={{ backgroundColor: colors.line }}
 />
 )}
 <motion.div
 initial={{ scale: 0 }}
 whileInView={{ scale: 1 }}
 viewport={{ once: true }}
 transition={{ delay: index * 0.1 }}
 className="relative z-10 w-12 h-12 flex items-center justify-center flex-shrink-0"
 style={{ backgroundColor: colors.bg }}
 >
 <Icon size={20} style={{ color: colors.dot }} />
 </motion.div>
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ delay: index * 0.1 + 0.1 }}
 className="flex-1 pb-8"
 >
 <div className="text-xs text-text-secondary dark:text-slate-400 font-mono mb-1">{step.time}</div>
 <div className="font-semibold text-text-primary dark:text-slate-50 mb-1">{step.title}</div>
 <div className="text-sm text-text-secondary dark:text-slate-400">{step.description}</div>
 </motion.div>
 </div>
 );
 })}
 </div>
 </div>
 </CornerBracket>
 </div>
 </div>
 </section>

 {/* Interactive Search Demo Section */}
 <section className="py-24 px-6 bg-gradient-to-b from-white via-blue-50/30 to-slate-50">
 <div className="mx-auto max-w-4xl">
 <div className="text-center mb-12">
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-600 to-text-primary bg-clip-text text-transparent mb-4">
 Search Airports or Ask AI
 </h2>
 <p className="text-lg text-slate-600">
 Find airports, check weather, or chat with our AI assistant
 </p>
 </div>
 <div className="mb-6">
 <CornerBracket size="md" variant="hover">
 <div className="bg-white/80 backdrop-blur-sm border border-border dark:border-slate-700 p-4 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
 <div className="flex items-center gap-3">
 <Search size={18} className="text-blue-500" />
 <input
 type="text"
 placeholder="Search airports, flights, or ask AI..."
 className="flex-1 outline-none text-text-primary dark:text-slate-50 placeholder:text-slate-400 bg-transparent"
 />
 </div>
 </div>
 </CornerBracket>
 </div>
 <div className="flex flex-wrap gap-3 justify-center">
 <span className="text-sm text-slate-600">Popular routes:</span>
 {popularRoutes.map((route, i) => (
 <button
 key={i}
 className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-border dark:border-slate-700 text-sm text-text-primary dark:text-slate-50 hover:border-blue-400 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white transition-all duration-300"
 >
 {route}
 </button>
 ))}
 </div>
 </div>
 </section>

 {/* Feature Spotlight Section */}
 <section className="py-24 px-6 bg-white dark:bg-slate-900">
 <div className="mx-auto max-w-4xl">
 <div className="text-center mb-16">
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-700 to-text-primary bg-clip-text text-transparent mb-4">
 Powerful Features for Flight Operations
 </h2>
 <p className="text-lg text-slate-600">
 Advanced capabilities designed for charter flight management
 </p>
 </div>
 <div className="space-y-4">
 {[
 {
 title:"AI Chat Assistant",
 badge: <StatusBadge status="LOW">AI-Powered</StatusBadge>,
 content: (
 <>
 <p className="text-sm text-text-secondary dark:text-slate-400 mb-3">
 Get instant answers about weather conditions, airport
 information, and flight planning through natural language
 conversations.
 </p>
 <ul className="space-y-2 text-sm text-text-secondary dark:text-slate-400">
 <li className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 bg-blue" />
 Natural language weather briefings
 </li>
 <li className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 bg-blue" />
 Real-time route optimization suggestions
 </li>
 <li className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 bg-blue" />
 Contextual operational intelligence
 </li>
 </ul>
 </>
 )
 },
 {
 title:"Automated Risk Assessment",
 badge: <StatusBadge status="MODERATE">Safety Critical</StatusBadge>,
 content: (
 <>
 <p className="text-sm text-text-secondary dark:text-slate-400 mb-3">
 Comprehensive risk analysis using weather data, route
 conditions, and historical patterns to ensure safe operations.
 </p>
 <div className="grid grid-cols-3 gap-3">
 <div className="text-center p-3 bg-green-50">
 <div className="text-lg font-bold text-green-700">LOW</div>
 <div className="text-xs text-green-600">Clear conditions</div>
 </div>
 <div className="text-center p-3 bg-amber-50">
 <div className="text-lg font-bold text-amber-700">MODERATE</div>
 <div className="text-xs text-amber-600">Monitor weather</div>
 </div>
 <div className="text-center p-3 bg-red-50">
 <div className="text-lg font-bold text-red-700">HIGH</div>
 <div className="text-xs text-red-600">Review required</div>
 </div>
 </div>
 </>
 )
 },
 {
 title:"Real-time Alert System",
 badge: <StatusBadge status="HIGH">Always Active</StatusBadge>,
 content: (
 <>
 <p className="text-sm text-text-secondary dark:text-slate-400 mb-3">
 Stay informed with intelligent notifications about weather
 changes, delays, and critical operational events.
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-3 p-3 bg-amber-50">
 <AlertTriangle size={18} className="text-amber-600" />
 <div className="flex-1">
 <div className="text-sm font-semibold text-amber-900">
 Weather Advisory
 </div>
 <div className="text-xs text-amber-700">
 Thunderstorms forecasted along route
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 bg-blue-50">
 <Radio size={18} className="text-blue-600" />
 <div className="flex-1">
 <div className="text-sm font-semibold text-blue-900">
 NOTAM Update
 </div>
 <div className="text-xs text-blue-700">
 New temporary flight restriction issued
 </div>
 </div>
 </div>
 </div>
 </>
 )
 }
 ].map((feature, index) => (
 <ExpandableFeatureCard 
 key={index}
 title={feature.title}
 badge={feature.badge}
 >
 {feature.content}
 </ExpandableFeatureCard>
 ))}
 </div>
 </div>
 </section>

 {/* Trust & Reliability Section */}
 <section className="py-24 px-6 bg-gradient-to-b from-slate-50 via-gray-50 to-white">
 <div className="mx-auto max-w-5xl">
 <div className="text-center mb-12">
 <h2 className="text-4xl font-bold bg-gradient-to-r from-text-primary via-blue-600 to-text-primary bg-clip-text text-transparent mb-4">
 Built for Professional Operations
 </h2>
 <p className="text-lg text-slate-600">
 Enterprise-grade reliability and security
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { badge:"Real-time Data", desc:"Live updates from aviation weather services" },
 { badge:"AI-Powered", desc:"Advanced machine learning for insights" },
 { badge:"Operations Ready", desc:"24/7 monitoring and support systems" },
 { badge:"Secure Platform", desc:"Enterprise security and compliance" }
 ].map((item, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: index * 0.1 }}
 className="group"
 >
 <CornerBracket size="sm" variant="hover">
 <div className="text-center p-6 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative">
 <div className="mb-3 flex justify-center">
 <StatusBadge status="LOW">{item.badge}</StatusBadge>
 </div>
 <p className="text-sm text-slate-600">
 {item.desc}
 </p>
 </div>
 </div>
 </CornerBracket>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* Strong CTA Section */}
 <section className="py-32 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 relative overflow-hidden">
 {/* Animated Grid Pattern */}
 <AnimatedGridPattern
 numSquares={60}
 maxOpacity={0.3}
 duration={3}
 className="fill-white/5 stroke-white/10"
 />
 
 {/* Layer 2: Beams */}
 <BeamsBackground>
 {/* Layer 3: Particles */}
 <ParticleAnimation particleCount={30}>
 {/* Enhanced gradient blobs with animations */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <motion.div
 className="absolute top-10 left-10 w-96 h-96 bg-blue-500/20 blur-3xl"
 animate={{
 scale: [1, 1.2, 1],
 opacity: [0.2, 0.3, 0.2],
 }}
 transition={{
 duration: 8,
 repeat: Infinity,
 ease: 'easeInOut'
 }}
 />
 <motion.div
 className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 blur-3xl"
 animate={{
 scale: [1, 1.3, 1],
 opacity: [0.2, 0.3, 0.2],
 }}
 transition={{
 duration: 10,
 repeat: Infinity,
 ease: 'easeInOut',
 delay: 1
 }}
 />
 
 {/* Floating aviation icons */}
 <FloatingIcons />
 </div>

 <div className="mx-auto max-w-4xl text-center relative z-10">
 <CornerBracket size="lg" variant="active">
 <div className="border border-blue-400/30 bg-blue-950/30 backdrop-blur-xl p-12 relative overflow-hidden group">
 {/* Enhanced gradient overlay with animation */}
 <motion.div 
 className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
 animate={{
 backgroundPosition: ['0% 0%', '100% 100%'],
 }}
 transition={{
 duration: 10,
 repeat: Infinity,
 repeatType: 'reverse'
 }}
 />
 
 <div className="relative">
 {/* Staggered text animations */}
 <motion.h2 
 className="text-5xl font-bold text-white mb-6"
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6 }}
 >
 Ready to Transform Your Flight Operations?
 </motion.h2>
 
 <motion.p 
 className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto"
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, delay: 0.2 }}
 >
 Join the next generation of charter flight management with
 AI-powered intelligence and real-time operational insights.
 </motion.p>

 {/* Enhanced buttons with stagger */}
 <motion.div 
 className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
 initial={{ opacity: 0, scale: 0.9 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.4 }}
 >
 <motion.div
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <GradientButton size="lg">
 <Plane size={20} />
 <span>Access Dashboard</span>
 </GradientButton>
 </motion.div>
 
 <motion.div
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group">
 <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 group-hover:translate-x-full transition-transform duration-1000"></span>
 <span className="relative z-10"><Play size={20} /></span>
 <span className="relative z-10">View Demo Flight</span>
 </button>
 </motion.div>
 </motion.div>

 {/* Enhanced benefits section */}
 <motion.div 
 className="pt-6 border-t border-white/10"
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6, delay: 0.6 }}
 >
 <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
 {[
 { text:"No credit card required" },
 { text:"Full platform access" }
 ].map((item, i) => (
 <motion.div
 key={i}
 className="flex items-center gap-2 text-blue-100"
 initial={{ opacity: 0, x: -10 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
 >
 <motion.svg 
 className="w-4 h-4 text-green-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 initial={{ scale: 0, rotate: -180 }}
 whileInView={{ scale: 1, rotate: 0 }}
 viewport={{ once: true }}
 transition={{ 
 duration: 0.5, 
 delay: 0.8 + i * 0.1,
 type:"spring",
 stiffness: 200
 }}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </motion.svg>
 <span>{item.text}</span>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>
 </div>
 </CornerBracket>
 </div>
 </ParticleAnimation>
 </BeamsBackground>
 </section>
 </div>
 );
}

// Play icon component (inline since we need it)
function Play({ size = 24 }) {
 return (
 <svg
 width={size}
 height={size}
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 >
 <polygon points="5 3 19 12 5 21 5 3" />
 </svg>
 );
}

// Expandable Feature Card Component
function ExpandableFeatureCard({ 
 title, 
 badge, 
 children 
}: { 
 title: string; 
 badge: React.ReactNode; 
 children: React.ReactNode;
}) {
 const [isExpanded, setIsExpanded] = React.useState(false);

 return (
 <CornerBracket size="md" variant="hover">
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 relative">
 {isExpanded && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300" />
 )}
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-colors"
 >
 <div className="flex items-center gap-3">
 <h3 className="text-sm font-semibold text-text-primary dark:text-slate-50">{title}</h3>
 {badge}
 </div>
 <motion.div
 animate={{ rotate: isExpanded ? 180 : 0 }}
 transition={{ duration: 0.3 }}
 className="text-blue-500"
 >
 <ChevronDown size={20} />
 </motion.div>
 </button>

 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ 
 height: 'auto',
 opacity: 1,
 transition: {
 height: { duration: 0.3 },
 opacity: { duration: 0.25, delay: 0.05 }
 }
 }}
 exit={{ 
 height: 0,
 opacity: 0,
 transition: {
 height: { duration: 0.3 },
 opacity: { duration: 0.2 }
 }
 }}
 className="overflow-hidden"
 >
 <div className="px-6 pb-4 pt-2 border-t border-blue-100 bg-gradient-to-r from-blue-50/30 to-transparent">
 {children}
 </div>
 </motion.div>
 )}
 </div>
 </CornerBracket>
 );
}
