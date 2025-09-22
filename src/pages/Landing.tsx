import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-[#3C3C3C]">
      {/* The Language Toggle button has been removed */}

      <div className="container mx-auto px-4 py-20 relative z-0">
        {/* Decorative Circles */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FFD700]/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob opacity-70"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-[#FFB55A]/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000 opacity-70"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-[#FFB55A]/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000 opacity-70"></div>

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#E5A500] mb-4 drop-shadow-lg">
              SewaConnect
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-[#E5A500] mb-2">
              Simple steps lead to compounding results
            </p>
            <p className="text-lg text-[#3C3C3C] max-w-3xl mx-auto opacity-90 leading-relaxed">
              SewaConnect is a dedicated platform designed to help senior citizens and their caretakers
              collaborate seamlessly. Manage medications, track symptoms, and ensure well-being with
              a user-friendly and intuitive interface.
            </p>
          </div>
          
          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-[#FFB55A] text-white hover:bg-[#FFB55A]/90 px-16 py-8 text-xl font-semibold rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105"
            onClick={() => navigate("/login")}
          >
            Get Started Now
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="w-24 h-24 bg-[#FFB55A]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👨‍⚕️</span>
            </div>
            <p className="text-sm font-semibold text-[#E5A500]">Caring for the elderly</p>
            <p className="mt-2 text-[#3C3C3C] text-sm">Empower caregivers with tools to provide the best possible care.</p>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="w-24 h-24 bg-[#FFB55A]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👵</span>
            </div>
            <p className="text-sm font-semibold text-[#E5A500]">Aids to dignified living</p>
            <p className="mt-2 text-[#3C3C3C] text-sm">Promoting independence and dignity for senior citizens.</p>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="w-24 h-24 bg-[#FFB55A]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">❤️</span>
            </div>
            <p className="text-sm font-semibold text-[#E5A500]">Health made simple</p>
            <p className="mt-2 text-[#3C3C3C] text-sm">Simplifying health monitoring and medication management.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
