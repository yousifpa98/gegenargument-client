import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing arguments and tags
 */
export function useArguments() {
  const [argumentsList, setArgumentsList] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingArguments, setLoadingArguments] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  
  /**
   * Fetch all tags
   */
  const fetchTags = useCallback(async () => {
    try {
      setLoadingTags(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/tags`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setTags(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tags:', err);
    } finally {
      setLoadingTags(false);
    }
  }, [API_BASE]);
  
  /**
   * Fetch arguments with optional filtering
   */
  const fetchArguments = useCallback(async (params = {}) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const { page = 1, limit = 10, search = '', tags = [], sort = 'newest' } = params;
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(tags?.length ? { tags: tags.join(',') } : {}),
        sort
      });
      
      const response = await fetch(`${API_BASE}/api/arguments?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch arguments');
      }
      
      const data = await response.json();
      setArgumentsList(data.data);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      });
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching arguments:', err);
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Search arguments
   */
  const searchArguments = useCallback(async (query, tagsList = []) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        ...(query ? { q: query } : {}),
        ...(tagsList?.length ? { tags: tagsList.join(',') } : {})
      });
      
      const response = await fetch(`${API_BASE}/api/arguments/search?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to search arguments');
      }
      
      const data = await response.json();
      setArgumentsList(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error searching arguments:', err);
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Get a single argument by slug
   */
  const getArgumentBySlug = useCallback(async (slug) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments/${slug}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch argument');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching argument:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Submit a new argument
   */
  const submitArgument = useCallback(async (argumentData) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(argumentData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit argument');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error submitting argument:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Publish an argument (admin/mod only)
   */
  const publishArgument = useCallback(async (id) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments/${id}/publish`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish argument');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error publishing argument:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Suggest a source for an argument
   */
  const suggestSource = useCallback(async (slug, sourceData) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments/${slug}/sources`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to suggest source');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error suggesting source:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Approve a suggested source (admin/mod only)
   */
  const approveSource = useCallback(async (slug, sourceId) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments/${slug}/sources/${sourceId}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve source');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error approving source:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Fetch arguments for moderation (unpublished)
   */
  const fetchArgumentsForModeration = useCallback(async (params = {}) => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const { page = 1, limit = 10 } = params;
      
      const queryParams = new URLSearchParams({
        page,
        limit
      });
      
      const response = await fetch(`${API_BASE}/api/arguments/moderation?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch arguments for moderation');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching arguments for moderation:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  /**
   * Fetch current user's arguments
   */
  const fetchUserArguments = useCallback(async () => {
    try {
      setLoadingArguments(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/arguments/user`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch your arguments');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user arguments:', err);
      throw err;
    } finally {
      setLoadingArguments(false);
    }
  }, [API_BASE]);
  
  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);
  
  return {
    arguments: argumentsList, // Return with the name 'arguments' for API consistency
    argumentsList,            // Also provide as 'argumentsList' to avoid conflicts
    tags,
    loadingArguments,
    loadingTags,
    error,
    pagination,
    fetchTags,
    fetchArguments,
    searchArguments,
    getArgumentBySlug,
    submitArgument,
    publishArgument,
    suggestSource,
    approveSource,
    fetchArgumentsForModeration,
    fetchUserArguments
  };
}

export default useArguments;