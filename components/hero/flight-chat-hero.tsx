"use client";

import { Plane, MessageSquare, Search, ChevronRight } from"lucide-react";
import { Button } from"@/components/ui/button";
import { AnimatedTextCycle } from"./animated-text-cycle";
import { AnimatedGroup } from"./animated-group";

export function FlightChatHero() {

 const transitionVariants = {
 item: {
 hidden: {
 opacity: 0,
 filter:"blur(12px)",
 y: 12,
 },
 visible: {
 opacity: 1,
 filter:"blur(0px)",
 y: 0,
 transition: {
 type:"spring",
 bounce: 0.3,
 duration: 1.5,
 },
 },
 },
 };

 return (
 <div className="relative min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-background overflow-hidden">
 {/* Animated Background Elements */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 blur-3xl animate-pulse" />
 <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 blur-3xl animate-pulse delay-1000" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-3xl" />
 </div>

 {/* Hero Content */}
 <section className="relative pt-32 md:pt-40 pb-20">
 <div className="mx-auto max-w-7xl px-6">
 <div className="text-center sm:mx-auto">
 <AnimatedGroup variants={transitionVariants}>
 <div className="inline-flex items-center gap-2 border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm mb-8">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full bg-blue-400 opacity-75"></span>
 <span className="relative inline-flex h-2 w-2 bg-blue-500"></span>
 </span>
 <span className="text-muted-foreground">
 Now with AI-powered flight recommendations
 </span>
 </div>

 <h1 className="mt-8 max-w-4xl mx-auto text-balance text-5xl md:text-6xl lg:text-7xl font-bold text-white">
 Find Your Perfect Flight with{""}
 <span className="inline-block relative">
 <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400 blur-xl opacity-50"></span>
 <AnimatedTextCycle
 words={["AI Chat","Smart Search","Easy Booking"]}
 interval={3000}
 className="relative bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-transparent font-bold"
 />
 </span>
 </h1>

 <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
 Chat with our AI assistant to discover the best flight deals.
 Search thousands of routes, compare prices instantly, and book
 your journey in seconds. Travel smarter with FlightChat.
 </p>
 </AnimatedGroup>

 <AnimatedGroup
 variants={{
 container: {
 visible: {
 transition: {
 staggerChildren: 0.05,
 delayChildren: 0.75,
 },
 },
 },
 ...transitionVariants,
 }}
 className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row"
 >
 <Button size="lg" className="group relative overflow-hidden">
 <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
 Start Searching
 </span>
 <i className="absolute right-1 top-1 bottom-1 z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
 <ChevronRight size={16} strokeWidth={2} />
 </i>
 </Button>

 <Button size="lg" variant="outline" className="gap-2">
 <MessageSquare className="w-4 h-4" />
 Chat with AI
 </Button>
 </AnimatedGroup>

 {/* Feature Icons */}
 <AnimatedGroup
 preset="blur-slide"
 className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
 >
 <div className="corner-brackets corner-brackets-md corner-brackets-hover group">
 <div className="corner-brackets-inner h-full">
 <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 hover:border-blue-300/50 hover:bg-white/20 transition-all duration-300 h-full relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative p-3 bg-blue-500/20 group-hover:scale-110 transition-transform duration-300">
 <Search className="w-6 h-6 text-blue-400" />
 </div>
 <h3 className="font-semibold text-white relative">Smart Search</h3>
 <p className="text-sm text-blue-100 text-center relative">
 Find flights across hundreds of airlines instantly
 </p>
 </div>
 </div>
 </div>

 <div className="corner-brackets corner-brackets-md corner-brackets-hover group">
 <div className="corner-brackets-inner h-full">
 <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-300/50 hover:bg-white/20 transition-all duration-300 h-full relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative p-3 bg-purple-500/20 group-hover:scale-110 transition-transform duration-300">
 <MessageSquare className="w-6 h-6 text-purple-400" />
 </div>
 <h3 className="font-semibold text-white relative">AI Assistant</h3>
 <p className="text-sm text-blue-100 text-center relative">
 Chat naturally to get personalized recommendations
 </p>
 </div>
 </div>
 </div>

 <div className="corner-brackets corner-brackets-md corner-brackets-hover group">
 <div className="corner-brackets-inner h-full">
 <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-300/50 hover:bg-white/20 transition-all duration-300 h-full relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative p-3 bg-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
 <Plane className="w-6 h-6 text-cyan-400" />
 </div>
 <h3 className="font-semibold text-white relative">Best Prices</h3>
 <p className="text-sm text-blue-100 text-center relative">
 Compare deals and save on every booking
 </p>
 </div>
 </div>
 </div>
 </AnimatedGroup>
 </div>
 </div>

 {/* Decorative Flight Path */}
 <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none opacity-20">
 <svg
 className="w-full h-32"
 viewBox="0 0 1200 100"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 d="M0 50 Q 300 10, 600 50 T 1200 50"
 stroke="currentColor"
 strokeWidth="2"
 strokeDasharray="10 5"
 className="text-blue-500"
 />
 </svg>
 </div>
 </section>
 </div>
 );
}
