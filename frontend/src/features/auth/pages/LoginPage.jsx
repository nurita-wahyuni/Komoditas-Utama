import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { loginUser } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      login(response.user, response.access_token);
      toast.success(`Selamat datang, ${response.user.nama}`);
      navigate(response.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      const errorMessage = err.response?.data?.detail
        ? typeof err.response.data.detail === "object"
          ? JSON.stringify(err.response.data.detail)
          : err.response.data.detail
        : "Autentikasi gagal. Silakan periksa kembali kredensial Anda.";

      setError(errorMessage);
      toast.error("Gagal Masuk");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A1628] font-sans">
      {/* BACKGROUND ELEMENTS */}
      <div className="login-bg-animated" />
      
      {/* GLOWING ORBS */}
      <div className="floating-orb w-[400px] h-[400px] bg-[#1E6FD9] top-[-10%] left-[-5%] opacity-20" />
      <div className="floating-orb w-[350px] h-[350px] bg-[#F5A623] bottom-[10%] right-[-5%] opacity-15" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-[300px] h-[300px] bg-[#0A4D8C] top-[40%] right-[15%] opacity-25" style={{ animationDelay: '4s' }} />
      <div className="floating-orb w-[250px] h-[250px] bg-[#1E6FD9] bottom-[-5%] left-[20%] opacity-15" style={{ animationDelay: '6s' }} />

      {/* DOT GRID OVERLAY */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
      />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card w-[90vw] max-w-[420px] p-10 md:p-12 relative z-10"
      >
        {/* BRANDING */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo-bps.png" 
            alt="BPS Logo" 
            className="h-9 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] mb-4"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-[12px] mb-2 pl-3 drop-shadow-sm">KOMUT</h1>
          <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623] to-transparent mb-4" />
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[4px] text-center">
            Komoditas Utama
          </p>
        </div>

        {/* ERROR MESSAGE */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[11px] text-white/50 font-bold uppercase tracking-[2px] ml-1">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#F5A623] transition-colors" size={18} />
              <Input
                type="email"
                placeholder="name@company.com"
                className="glass-input pl-12 h-12 rounded-xl text-sm font-medium tracking-wide"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[11px] text-white/50 font-bold uppercase tracking-[2px]">Kata Sandi</Label>
              <button type="button" className="text-[11px] text-[#F5A623] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">Lupa password?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#F5A623] transition-colors" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="glass-input pl-12 pr-12 h-12 rounded-xl text-sm tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-1">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              className="border-white/20 data-[state=checked]:bg-[#F5A623] data-[state=checked]:border-[#F5A623] w-4.5 h-4.5 rounded-md"
            />
            <label htmlFor="remember" className="text-[12px] text-white/70 font-medium cursor-pointer select-none tracking-wide">
              Ingat saya di perangkat ini
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="btn-glass-primary w-full h-[52px] rounded-xl text-[14px] font-extrabold tracking-[2px] mt-4 shadow-xl active:scale-[0.98] transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#0A1628]/20 border-t-[#0A1628] rounded-full animate-spin" />
                <span className="font-bold">MEMPROSES...</span>
              </div>
            ) : (
              "MASUK"
            )}
          </Button>
        </form>

        {/* FOOTER */}
        <footer className="mt-8 text-center">
          <p className="text-[11px] text-white/30 font-medium">
            © 2026 KOMUT
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default LoginPage;
