import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePageContext } from "vike-react/usePageContext";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useData } from "@/context/DataContextProvider";
import { useAuth } from "@/context/AuthContextProvider";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Animation variants
const animations = {
  section: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  },
};

// Helper function to safely check if we're in the browser
const isBrowser = () => typeof window !== 'undefined';

// Helper function to extract tag name
const getTagName = (tag) => {
  if (typeof tag === "string") return tag;
  if (typeof tag === "object") {
    if (tag.name) return tag.name;
    if (tag._id) return tag._id;
  }
  return "Unbekannt";
};

// Argument Card Component
const ArgumentCard = ({ argument }) => {
  const tags = argument.tags || [];
  return (
    <motion.div
      variants={animations.item}
      className="h-full"
    >
      <Card className="h-full flex flex-col border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2 border-b border-teal-50">
          <h3 className="text-lg font-medium text-primary">
            {argument.thesis}
          </h3>
        </CardHeader>
        <CardContent className="flex-grow py-4">
          <p className="text-gray-600 line-clamp-3">
            {argument.responseSuggestion || argument.antithesis}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-teal-50/70 text-teal-700 hover:bg-teal-100 border-teal-200"
                >
                  {getTagName(tag)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400">Keine Tags</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t border-teal-50 mt-auto">
          <Button
            variant="ghost"
            className="text-teal-600 hover:text-emerald-700 hover:bg-teal-50 transition-colors"
            asChild
          >
            <Link
              href={`/a/${argument.slug}`}
              className="flex items-center hover:no-underline"
            >
              Vollständiges Argument
              <span className="ml-2">
                <ChevronRight size={16} />
              </span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Loading card skeleton
const ArgumentCardSkeleton = () => (
  <div className="h-full rounded-lg border border-teal-100 overflow-hidden bg-white">
    <div className="p-4 border-b border-teal-50">
      <Skeleton className="h-5 w-3/4 bg-teal-100/70" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-full bg-teal-100/50" />
      <Skeleton className="h-4 w-full bg-teal-100/50" />
      <Skeleton className="h-4 w-2/3 bg-teal-100/50" />
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full bg-teal-50" />
        <Skeleton className="h-6 w-12 rounded-full bg-teal-50" />
        <Skeleton className="h-6 w-14 rounded-full bg-teal-50" />
      </div>
    </div>
    <div className="p-4 border-t border-teal-50">
      <Skeleton className="h-9 w-40 bg-teal-100/40" />
    </div>
  </div>
);

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const currentPageNum = parseInt(currentPage, 10);
  // Calculate pages to display
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPageNum - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  // Adjust if we're at the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePageClick = (page) => {
    console.log("Pagination click:", page);
    if (page !== currentPageNum) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(Math.max(1, currentPageNum - 1))}
        disabled={currentPageNum === 1}
        className="border-teal-200 text-teal-600"
      >
        <ChevronLeft size={16} />
      </Button>
      
      {startPage > 1 && (
        <>
          <Button
            variant={currentPageNum === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageClick(1)}
            className={
              currentPageNum === 1
                ? "bg-teal-500"
                : "border-teal-200 text-teal-600"
            }
          >
            1
          </Button>
          {startPage > 2 && (
            <span className="text-gray-500 pt-1">...</span>
          )}
        </>
      )}
      
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPageNum === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(page)}
          className={
            currentPageNum === page
              ? "bg-teal-500"
              : "border-teal-200 text-teal-600"
          }
        >
          {page}
        </Button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-gray-500 pt-1">...</span>
          )}
          <Button
            variant={currentPageNum === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageClick(totalPages)}
            className={
              currentPageNum === totalPages
                ? "bg-teal-500"
                : "border-teal-200 text-teal-600"
            }
          >
            {totalPages}
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(Math.min(totalPages, currentPageNum + 1))}
        disabled={currentPageNum === totalPages}
        className="border-teal-200 text-teal-600"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

