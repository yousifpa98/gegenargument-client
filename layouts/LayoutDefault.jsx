import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Github,
  ChevronRight,
  ExternalLink,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Check,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/Link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppProvider } from "@/context/AppProvider";
import { useAuth } from "@/context/AuthContextProvider";
import "./style.css";
import "./tailwind.css";

// Login form component
const LoginForm = ({ onSuccess, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setFormError(
        err.message ||
          "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border-red-200"
        >
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ihre.email@beispiel.de"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Passwort</Label>
          <Link
            href="/passwort-vergessen"
            className="text-xs text-teal-600 hover:text-teal-800"
          >
            Passwort vergessen?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        disabled={loading}
      >
        {loading ? "Wird angemeldet..." : "Anmelden"}
      </Button>

      <div className="text-center mt-4 text-sm text-gray-600">
        Noch kein Konto?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-teal-600 hover:text-teal-800 font-medium"
        >
          Jetzt registrieren
        </button>
      </div>
    </form>
  );
};

// Register form component
const RegisterForm = ({ onSuccess, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const { register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (password !== passwordConfirm) {
      setFormError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      await register(username, email, password);
      onSuccess();
    } catch (err) {
      setFormError(
        err.message ||
          "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-800 border-red-200"
        >
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Benutzername</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="IhrBenutzername"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ihre.email@beispiel.de"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-confirm">Passwort bestätigen</Label>
        <Input
          id="password-confirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
        disabled={loading}
      >
        {loading ? "Wird registriert..." : "Registrieren"}
      </Button>

      <div className="text-center mt-4 text-sm text-gray-600">
        Bereits ein Konto?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-teal-600 hover:text-teal-800 font-medium"
        >
          Jetzt anmelden
        </button>
      </div>
    </form>
  );
};

// Main auth dialog component
const AuthDialog = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");

  const handleSuccess = () => {
    onClose();
  };

  const switchTab = () => {
    setActiveTab(activeTab === "login" ? "register" : "login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "login"
              ? "Bei Gegenargument anmelden"
              : "Bei Gegenargument registrieren"}
          </DialogTitle>
          <DialogDescription>
            {activeTab === "login"
              ? "Melden Sie sich mit Ihren Zugangsdaten an, um Argumente einzureichen und zu bewerten."
              : "Erstellen Sie ein kostenloses Konto, um Argumente einzureichen und zu bewerten."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Anmelden</TabsTrigger>
            <TabsTrigger value="register">Registrieren</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <LoginForm onSuccess={handleSuccess} onSwitch={switchTab} />
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <RegisterForm onSuccess={handleSuccess} onSwitch={switchTab} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// User menu component for authenticated users
const UserMenu = () => {
  const { user, logout, isAdmin, hasRole } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
        >
          <User size={16} className="mr-2" />
          <span className="max-w-24 truncate">
            {user?.username || "Benutzer"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil" className="cursor-pointer">
            <User size={16} className="mr-2" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/meine-argumente" className="cursor-pointer">
            <ChevronRight size={16} className="mr-2" />
            Meine Argumente
          </Link>
        </DropdownMenuItem>

        {/* Moderator section */}
        {hasRole("mod") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Moderation</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/moderation" className="cursor-pointer">
                <Shield size={16} className="mr-2" />
                Moderationsbereich
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/moderation/prüfung" className="cursor-pointer">
                <Check size={16} className="mr-2" />
                Argument-Prüfung
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Admin section */}
        {isAdmin() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Administration</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Settings size={16} className="mr-2" />
                Admin-Bereich
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut size={16} className="mr-2" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Layout wrapper that provides the AppProvider
function LayoutWithProviders({ children }) {
  return (
    <AppProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppProvider>
  );
}

// Layout content component that uses the context
function LayoutContent({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const pageContext = usePageContext();
  const { user, isAuthenticated, loading } = useAuth();

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  const navItemVariants = {
    hover: { y: -2, scale: 1.05 },
    tap: { y: 1, scale: 0.98 },
  };

  const navigation = [
    { name: "Startseite", href: "/" },
    { name: "Argumente", href: "/explore" },
    { name: "Über", href: "/about" },
    { name: "Einreichen", href: "/einreichen", isButton: true },
  ];

  const footerLinks = [
    { name: "Über", href: "/about" },
    { name: "Kontakt", href: "/kontakt" },
    {
      name: "GitHub",
      href: "https://github.com/gegenargument",
      external: true,
      icon: <Github size={16} />,
    },
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutzerklärung", href: "/datenschutz" },
  ];

  const openAuthDialog = () => {
    setAuthDialogOpen(true);
  };

  const closeAuthDialog = () => {
    setAuthDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-cyan-50 via-white to-amber-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-teal-100 shadow-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and brand */}
            <div className="flex items-center">
              <a
                href="/"
                className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity duration-200 text-primary"
              >
                <span className="flex items-center">
                  <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
                    <span className="text-white text-lg font-bold">G</span>
                  </div>
                  Gegenargument
                </span>
              </a>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) =>
                item.isButton ? (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Button
                      variant="default"
                      className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md group"
                      onClick={() => (window.location.href = item.href)}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <motion.span
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
                        initial={{ scale: 0, x: "-50%", y: "-50%" }}
                        whileHover={{ scale: 4 }}
                        transition={{ duration: 0.5 }}
                        style={{ originX: 0, originY: 0 }}
                      />
                      <motion.span
                        className="absolute right-1 opacity-0 group-hover:opacity-100 text-white"
                        initial={{ x: -10, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronRight size={16} />
                      </motion.span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.name}
                    variants={navItemVariants}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link href={item.href} className="text-gray-700">
                      {item.name}
                    </Link>
                  </motion.div>
                )
              )}

              {/* Auth buttons/menu */}
              <div className="ml-2">
                {loading ? (
                  <div className="h-9 w-24 bg-gray-100 rounded-md animate-pulse"></div>
                ) : isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="flex space-x-2">
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={navItemVariants}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                        onClick={openAuthDialog}
                      >
                        <LogIn size={16} className="mr-1" />
                        Anmelden
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                        onClick={openAuthDialog}
                      >
                        <UserPlus size={16} className="mr-1" />
                        Registrieren
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              {!loading && isAuthenticated ? (
                <UserMenu />
              ) : !loading ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                  onClick={openAuthDialog}
                >
                  <LogIn size={16} className="mr-1" />
                  Anmelden
                </Button>
              ) : null}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-teal-600 hover:bg-teal-50 focus:outline-none transition-transform hover:scale-105 active:scale-95"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="md:hidden bg-white/95 border-teal-100 backdrop-blur-lg border-t"
            >
              <motion.div
                className="container mx-auto px-4 py-4 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {navigation.map(
                  (item, index) =>
                    !item.isButton && (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Link
                          href={item.href}
                          className="block py-2 text-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    )
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Button
                    variant="default"
                    className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md"
                    onClick={() => {
                      window.location.href = "/einreichen";
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="mr-2">Einreichen</span>
                    <ChevronRight size={16} />
                  </Button>
                </motion.div>

                {/* Auth buttons for mobile */}
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthDialog();
                      }}
                    >
                      <LogIn size={16} className="mr-2" />
                      <span>Anmelden / Registrieren</span>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth dialog */}
      <AuthDialog isOpen={authDialogOpen} onClose={closeAuthDialog} />

      {/* Main content with decorative background elements */}
      <main className="flex-grow relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Colorful blurred circles */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        </div>

        {/* Page content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pageContext.urlPathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1,
            }}
            className="container mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10"
          >
            {/* Page status indicator */}
            <div className="fixed bottom-6 right-6 z-40 md:flex hidden">
              <Badge
                variant="outline"
                className="bg-white/70 text-teal-600 border-teal-200 backdrop-blur-md px-3 py-1 shadow-md"
              >
                <div className="w-2 h-2 rounded-full mr-2 bg-teal-500" />
                {pageContext.urlPathname === "/"
                  ? "Startseite"
                  : pageContext.urlPathname.startsWith("/explore")
                  ? "Argumente"
                  : pageContext.urlPathname.startsWith("/einreichen")
                  ? "Einreichen"
                  : pageContext.urlPathname.startsWith("/about")
                  ? "Über"
                  : "Seite"}
              </Badge>
            </div>

            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with modern design */}
      <footer className="border-t border-teal-100 bg-white/90 py-8 relative overflow-hidden backdrop-blur-sm">
        {/* Footer decorative background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #4fd1c5 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-sm text-teal-700 mb-2">
                  © {new Date().getFullYear()} Gegenargument
                </span>
                <div className="flex space-x-2">
                  <Badge
                    variant="outline"
                    className="border-teal-200 text-teal-600"
                  >
                    React
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-teal-200 text-teal-600"
                  >
                    Vike
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-y-2 gap-x-6 text-sm">
              {footerLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link
                    href={link.href}
                    className={`text-teal-600 hover:text-emerald-500 ${
                      link.icon ? "flex items-center" : ""
                    }`}
                    noActiveState
                    external={link.external}
                  >
                    {link.icon && (
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="mr-1"
                      >
                        {link.icon}
                      </motion.div>
                    )}
                    {link.name}
                    {link.external && (
                      <ExternalLink size={12} className="ml-1 opacity-70" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Export the wrapped layout
export function LayoutDefault({ children }) {
  return <LayoutWithProviders>{children}</LayoutWithProviders>;
}

export default LayoutDefault;
