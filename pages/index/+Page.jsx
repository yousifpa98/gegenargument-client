import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/components/Link";
import { Search, ArrowRight, Filter, ExternalLink } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useData } from "@/context/DataContextProvider";
import { useAuth } from "@/context/AuthContextProvider";

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
        staggerChildren: 0.07,
        delayChildren: 0.1,
        duration: 0.1,
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
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  },
};

// Helper function to extract tag name
const getTagName = (tag) => {
  // Handle different tag formats
  if (typeof tag === "string") return tag;
  if (typeof tag === "object") {
    if (tag.name) return tag.name;
    if (tag._id) return tag._id; // Fallback if just ID is provided
  }
  return "Unbekannt";
};

// ArgumentCard component
const ArgumentCard = ({ argument }) => {
  // Extract and normalize tags array
  const tags = argument.tags || [];

  return (
    <div className="h-full">
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
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Loading shimmer effect
const ShimmerCard = () => (
  <div className="h-64 bg-white border border-teal-100 rounded-lg overflow-hidden">
    <div className="h-12 bg-teal-50/50 animate-pulse"></div>
    <div className="p-4 space-y-4">
      <div className="h-5 bg-teal-100/70 rounded animate-pulse"></div>
      <div className="h-5 bg-teal-100/70 rounded w-3/4 animate-pulse"></div>
      <div className="h-5 bg-teal-100/70 rounded w-1/2 animate-pulse"></div>
      <div className="flex space-x-2 mt-4">
        <div className="h-6 w-16 bg-teal-50 rounded-full animate-pulse"></div>
        <div className="h-6 w-20 bg-teal-50 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Search result component
const SearchResult = ({ result }) => {
  // Extract and normalize tags array
  const tags = result.tags || [];

  return (
    <div className="bg-white rounded-lg border border-teal-100 p-4 hover:border-teal-300 hover:shadow-sm transition-all">
      <h3 className="font-medium text-primary mb-2">{result.thesis}</h3>
      <p className="text-gray-600 line-clamp-2">
        {result.responseSuggestion || result.antithesis}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.length > 0 ? (
          tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="bg-teal-50/70 text-teal-700 border-teal-200"
            >
              {getTagName(tag)}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-gray-400">Keine Tags</span>
        )}
      </div>
      <Button
        variant="ghost"
        className="text-teal-600 mt-2 hover:text-emerald-700 hover:bg-teal-50"
        asChild
      >
        <Link
          href={`/a/${result.slug}`}
          className="flex items-center hover:no-underline"
        >
          Vollständiges Argument
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </Button>
    </div>
  );
};

// Main Page Component
export default function IndexPage() {
  // Get data from contexts
  const {
    argumentsList,
    tags: tagsList,
    fetchArguments,
    searchArguments,
    loadingArguments,
    loadingTags,
  } = useData();
  const { isAuthenticated } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [featuredArguments, setFeaturedArguments] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Process tags for display
  const processedTags = tagsList.map((tag) =>
    typeof tag === "object" ? tag.name : tag
  );

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch arguments for featured display
        const data = await fetchArguments({ limit: 6, sort: "newest" });
        if (data?.data) {
          setFeaturedArguments(data.data);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    }

    fetchInitialData();
  }, [fetchArguments]);

  // Handle search
  useEffect(() => {
    async function performSearch() {
      if (debouncedSearchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // Perform search using the context method
        const results = await searchArguments(
          debouncedSearchQuery,
          selectedTags
        );

        if (Array.isArray(results)) {
          setSearchResults(results);
        } else {
          console.warn("Search response is not an array");
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery, selectedTags, searchArguments]);

  // Toggle tag selection
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  return (
    <div className="flex flex-col space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <motion.section
        className="text-center px-4"
        initial="hidden"
        animate="visible"
        variants={animations.section}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
          „Was sagen, wenn jemand sowas sagt?"
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Gegenargument sammelt sachliche, menschliche Antworten auf populäre
          Thesen – mit Quellen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto px-8 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md transition-all"
            asChild
          >
            <Link href="/explore" className="hover:no-underline text-white">
              Argumente entdecken
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 border-teal-500 text-teal-700 hover:bg-teal-50"
            asChild
          >
            <Link href="/einreichen" className="hover:no-underline">
              Gegenargument einreichen
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        className="px-4 max-w-4xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={animations.section}
      >
        <div className="relative w-full mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <Input
            className="w-full pl-10 py-6 text-lg border-teal-200 focus-visible:ring-teal-500 transition-colors"
            placeholder="Suchbegriff eingeben..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag filters */}
        {processedTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="inline-flex items-center text-gray-500 mr-1">
              <Filter size={16} className="mr-1" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            {processedTags.slice(0, 10).map((tag) => (
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
              </Badge>
            ))}
          </div>
        )}

        {/* Search results */}
        {debouncedSearchQuery.trim().length > 2 && (
          <AnimatePresence>
            <motion.div className="mt-4 space-y-4">
              {isSearching ? (
                // Loading spinner...
                <div className="flex justify-center py-8">
                  <div className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-full">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Suche läuft...
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {/* Search results header */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg text-primary font-medium">
                      Suchergebnisse
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-teal-50 text-teal-700 border-teal-200"
                    >
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "Ergebnis" : "Ergebnisse"}
                    </Badge>
                  </div>

                  {/* Search results list */}
                  {searchResults.slice(0, 3).map((result) => (
                    <SearchResult
                      key={result._id || result.id || `result-${Math.random()}`}
                      result={result}
                    />
                  ))}

                  {/* More results link */}
                  {searchResults.length > 3 && (
                    <div className="text-center mt-6">
                      <Button
                        variant="outline"
                        className="border-teal-200 text-teal-600 hover:border-teal-300 hover:bg-teal-50"
                        asChild
                      >
                        <Link
                          href={`/explore?q=${encodeURIComponent(
                            debouncedSearchQuery
                          )}`}
                          className="hover:no-underline"
                        >
                          Alle Ergebnisse anzeigen
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div className="text-center py-8 bg-white rounded-lg border border-teal-100">
                  <p className="text-gray-500 mb-2">
                    Keine Ergebnisse gefunden.
                  </p>
                  <p className="text-sm text-gray-400">
                    Versuche andere Suchbegriffe oder{" "}
                    <Link
                      href="/einreichen"
                      className="text-teal-500 hover:underline"
                    >
                      reiche ein neues Argument ein
                    </Link>
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.section>

      {/* Featured Arguments Section */}
      <motion.section
        className="px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={animations.section}
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Beispielargumente
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Entdecke einige unserer Gegenargumente zu aktuellen Themen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loadingArguments ? (
            // Loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <ShimmerCard key={`placeholder-${index}`} />
            ))
          ) : featuredArguments.length > 0 ? (
            featuredArguments.map((argument, index) => (
              <motion.div
                key={argument._id || argument.id || `arg-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <ArgumentCard argument={argument} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Keine Argumente verfügbar.</p>
            </div>
          )}
        </div>

        <motion.div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-teal-300 text-teal-600 hover:bg-teal-50"
            asChild
          >
            <Link href="/explore" className="hover:no-underline">
              Alle Argumente entdecken
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 py-16 px-4 rounded-lg mx-4 md:mx-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={animations.section}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Warum das Ganze?
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Gegenargument ist ein offenes Projekt, das dabei hilft,
            faktenbasierte Antworten auf gängige Aussagen parat zu haben. Egal
            ob am Küchentisch, im Netz oder im Alltag – wir glauben, dass eine
            sachliche Stimme oft fehlt. Unsere Inhalte sind geprüft, fundiert
            und offen einsehbar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="border-teal-500 text-teal-700 hover:bg-teal-100"
              asChild
            >
              <Link href="/about" className="hover:no-underline">
                Mehr erfahren
              </Link>
            </Button>

            <Button
              variant="outline"
              className="border-teal-500 text-teal-700 hover:bg-teal-100 inline-flex items-center"
              asChild
            >
              <a
                href="https://github.com/gegenargument"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:no-underline"
              >
                GitHub
                <ExternalLink size={14} className="ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Submit Teaser Section */}
      <motion.section
        className="px-4 text-center max-w-3xl mx-auto mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={animations.section}
      >
        <div className="p-8 rounded-xl bg-gradient-to-r from-teal-100 to-emerald-100 shadow-sm border border-teal-200">
          <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
            Du hast eine Aussage, die du öfter hörst – und eine gute Antwort
            dazu?
          </h2>
          <Button
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md transition-all"
            asChild
          >
            <Link href="/einreichen" className="hover:no-underline text-white">
              Eigenes Gegenargument einreichen
            </Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
