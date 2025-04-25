import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/Link";

export default function ErrorPage() {
  const { is404 } = usePageContext();
  
  // Animation variants
  const animations = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { 
          duration: 0.5,
          staggerChildren: 0.1
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        },
      },
    },
  };

  if (is404) {
    // 404 Page Not Found
    return (
      <motion.div 
        className="container mx-auto px-4 py-16 max-w-3xl text-center"
        initial="hidden"
        animate="visible"
        variants={animations.container}
      >
        <motion.div variants={animations.item}>
          <div className="mx-auto w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <Search size={40} className="text-teal-500" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-teal-700 mb-4"
          variants={animations.item}
        >
          Seite nicht gefunden
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 text-lg mb-8"
          variants={animations.item}
        >
          Die von dir gesuchte Seite existiert leider nicht oder wurde verschoben.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={animations.item}
        >
          <Button
            variant="outline"
            className="border-teal-300 text-teal-600"
            asChild
          >
            <Link href="/" className="flex items-center">
              <Home size={16} className="mr-2" />
              Zurück zur Startseite
            </Link>
          </Button>
          
          <Button
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            asChild
          >
            <Link href="/explore" className="hover:no-underline text-white flex items-center">
              <Search size={16} className="mr-2" />
              Argumente durchsuchen
            </Link>
          </Button>
        </motion.div>
        
        <motion.div 
          className="mt-12 p-6 border border-amber-200 bg-amber-50 rounded-lg text-amber-700 inline-block"
          variants={animations.item}
        >
          <p className="text-sm">
            Falls du über einen externen Link hierher gelangt bist, 
            informiere bitte den Seitenbetreiber über den ungültigen Link.
          </p>
        </motion.div>
      </motion.div>
    );
  }
  
  // 500 Internal Server Error
  return (
    <motion.div 
      className="container mx-auto px-4 py-16 max-w-3xl text-center"
      initial="hidden"
      animate="visible"
      variants={animations.container}
    >
      <motion.div variants={animations.item}>
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
      </motion.div>
      
      <motion.h1 
        className="text-4xl font-bold text-red-700 mb-4"
        variants={animations.item}
      >
        Server-Fehler
      </motion.h1>
      
      <motion.p 
        className="text-gray-600 text-lg mb-8"
        variants={animations.item}
      >
        Bei der Verarbeitung deiner Anfrage ist ein Fehler aufgetreten. Wir arbeiten daran, das Problem zu beheben.
      </motion.p>
      
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        variants={animations.item}
      >
        <Button
          variant="outline"
          className="border-red-300 text-red-600"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} className="mr-2" />
          Zurück
        </Button>
        
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          asChild
        >
          <Link href="/" className="hover:no-underline text-white flex items-center">
            <Home size={16} className="mr-2" />
            Zur Startseite
          </Link>
        </Button>
      </motion.div>
      
      <motion.div 
        className="mt-12 p-6 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 inline-block"
        variants={animations.item}
      >
        <p className="text-sm">
          Falls das Problem weiterhin besteht, kontaktiere uns bitte über die Seite
          {" "}
          <Link href="/kontakt" className="text-teal-600 hover:underline">
            Kontakt
          </Link>.
        </p>
      </motion.div>
    </motion.div>
  );
}