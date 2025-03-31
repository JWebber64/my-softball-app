import { useCallback, useEffect, useRef, useState } from 'react';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        if (!mounted.current) return;
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionInstance.onerror = (event) => {
        if (!mounted.current) return;
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      mounted.current = false;
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition || !mounted.current) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition || !mounted.current) return;
    try {
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, [recognition]);

  return { isListening, transcript, startListening, stopListening };
};

export default useVoiceRecognition;