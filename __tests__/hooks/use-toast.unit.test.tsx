import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '@/hooks/use-toast';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useToast hook', () => {
  // Test the reducer function
  describe('reducer', () => {
    it('should handle ADD_TOAST action', () => {
      const initialState = { toasts: [] };
      const newToast = { id: '1', title: 'Test Toast', description: 'Test Description', open: true };
      
      const result = reducer(initialState, { type: 'ADD_TOAST', toast: newToast });
      
      expect(result.toasts).toEqual([newToast]);
    });

    it('should limit the number of toasts', () => {
      const initialState = { toasts: [{ id: '1', title: 'Existing Toast', open: true }] };
      const newToast = { id: '2', title: 'New Toast', open: true };
      
      const result = reducer(initialState, { type: 'ADD_TOAST', toast: newToast });
      
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('should handle UPDATE_TOAST action', () => {
      const initialState = { 
        toasts: [
          { id: '1', title: 'Original Title', description: 'Original', open: true }
        ] 
      };
      
      const updatedToast = { id: '1', title: 'Updated Title' };
      
      const result = reducer(initialState, { type: 'UPDATE_TOAST', toast: updatedToast });
      
      expect(result.toasts[0].title).toBe('Updated Title');
      expect(result.toasts[0].description).toBe('Original'); // Unchanged property
    });

    it('should handle UPDATE_TOAST action with non-existent toast ID', () => {
      const initialState = { 
        toasts: [
          { id: 'existing-id', title: 'Original Title', description: 'Original', open: true }
        ] 
      };
      
      const updatedToast = { id: 'non-existent-id', title: 'Updated Title' };
      
      const result = reducer(initialState, { type: 'UPDATE_TOAST', toast: updatedToast });
      
      // State should remain unchanged since the toast ID doesn't exist
      expect(result.toasts).toEqual(initialState.toasts);
      expect(result.toasts[0].title).toBe('Original Title');
      expect(result.toasts).toHaveLength(1);
    });

    it('should handle DISMISS_TOAST action for specific toast', () => {
      const initialState = { 
        toasts: [
          { id: '1', open: true },
          { id: '2', open: true }
        ] 
      };
      
      const result = reducer(initialState, { type: 'DISMISS_TOAST', toastId: '1' });
      
      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(true);
    });

    it('should handle DISMISS_TOAST action for all toasts', () => {
      const initialState = { 
        toasts: [
          { id: '1', open: true },
          { id: '2', open: true }
        ] 
      };
      
      const result = reducer(initialState, { type: 'DISMISS_TOAST' });
      
      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(false);
    });

    it('should handle REMOVE_TOAST action for specific toast', () => {
      const initialState = { 
        toasts: [
          { id: '1', open: true },
          { id: '2', open: true }
        ] 
      };
      
      const result = reducer(initialState, { type: 'REMOVE_TOAST', toastId: '1' });
      
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('should handle REMOVE_TOAST action for all toasts', () => {
      const initialState = { 
        toasts: [
          { id: '1', open: true },
          { id: '2', open: true }
        ] 
      };
      
      const result = reducer(initialState, { type: 'REMOVE_TOAST' });
      
      expect(result.toasts).toHaveLength(0);
    });
  });

  // Test the hook functionality
  describe('useToast', () => {
    it('should initialize with empty toasts', () => {
      const { result } = renderHook(() => useToast());
      
      expect(result.current.toasts).toEqual([]);
    });

    it('should add a toast when toast() is called', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Test Toast', description: 'Test Description' });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
      expect(result.current.toasts[0].description).toBe('Test Description');
    });

    it('should update a toast', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string;
      
      act(() => {
        const { id, update } = result.current.toast({ title: 'Original Title' });
        toastId = id;
        update({ title: 'Updated Title' });
      });
      
      const updatedToast = result.current.toasts.find(t => t.id === toastId);
      expect(updatedToast?.title).toBe('Updated Title');
    });

    it('should dismiss all toasts when called without id', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
      });
      
      act(() => {
        result.current.dismiss();
      });
      
      // All toasts should be closed
      expect(result.current.toasts.every(t => t.open === false)).toBe(true);
    });

    it('should handle onOpenChange callback', () => {
      const { result } = renderHook(() => useToast());
      let id: string;
      
      act(() => {
        const toast = result.current.toast({ title: 'Test Toast' });
        id = toast.id;
      });
      
      // Simulate the toast being closed in a separate act
      act(() => {
        const toast = result.current.toasts.find(t => t.id === id);
        if (toast && toast.onOpenChange) {
          toast.onOpenChange(false);
        }
      });
      
      // The toast should be dismissed (open: false)
      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should remove toasts after timeout', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        const { id } = result.current.toast({ title: 'Test Toast' });
        result.current.dismiss(id);
      });
      
      expect(result.current.toasts).toHaveLength(1);
      
      // Fast-forward time to trigger removal
      act(() => {
        jest.runAllTimers();
      });
      
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not add duplicate removal timeouts', () => {
      jest.spyOn(global, 'setTimeout');
      const { result } = renderHook(() => useToast());
      
      act(() => {
        const { id } = result.current.toast({ title: 'Test Toast' });
        // Dismiss the same toast twice
        result.current.dismiss(id);
        result.current.dismiss(id);
      });
      
      // Should only have one timeout
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it('should clean up listeners when component unmounts', () => {
      const { result, unmount } = renderHook(() => useToast());
      
      // Add a toast to ensure the hook is working
      act(() => {
        result.current.toast({ title: 'Test Toast' });
      });
      
      // Unmount to trigger cleanup
      unmount();
      
      // Add another toast - this should not affect our unsubscribed component
      act(() => {
        toast({ title: 'Another Toast' });
      });
      
      // The hook's state should remain what it was before unmounting
      expect(result.current.toasts).toHaveLength(1);
    });

    it('should generate unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
      });
      
      const ids = result.current.toasts.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
