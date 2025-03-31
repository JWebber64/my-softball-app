import { useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useBaseRealtimeData } from './useBaseRealtimeData';

export function useEnhancedRealtimeData(tableName, options = {}) {
  const {
    retryAttempts = 3,
    enableCache = false,
    batchUpdates = false
  } = options;

  const toast = useToast();
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleError = useCallback((error) => {
    if (!isMounted.current) return false;
    
    console.error(`Error in ${tableName}:`, error);
    
    if (retryCount.current < retryAttempts) {
      retryCount.current += 1;
      return true;
    }
    
    toast({
      title: `Database Error`,
      description: `Unable to fetch ${tableName}. Please try refreshing the page.`,
      status: 'error',
      duration: 5000,
      isClosable: true
    });
    return false;
  }, [tableName, retryAttempts, toast]);

  const fetchWithRetry = useCallback(async () => {
    let attempts = 0;
    
    while (attempts < retryAttempts) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .throwOnError();

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        attempts++;
        
        if (!handleError(error) || attempts >= retryAttempts) {
          return { data: null, error };
        }
        
        // Wait before next attempt using exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempts) * 1000)
        );
      }
    }
    
    return { data: null, error: new Error('Max retry attempts reached') };
  }, [tableName, handleError, retryAttempts]);

  const base = useBaseRealtimeData(tableName, {
    ...options,
    onError: handleError,
    fetchFunction: fetchWithRetry
  });

  return base;
}
