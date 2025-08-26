import { useState, useCallback } from 'react'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'goal' | 'task' | 'note' | 'contact'
  url: string
}

export const useSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // Mock search results for now
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Finish the Q4 project proposal document',
          type: 'task',
          url: '/tasks/1'
        },
        {
          id: '2',
          title: 'Weekly health check',
          description: 'Schedule annual health checkup',
          type: 'goal',
          url: '/goals/2'
        }
      ]

      // Filter results based on query
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setResults(filteredResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clearSearch,
    searchQuery: query,
    setSearchQuery: setQuery,
    performSearch: search
  }
}
