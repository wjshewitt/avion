import { useEffect, useRef, useState, useCallback } from "react"
import { recordAudio } from "@/lib/audio-utils"

interface UseAudioRecordingOptions {
  transcribeAudio?: (blob: Blob) => Promise<string>
  onTranscriptionComplete?: (text: string) => void
}

export function useAudioRecording({
  transcribeAudio,
  onTranscriptionComplete,
}: UseAudioRecordingOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  
  const activeRecordingRef = useRef<Promise<Blob> | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    const checkSpeechSupport = async () => {
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      )
      if (isMounted.current) {
        setIsSpeechSupported(hasMediaDevices && !!transcribeAudio)
      }
    }

    checkSpeechSupport()
  }, [transcribeAudio])

  const stopRecording = useCallback(async () => {
    if (isMounted.current) {
      setIsRecording(false)
      setIsTranscribing(true)
    }
    
    try {
      // First stop the recording to get the final blob
      recordAudio.stop()
      
      // Wait for the recording promise to resolve with the final blob
      if (activeRecordingRef.current) {
        const recording = await activeRecordingRef.current
        if (transcribeAudio && isMounted.current) {
          const text = await transcribeAudio(recording)
          onTranscriptionComplete?.(text)
        }
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
    } finally {
      if (isMounted.current) {
        setIsTranscribing(false)
        setIsListening(false)
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop())
          setAudioStream(null)
        }
      }
      activeRecordingRef.current = null
    }
  }, [transcribeAudio, onTranscriptionComplete, audioStream])

  const toggleListening = useCallback(async () => {
    if (!isListening) {
      try {
        if (isMounted.current) {
          setIsListening(true)
          setIsRecording(true)
        }
        // Get audio stream first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        
        if (!isMounted.current) {
           stream.getTracks().forEach(track => track.stop())
           return
        }

        setAudioStream(stream)

        // Start recording with the stream
        activeRecordingRef.current = recordAudio(stream)
      } catch (error) {
        console.error("Error recording audio:", error)
        if (isMounted.current) {
          setIsListening(false)
          setIsRecording(false)
          if (audioStream) {
             audioStream.getTracks().forEach(track => track.stop())
             setAudioStream(null)
          }
        }
      }
    } else {
      await stopRecording()
    }
  }, [isListening, stopRecording, audioStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [audioStream])

  return {
    isListening,
    isSpeechSupported,
    isRecording,
    isTranscribing,
    audioStream,
    toggleListening,
    stopRecording,
  }
}
