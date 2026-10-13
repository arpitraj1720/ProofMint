import { useState, useCallback, useEffect } from "react";
import { Page } from "./types";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { VerifyPage } from "./pages/VerifyPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AboutPage } from "./pages/AboutPage";

function AppContent() {
  const { isAuthenticated } = useAuth();

  const getPageFromHash = (): Page => {
    const hash = window.location.hash.replace("#", "").trim().toLowerCase() as Page;
    const validPages: Page[] = [
      "home",
      "verify",
      "login",
      "register-account",
      "dashboard",
      "register",
      "profile",
      "about",
    ];
    return validPages.includes(hash) ? hash : "home";
  };

  const [page, setPageState] = useState<Page>(getPageFromHash);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

  const setPage = useCallback((newPage: Page) => {
    window.location.hash = newPage;
    setPageState(newPage);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setPageState(getPageFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleStartRegister = () => {
    if (isAuthenticated) {
      setPage("register");
    } else {
      setAuthNotice("Please sign in or create an account to register image proofs on-chain.");
      setPage("login");
    }
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage setPage={setPage} onStartRegister={handleStartRegister} />;
      case "verify":
        return <VerifyPage setPage={setPage} />;
      case "login":
      case "register-account":
        return (
          <AuthPage
            initialMode={page === "register-account" ? "register" : "login"}
            notice={authNotice}
            setPage={setPage}
          />
        );
      case "dashboard":
        return <DashboardPage setPage={setPage} />;
      case "register":
        return <RegisterPage setPage={setPage} />;
      case "profile":
        return <ProfilePage setPage={setPage} />;
      case "about":
        return <AboutPage setPage={setPage} />;
      default:
        return <HomePage setPage={setPage} onStartRegister={handleStartRegister} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        page={page}
        setPage={(p) => {
          setAuthNotice(undefined);
          setPage(p);
        }}
        onStartRegister={handleStartRegister}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