// Main ExplorePageComponent
export default function ExplorePage() {
  // Get data from contexts
  const { argumentsList, tags: tagsList, fetchArguments, loadingArguments, pagination, error: contextError } = useData();
  const { isAuthenticated } = useAuth();
  
  // URL Parameters parsing
  const pageContext = usePageContext();
  
  // Function to parse and get URL parameters
  const getUrlParams = useCallback(() => {
    if (!isBrowser()) return { query: "", tags: [], sort: "newest", page: 1 };
    
    const urlSearchParams = new URLSearchParams(window.location.search);
    const query = urlSearchParams.get("q") || "";
    const tagsParam = urlSearchParams.get("tags") || "";
    const sortParam = urlSearchParams.get("sort") || "newest";
    const pageParam = parseInt(urlSearchParams.get("page"), 10) || 1;
    
    return {
      query,
      tags: tagsParam ? tagsParam.split(",") : [],
      sort: sortParam,
      page: pageParam,
    };
  }, []);
  
  // Function to update URL parameters
  const updateUrlParams = useCallback((params) => {
    if (!isBrowser()) return;
    
    const urlSearchParams = new URLSearchParams();
    if (params.query) urlSearchParams.set("q", params.query);
    if (params.tags && params.tags.length > 0) urlSearchParams.set("tags", params.tags.join(","));
    if (params.sort && params.sort !== "newest") urlSearchParams.set("sort", params.sort);
    if (params.page && params.page > 1) urlSearchParams.set("page", params.page.toString());
    
    const newUrl = window.location.pathname + 
      (urlSearchParams.toString() ? `?${urlSearchParams.toString()}` : "");
    
    // Update the URL without full page reload
    window.history.pushState({ path: newUrl }, "", newUrl);
  }, []);
  
  // State
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Process tags for display
  const processedTags = tagsList.map(tag => typeof tag === "object" ? tag.name : tag);
  
  // Constants
  const ITEMS_PER_PAGE = 9;
  const MAX_VISIBLE_TAGS = 12;
  const MAX_MOBILE_TAGS = 6;
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Check if mobile on client side
  useEffect(() => {
    if (isBrowser()) {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, []);
  
  // Initialize from URL params
  useEffect(() => {
    const params = getUrlParams();
    setSearchQuery(params.query);
    setSelectedTags(params.tags);
    setSortOption(params.sort);
    setCurrentPage(params.page);
    
    // Auto-expand filter on desktop or if there are active filters
    const hasActiveFilters = params.query || params.tags.length > 0 || params.sort !== "newest";
    setFilterExpanded(!isMobile || hasActiveFilters);
  }, [getUrlParams, isMobile]);
  
  // Create filtered tags list
  const visibleTags = showAllTags 
    ? processedTags 
    : isMobile 
      ? processedTags.slice(0, MAX_MOBILE_TAGS)
      : processedTags.slice(0, MAX_VISIBLE_TAGS);
  
  // Fetch arguments based on filters
  useEffect(() => {
    async function loadArguments() {
      try {
        // Make sure page parameter is explicitly a number
        const pageNumber = parseInt(currentPage, 10);
        
        // Update URL parameters
        updateUrlParams({
          query: debouncedSearchQuery,
          tags: selectedTags,
          sort: sortOption,
          page: pageNumber
        });
        
        // Build query params
        const queryParams = {
          page: pageNumber,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearchQuery,
          tags: selectedTags,
          sort: sortOption
        };
        
        // Fetch data using the context method
        await fetchArguments(queryParams);
        
      } catch (err) {
        setError(err.message || "Beim Laden der Argumente ist ein Fehler aufgetreten.");
      }
    }
    
    loadArguments();
  }, [debouncedSearchQuery, selectedTags, sortOption, currentPage, fetchArguments, updateUrlParams]);
  
  // Handler for tag selection
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1); // Reset to first page when filter changes
    setFilterExpanded(true); // Expand filters when a tag is selected
  }, []);
  
  // Handler for sort option change
  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Handler for page change
  const handlePageChange = (page) => {
    console.log("Page change requested:", page);
    setCurrentPage(page);
    
    // Immediately update URL to reflect the new page
    updateUrlParams({
      query: debouncedSearchQuery,
      tags: selectedTags,
      sort: sortOption,
      page: page
    });
    
    if (isBrowser()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("newest");
    setCurrentPage(1);
    updateUrlParams({});
  };
  
  // Count of active filters
  const activeFilterCount = [
    debouncedSearchQuery ? 1 : 0,
    selectedTags.length,
    sortOption !== "newest" ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);
  
  // Extra information for mobile view
  const mobileTagLabel = selectedTags.length > 0 
    ? selectedTags.length === 1 
      ? `1 Tag aktiv` 
      : `${selectedTags.length} Tags aktiv` 
    : "Keine Tags";
    
  // Get the current error (from context or local)
  const displayError = error || contextError;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <motion.div
        className="mb-8 text-center"
        initial="hidden"
        animate="visible"
        variants={animations.section}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
          Alle Gegenargumente entdecken
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Stöbere durch faktenbasierte Antworten auf weitverbreitete Aussagen – gesammelt und geprüft von der Community.
        </p>
      </motion.div>
      
      {/* Filter Section - Collapsible on Mobile */}
      <motion.div
        className="bg-white rounded-lg border border-teal-100 p-4 md:p-6 mb-8 sticky top-20 z-10 shadow-sm"
        initial="hidden"
        animate="visible"
        variants={animations.section}
      >
        {/* Title bar with filter count and toggle button on mobile */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-primary">Filter</h2>
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-teal-100 text-teal-700 border-none">
                {activeFilterCount} aktiv
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                onClick={resetFilters}
              >
                <RefreshCw size={16} className="mr-1" />
                <span className="hidden md:inline">Filter zurücksetzen</span>
                <span className="inline md:hidden">Zurücksetzen</span>
              </Button>
            )}
            
            {/* Mobile collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-teal-600"
              onClick={() => setFilterExpanded(!filterExpanded)}
              aria-label={filterExpanded ? "Filter einklappen" : "Filter ausklappen"}
            >
              {filterExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </Button>
          </div>
        </div>
        
        {/* Filter content - collapsible on mobile */}
        <div className={`${filterExpanded ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <Input
                type="text"
                placeholder="Nach Begriff suchen..."
                className="pl-10 border-teal-200 focus-visible:ring-teal-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            
            {/* Sort Dropdown */}
            <div>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="newest">Neueste zuerst</SelectItem>
                    <SelectItem value="oldest">Älteste zuerst</SelectItem>
                    <SelectItem value="relevance">Relevanz</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Submit Button */}
            <div>
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                asChild
              >
                <Link href="/einreichen" className="hover:no-underline text-white">
                  Argument einreichen
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Tags Section - Limited Display with Show More/Less */}
          {processedTags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center text-gray-500 mr-1">
                  <Filter size={14} className="mr-1" />
                  <span className="text-sm font-medium">Themen:</span>
                </div>
                
                {visibleTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag)
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "hover:bg-teal-100 border-teal-300 text-teal-700"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X
                        size={14}
                        className="ml-1 hover:text-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(tag);
                        }}
                      />
                    )}
                  </Badge>
                ))}
                
                {/* Show More/Less button */}
                {((!isMobile && processedTags.length > MAX_VISIBLE_TAGS) || 
                  (isMobile && processedTags.length > MAX_MOBILE_TAGS)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-800 hover:bg-teal-50/80 px-2 py-0 h-6"
                    onClick={() => setShowAllTags(!showAllTags)}
                  >
                    {showAllTags ? (
                      <span className="flex items-center text-xs">
                        {isMobile ? "Weniger" : "Weniger anzeigen"} <ChevronUp size={14} className="ml-1" />
                      </span>
                    ) : (
                      <span className="flex items-center text-xs">
                        {isMobile ? "Mehr" : `Alle anzeigen (${processedTags.length - (isMobile ? MAX_MOBILE_TAGS : MAX_VISIBLE_TAGS)} mehr)`} <ChevronDown size={14} className="ml-1" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Compact filter indicators when collapsed on mobile */}
        {!filterExpanded && (
          <div className="md:hidden flex flex-wrap gap-2">
            {debouncedSearchQuery && (
              <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                Suche: {debouncedSearchQuery.length > 15 ? `${debouncedSearchQuery.substring(0, 15)}...` : debouncedSearchQuery}
              </Badge>
            )}
            
            {selectedTags.length > 0 && (
              <Badge className="bg-teal-600 text-white">
                {mobileTagLabel}
              </Badge>
            )}
            
            {sortOption !== "newest" && (
              <Badge variant="outline" className="border-teal-300 text-teal-700">
                Sortierung: {sortOption === "oldest" ? "Älteste" : "Relevanz"}
              </Badge>
            )}
            
            {!debouncedSearchQuery && selectedTags.length === 0 && sortOption === "newest" && (
              <span className="text-gray-500 text-sm">Keine Filter aktiv</span>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Results Count and Loading */}
      <div className="flex items-center justify-between mb-4">
        {!loadingArguments && !displayError && (
          <div className="text-gray-600">
            {pagination.totalCount > 0
              ? `${pagination.totalCount} ${
                  pagination.totalCount === 1 ? "Argument" : "Argumente"
                } gefunden`
              : "Keine Argumente gefunden"}
          </div>
        )}
        {loadingArguments && (
          <div className="flex items-center text-teal-600">
            <Loader2 size={18} className="animate-spin mr-2" />
            Argumente werden geladen...
          </div>
        )}
        <div></div> {/* Spacer for flex justification */}
      </div>
      
      {/* Main Content - Arguments Grid */}
      {displayError ? (
        <div className="bg-red-50 text-red-500 p-6 rounded-lg border border-red-200 text-center">
          <p>{displayError}</p>
          <Button
            variant="outline"
            className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
            onClick={resetFilters}
          >
            Filter zurücksetzen und erneut versuchen
          </Button>
        </div>
      ) : loadingArguments ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={animations.container}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <ArgumentCardSkeleton key={`skeleton-${index}`} />
          ))}
        </motion.div>
      ) : argumentsList.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={animations.container}
          initial="hidden"
          animate="visible"
        >
          {argumentsList.map((argument, index) => (
            <ArgumentCard
              key={argument._id || argument.id || `arg-${index}`}
              argument={argument}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-teal-50/50 rounded-lg border border-teal-100">
          <h3 className="text-xl font-medium text-teal-700 mb-2">
            Keine passenden Argumente gefunden
          </h3>
          <p className="text-gray-600 mb-6">
            Versuch andere Begriffe oder pass die Filter an.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-teal-300 text-teal-600"
              onClick={resetFilters}
            >
              Filter zurücksetzen
            </Button>
            <Button
              variant="default"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              asChild
            >
              <Link href="/einreichen" className="hover:no-underline text-white">
                Eigenes Argument einreichen
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {!loadingArguments && !displayError && argumentsList.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}