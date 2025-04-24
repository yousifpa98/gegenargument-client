import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePageContext } from "vike-react/usePageContext";
import {
  Send,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
  InfoIcon,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/components/Link";
import { ApiClient } from "@/services/apiClient";

// Helper function to safely check if we're in the browser
const isBrowser = () => typeof window !== "undefined";

// Animation variants
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  }
};

export default function SubmitArgumentPage() {
  // State
  const [formData, setFormData] = useState({
    thesis: "",
    antithesis: "",
    tags: [],
    sources: []
  });
  const [currentTag, setCurrentTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [currentSource, setCurrentSource] = useState({
    url: "",
    title: "",
    publisher: "",
    publishedAt: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize API client
  const apiClient = new ApiClient();

  // Fetch available tags
  useEffect(() => {
    async function fetchTags() {
      try {
        const tagsData = await apiClient.getTags();
        if (Array.isArray(tagsData)) {
          const processedTags = tagsData.map(tag => 
            typeof tag === "object" ? tag.name : tag
          );
          setAvailableTags(processedTags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    
    fetchTags();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle tag input change
  const handleTagInputChange = (e) => {
    setCurrentTag(e.target.value);
  };

  // Add tag
  const addTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag keydown (add on Enter)
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Handle source input change
  const handleSourceChange = (e) => {
    const { name, value } = e.target;
    setCurrentSource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add source
  const addSource = () => {
    // Basic validation
    if (!currentSource.url || !currentSource.title) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, { ...currentSource }]
    }));

    // Reset source form
    setCurrentSource({
      url: "",
      title: "",
      publisher: "",
      publishedAt: ""
    });
  };

  // Remove source
  const removeSource = (index) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.thesis.trim()) {
      errors.thesis = "Bitte gib eine These ein";
    }
    
    if (!formData.antithesis.trim()) {
      errors.antithesis = "Bitte gib ein Gegenargument ein";
    }
    
    if (formData.tags.length === 0) {
      errors.tags = "Bitte füge mindestens ein Tag hinzu";
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await apiClient.submitArgument(formData);
      
      if (response && response.id) {
        setSubmitSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          thesis: "",
          antithesis: "",
          tags: [],
          sources: []
        });
        
        // Scroll to top to show success message
        if (isBrowser()) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        setSubmitError("Unerwarteter Fehler beim Einreichen. Bitte versuche es später erneut.");
      }
    } catch (error) {
      console.error("Error submitting argument:", error);
      setSubmitError("Fehler beim Einreichen des Arguments. Bitte versuche es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="max-w-3xl mx-auto"
        variants={animations.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={animations.item}>
          <h1 className="text-3xl font-bold text-teal-700 mb-3">
            Neues Gegenargument einreichen
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hilf mit, faktenbasierte Antworten auf gängige Aussagen zu sammeln. Dein Beitrag wird geprüft und kann anderen helfen, besser zu argumentieren.
          </p>
        </motion.div>

        {/* Success Message */}
        {submitSuccess && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <AlertTitle className="text-emerald-700 font-medium">
                Gegenargument erfolgreich eingereicht!
              </AlertTitle>
              <AlertDescription className="text-emerald-600">
                Vielen Dank für deinen Beitrag. Dein Gegenargument wird geprüft und bald veröffentlicht.
              </AlertDescription>
              <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Weiteres Argument einreichen
                </Button>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  asChild
                >
                  <Link href="/explore" className="hover:no-underline text-white">
                    Argumente durchsuchen
                    <ChevronRight size={16} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Error Message */}
        {submitError && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Ein Fehler ist aufgetreten</AlertTitle>
              <AlertDescription>
                {submitError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Form */}
        {!submitSuccess && (
          <motion.form onSubmit={handleSubmit} variants={animations.item}>
            <Card className="border-teal-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-teal-700">Argument-Details</CardTitle>
                <CardDescription>
                  Bitte gib die These und dein Gegenargument ein.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Thesis */}
                <div className="space-y-2">
                  <Label htmlFor="thesis" className="text-base font-medium">
                    These <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative flex items-center">
                          <Input
                            id="thesis"
                            name="thesis"
                            placeholder="z.B. 'Alle Politiker sind korrupt'"
                            value={formData.thesis}
                            onChange={handleInputChange}
                            className={`pr-8 border-teal-200 focus-visible:ring-teal-500 ${
                              validationErrors.thesis ? "border-red-300" : ""
                            }`}
                          />
                          <InfoIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80 text-sm">
                          Die These ist die Aussage, auf die du ein Gegenargument liefern möchtest. Formuliere sie klar und prägnant.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {validationErrors.thesis && (
                    <p className="text-red-500 text-sm">{validationErrors.thesis}</p>
                  )}
                </div>

                {/* Antithesis */}
                <div className="space-y-2">
                  <Label htmlFor="antithesis" className="text-base font-medium">
                    Gegenargument <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="antithesis"
                    name="antithesis"
                    placeholder="Dein faktenbasiertes Gegenargument"
                    value={formData.antithesis}
                    onChange={handleInputChange}
                    className={`min-h-32 border-teal-200 focus-visible:ring-teal-500 ${
                      validationErrors.antithesis ? "border-red-300" : ""
                    }`}
                  />
                  {validationErrors.antithesis && (
                    <p className="text-red-500 text-sm">{validationErrors.antithesis}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Ein gutes Gegenargument ist sachlich, faktenbasiert und respektvoll formuliert.
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Tags <span className="text-red-500">*</span>
                  </Label>
                  
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      placeholder="Tag hinzufügen (z.B. Politik, Wirtschaft)"
                      value={currentTag}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      className="border-teal-200 focus-visible:ring-teal-500 w-full"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                      className="shrink-0 border-teal-300 text-teal-600 w-full sm:w-auto"
                    >
                      <Plus size={16} className="mr-1" /> Hinzufügen
                    </Button>
                  </div>
                  
                  {validationErrors.tags && (
                    <p className="text-red-500 text-sm">{validationErrors.tags}</p>
                  )}
                  
                  {/* Tag suggestions */}
                  {availableTags.length > 0 && currentTag.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Vorschläge:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(tag => 
                            tag.toLowerCase().includes(currentTag.toLowerCase()) && 
                            !formData.tags.includes(tag)
                          )
                          .slice(0, 5)
                          .map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer bg-teal-50/70 text-teal-700 hover:bg-teal-100 border-teal-200"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, tag]
                                }));
                                setCurrentTag("");
                              }}
                            >
                              {tag} <Plus size={12} className="ml-1" />
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Selected tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.length > 0 ? (
                      formData.tags.map(tag => (
                                                  <Badge
                          key={tag}
                          variant="default"
                          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            className="ml-1 flex items-center justify-center hover:bg-teal-800 rounded-full p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag(tag);
                            }}
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">Noch keine Tags ausgewählt</p>
                    )}
                  </div>
                </div>

                {/* Sources */}
                <div className="space-y-3 border-t border-teal-100 pt-5 mt-6">
                  <Label className="text-lg font-medium text-teal-700">Quellen</Label>
                  <p className="text-gray-600 text-sm">
                    Füge Quellen hinzu, um dein Gegenargument zu belegen.
                  </p>
                  
                  {/* Source Form */}
                  <Card className="border-teal-100/60">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="url" className="text-sm">
                              URL
                            </Label>
                            <Input
                              id="url"
                              name="url"
                              placeholder="https://..."
                              value={currentSource.url}
                              onChange={handleSourceChange}
                              className="border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="title" className="text-sm">
                              Titel
                            </Label>
                            <Input
                              id="title"
                              name="title"
                              placeholder="Titel der Quelle"
                              value={currentSource.title}
                              onChange={handleSourceChange}
                              className="border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="publisher" className="text-sm">
                              Herausgeber
                            </Label>
                            <Input
                              id="publisher"
                              name="publisher"
                              placeholder="z.B. Spiegel, Zeit, Statista"
                              value={currentSource.publisher}
                              onChange={handleSourceChange}
                              className="border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="publishedAt" className="text-sm">
                              Veröffentlichungsdatum
                            </Label>
                            <Input
                              id="publishedAt"
                              name="publishedAt"
                              type="date"
                              value={currentSource.publishedAt}
                              onChange={handleSourceChange}
                              className="border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={addSource}
                          className="w-full bg-teal-100 text-teal-700 hover:bg-teal-200"
                          disabled={!currentSource.url || !currentSource.title}
                        >
                          <Plus size={16} className="mr-1" /> Quelle hinzufügen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Source List */}
                  <div className="space-y-3 mt-4">
                    {formData.sources.length > 0 ? (
                      formData.sources.map((source, index) => (
                        <div 
                          key={index}
                          className="flex items-center bg-teal-50/50 rounded-lg p-3 border border-teal-100"
                        >
                          <div className="flex-grow">
                            <div className="font-medium text-teal-700">{source.title}</div>
                            <div className="text-sm text-gray-600 truncate">{source.url}</div>
                            {source.publisher && (
                              <div className="text-xs text-gray-500 mt-1">
                                {source.publisher}
                                {source.publishedAt && ` • ${new Date(source.publishedAt).toLocaleDateString()}`}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeSource(index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">Noch keine Quellen hinzugefügt</p>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row sm:justify-between border-t border-teal-100 pt-6 pb-4 space-y-3 sm:space-y-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-500 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/explore">Abbrechen</Link>
                </Button>
                
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wird eingereicht...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" /> Argument einreichen
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}