import { Link } from "wouter";
import { useChatContext } from "@/context/ChatContext";

export default function Header() {
  const { state, dispatch } = useChatContext();
  
  const handleBack = () => {
    if (window.location.pathname === "/chat") {
      window.history.back();
    }
  };
  
  return (
    <header className="bg-primary py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-secondary font-display text-xl md:text-2xl font-bold tracking-wide cursor-pointer">
              AROMASENS
            </h1>
          </Link>
        </div>
        <nav>
          {window.location.pathname !== "/" && (
            <button
              onClick={handleBack}
              className="text-neutral-light hover:text-secondary transition-colors"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
