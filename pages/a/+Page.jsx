import React, { useState, useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  ExternalLink,
  Calendar,
  AlertCircle,
  BookOpen,
  CheckCircle,
  Tag as TagIcon,
  Quote,
  ArrowRight,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/components/Link";
import { ApiClient } from "@/services/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to safely check if we're in the browser
const isBrowser = () => typeof window !== "undefined";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Unbekannt";
  try {
    const date = new Date(dateString);
    return format(date, "d. MMMM yyyy", { locale: de });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Ungültiges Datum";
  }
};

// Helper function to extract tag name
const getTagName = (tag) => {
  if (typeof tag === "string") return tag;
  if (typeof tag === "object") {
    if (tag.name) return tag.name;
    if (tag._id) return tag._id;
  }
  return "Unbekannt";
};

// Animations
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  },
  header: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.1 },
    },
  },
};

// Skeleton loader for the argument
const ArgumentSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4 bg-teal-100/60" />
      <Skeleton className="h-6 w-1/2 bg-teal-100/40" />

      <div className="flex flex-wrap gap-2 mt-4">
        <Skeleton className="h-6 w-20 rounded-full bg-teal-50" />
        <Skeleton className="h-6 w-16 rounded-full bg-teal-50" />
        <Skeleton className="h-6 w-24 rounded-full bg-teal-50" />
      </div>
    </div>

    <div className="mt-6 space-y-2">
      <Skeleton className="h-6 w-1/4 bg-teal-100/60" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-3/4 bg-teal-100/30" />
    </div>

    <div className="mt-8 space-y-2">
      <Skeleton className="h-6 w-1/4 bg-teal-100/60" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-full bg-teal-100/30" />
      <Skeleton className="h-4 w-3/4 bg-teal-100/30" />
    </div>

    <div className="mt-8 space-y-2">
      <Skeleton className="h-6 w-1/4 bg-teal-100/60" />
      <div className="border rounded-lg p-4 space-y-3">
        <Skeleton className="h-4 w-3/4 bg-teal-100/30" />
        <Skeleton className="h-4 w-1/2 bg-teal-100/30" />
        <Skeleton className="h-4 w-1/3 bg-teal-100/30" />
      </div>
    </div>
  </div>
);

