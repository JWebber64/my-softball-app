import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import { validateData } from '../utils/validation';

export function useEnhancedRealtimeData(tableName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  const toast = useToast();
  const optimisticTimeout = useRef(null);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (updateData) => {
      try {
        const { data: result, error: updateError } = await supabase
          .from(tableName)
          .upsert(updateData);

        if (updateError) throw updateError;

        // Clear pending update after successful save
        setPendingUpdates(prev => {
          const next = new Map(prev);
          next.delete(updateData.id);
          return next;
        });

        toast({
          title: "Update successful",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

      } catch (err) {
        console.error('Update error:', err);
        // Revert optimistic update
        setData(prevData => 
          prevData.map(item => 
            item.id === updateData.id ? 
              pendingUpdates.get(updateData.id).originalData : 
              item
          )
        );

        toast({
          title: "Update failed",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, 1000),
    [tableName, toast]
  );

  // Optimistic update function
  const updateItem = async (id, updates, type) => {
    // Validate data before update
    const { isValid, errors } = await validateData(type, updates);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: Object.values(errors)[0],
        status: "error",
        duration: 3000,
      });
      return false;
    }

    // Store original data for potential rollback
    const originalData = data.find(item => item.id === id);
    setPendingUpdates(prev => {
      const next = new Map(prev);
      next.set(id, { originalData, updates });
      return next;
    });

    // Optimistically update UI
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    // Show pending update notification
    toast({
      title: "Saving changes...",
      status: "info",
      duration: 1000,
    });

    // Trigger debounced update
    debouncedUpdate({ id, ...updates });
    return true;
  };

  // Add new item with optimistic update
  const addItem = async (newItem, type) => {
    // Validate data
    const { isValid, errors } = await validateData(type, newItem);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: Object.values(errors)[0],
        status: "error",
        duration: 3000,
      });
      return false;
    }

    const tempId = `temp_${Date.now()}`;
    const itemWithTempId = { ...newItem, id: tempId };

    // Optimistically add to UI
    setData(prev => [...prev, itemWithTempId]);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      // Replace temp item with real item
      setData(prev => 
        prev.map(item => 
          item.id === tempId ? result : item
        )
      );

      toast({
        title: "Item added successfully",
        status: "success",
        duration: 2000,
      });

      return true;
    } catch (err) {
      // Remove temp item on error
      setData(prev => prev.filter(item => item.id !== tempId));
      
      toast({
        title: "Error adding item",
        description: err.message,
        status: "error",
        duration: 3000,
      });

      return false;
    }
  };

  // Delete with optimistic update
  const deleteItem = async (id) => {
    const originalData = data.find(item => item.id === id);
    
    // Optimistically remove from UI
    setData(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item deleted",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      // Restore item on error
      setData(prev => [...prev, originalData]);
      
      toast({
        title: "Error deleting item",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // ... rest of the useRealtimeData implementation ...

  return {
    data,
    loading,
    error,
    updateItem,
    addItem,
    deleteItem,
    pendingUpdates: pendingUpdates.size > 0,
  };
}