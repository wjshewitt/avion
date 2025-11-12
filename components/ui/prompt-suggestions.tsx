import { Plane, CloudRain, AlertTriangle, FileText } from 'lucide-react'

interface PromptSuggestionsProps {
 label: string
 append: (message: { role:"user"; content: string }) => void
 suggestions: string[]
}

const suggestionIcons = [AlertTriangle, CloudRain, Plane, FileText]

export function PromptSuggestions({
 label,
 append,
 suggestions,
}: PromptSuggestionsProps) {
 return (
 <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-8 space-y-8">
 <div className="text-center space-y-3">
 <h2 className="text-3xl font-bold text-foreground">{label}</h2>
 <p className="text-sm text-muted-foreground">
 Choose a prompt below or type your own question
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
 {suggestions.map((suggestion, index) => {
 const Icon = suggestionIcons[index % suggestionIcons.length]
 return (
 <button
 key={suggestion}
 onClick={() => append({ role:"user", content: suggestion })}
 className="group relative text-left p-5 border border-border bg-card hover:border-blue hover:shadow-md transition-all duration-200"
 >
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border bg-muted group-hover:border-blue group-hover:bg-blue/5 transition-colors">
 <Icon className="w-5 h-5 text-muted-foreground group-hover:text-blue transition-colors" />
 </div>
 <p className="text-sm text-foreground leading-relaxed flex-1">
 {suggestion}
 </p>
 </div>
 </button>
 )
 })}
 </div>
 </div>
 )
}