// Source Component
const SourceItem = ({ source }) => {
  return (
    <Card className="mb-4 border-teal-100 transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium text-teal-700">{source.title}</h4>
            <div className="text-sm text-gray-600">{source.publisher}</div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={14} className="mr-1" />
              {formatDate(source.publishedAt)}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="ml-2 border-teal-200 text-teal-600 hover:bg-teal-50"
            asChild
          >
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Quelle <ExternalLink size={14} className="ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ArgumentDetailPage() {
  const pageContext = usePageContext();
  const [argument, setArgument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the slug from the URL
  const getSlugFromUrl = () => {
    if (isBrowser()) {
      const pathParts = window.location.pathname.split("/");
      return pathParts[pathParts.length - 1];
    }

    // For SSR, extract from pageContext
    if (pageContext && pageContext.urlPathname) {
      const pathParts = pageContext.urlPathname.split("/");
      return pathParts[pathParts.length - 1];
    }

    return null;
  };

  const slug = getSlugFromUrl();

  // Fetch the argument data
  useEffect(() => {
    async function fetchArgument() {
      if (!slug) {
        setError("Argument nicht gefunden");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const apiClient = new ApiClient();
        const data = await apiClient.getArgumentBySlug(slug);

        if (data) {
          setArgument(data);
        } else {
          setError("Argument nicht gefunden");
        }
      } catch (err) {
        console.error("Error fetching argument:", err);
        setError("Fehler beim Laden des Arguments");
      } finally {
        setIsLoading(false);
      }
    }

    fetchArgument();
  }, [slug]);

  // Format creation date
  const formattedDate = argument ? formatDate(argument.createdAt) : null;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            Das gesuchte Argument konnte nicht gefunden werden.
          </h2>
          <Button asChild>
            <Link href="/explore">Alle Argumente durchsuchen</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !argument) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ArgumentSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      variants={animations.container}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb */}
      <motion.div
        className="text-sm text-gray-500 mb-6 flex items-center"
        variants={animations.item}
      >
        <Link href="/" className="hover:text-teal-600">
          Startseite
        </Link>
        <ArrowRight size={12} className="mx-2" />
        <Link href="/explore" className="hover:text-teal-600">
          Argumente
        </Link>
        <ArrowRight size={12} className="mx-2" />
        <span className="text-teal-700 font-medium">Argument</span>
      </motion.div>

      {/* Title Section */}
      <motion.div className="mb-8" variants={animations.header}>
        <h1 className="text-2xl md:text-3xl font-bold text-teal-700 mb-3">
          „{argument.thesis}"
        </h1>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {argument.tags && argument.tags.length > 0 && (
            <>
              <div className="flex items-center text-gray-500 mr-1">
                <TagIcon size={14} className="mr-1" />
              </div>

              {argument.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-teal-50/80 text-teal-700 border-teal-200"
                >
                  {getTagName(tag)}
                </Badge>
              ))}
            </>
          )}

          <div className="ml-auto text-sm text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" />
            {formattedDate}
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div variants={animations.item}>
        <Separator className="my-6 bg-teal-100" />
      </motion.div>

      {/* Thesis and Antithesis Section */}
      <motion.div
        className="grid md:grid-cols-2 gap-6 mb-8"
        variants={animations.item}
      >
        <div className="bg-teal-50/50 rounded-lg p-5 border border-teal-100">
          <h2 className="text-lg font-medium text-teal-800 mb-3 flex items-center">
            <Quote size={18} className="mr-2 text-teal-600" />
            These
          </h2>
          <p className="text-gray-700">{argument.thesis}</p>
        </div>

        <div className="bg-emerald-50/50 rounded-lg p-5 border border-emerald-100">
          <h2 className="text-lg font-medium text-emerald-800 mb-3 flex items-center">
            <CheckCircle size={18} className="mr-2 text-emerald-600" />
            Gegenargument
          </h2>
          <p className="text-gray-700">{argument.antithesis}</p>
        </div>
      </motion.div>

      {/* Compact Response */}
      {argument.responseSuggestion && (
        <motion.div className="mb-8" variants={animations.item}>
          <h2 className="text-xl font-semibold text-teal-700 mb-3 flex items-center">
            <BookOpen size={20} className="mr-2" />
            Kompakte Antwort
          </h2>
          <div className="bg-white rounded-lg p-6 border border-teal-200 shadow-sm">
            <p className="text-gray-700">{argument.responseSuggestion}</p>
          </div>
        </motion.div>
      )}

      {/* Detailed Response Section */}
      {argument.detailedResponse && (
        <motion.div className="mb-12" variants={animations.item}>
          <h2 className="text-xl font-semibold text-teal-700 mb-4 flex items-center">
            <BookOpen size={20} className="mr-2" />
            Ausführliche Erklärung
          </h2>
          <div className="bg-white rounded-lg p-6 border border-teal-200 prose prose-teal max-w-none prose-headings:text-teal-700 prose-a:text-teal-600">
            <ReactMarkdown>{argument.detailedResponse}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Sources Section */}
      {argument.sources && argument.sources.length > 0 && (
        <motion.div className="mb-8" variants={animations.item}>
          <h2 className="text-xl font-semibold text-teal-700 mb-4 flex items-center">
            <Link2 size={20} className="mr-2" />
            Quellen
          </h2>

          <div className="space-y-4">
            {argument.sources.map((source, index) => (
              <SourceItem key={index} source={source} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap justify-between items-center mt-12 pt-6 border-t border-teal-100"
        variants={animations.item}
      >
        <div>
          <Button
            variant="outline"
            className="border-teal-200 text-teal-600"
            asChild
          >
            <Link href="/explore">
              <ArrowRight size={16} className="mr-2 rotate-180" />
              Zurück zu allen Argumenten
            </Link>
          </Button>
        </div>

        <div className="mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  asChild
                >
                  <Link
                    href={`/einreichen`}
                    className="hover:no-underline text-white"
                  >
                    Eigenes Argument einreichen
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reiche ein neues Gegenargument ein</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </motion.div>
  );
}