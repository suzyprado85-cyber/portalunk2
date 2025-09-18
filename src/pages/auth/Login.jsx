import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import VinylRecord from '../../components/VinylRecord';
import toast from 'react-hot-toast';

const Login = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, userProfile } = useAuth();
  const navigate = useNavigate();

  const appLogo = import.meta.env?.VITE_APP_LOGO || '/logo.png';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    setIsPlaying(!isPlaying);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        const raw = String(signInError?.message || '');
        let friendly = 'Falha na autenticação. Tente novamente.';
        if (!isSupabaseConfigured) {
          friendly = 'Configuração do Supabase ausente. Aguarde e tente novamente.';
        } else if (/email\s*n[aã]o\s*confirmado/i.test(raw) || /not\s*confirmed/i.test(raw) || /confirm\s*your\s*email/i.test(raw)) {
          friendly = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (/invalid\s*login\s*credentials/i.test(raw)) {
          friendly = 'Email ou senha incorretos.';
        } else if (/too\s*many\s*requests|rate\s*limit/i.test(raw)) {
          friendly = 'Muitas tentativas. Aguarde alguns minutos.';
        } else if (/network|fetch|timeout/i.test(raw)) {
          friendly = 'Falha de rede. Verifique sua conexão.';
        } else if (raw) {
          friendly = raw;
        }
        setError(friendly);
        toast.error(friendly);
      } else {
        // Fetch profile immediately to decide destination without waiting for context
        const userId = (await supabase?.auth?.getUser())?.data?.user?.id;
        let role = userProfile?.role;
        if (!role && userId) {
          const { data: profile } = await supabase?.from('profiles')?.select('*')?.eq('user_id', userId)?.single();
          role = profile?.role;
        }

        if (role === 'admin') {
          toast.success('Bem-vindo ao painel administrativo!');
          navigate('/admin-dashboard');
        } else if (role === 'producer') {
          toast.success('Bem-vindo ao painel do produtor!');
          navigate('/producer-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      toast.error('Falha na autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/30"></div>

      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.h1
          className="text-4xl font-bold text-white relative"
          style={{ boxShadow: '1px 1px 3px 0 rgba(48, 23, 90, 1)', opacity: 0.97, border: '1px none rgba(82, 19, 101, 1)' }}
          animate={{
            textShadow: [
              "0 0 0px #ff0000",
              "2px 0 0px #ff0000, -2px 0 0px #00ffff",
              "0 0 0px #ff0000",
              "1px 0 0px #ff0000, -1px 0 0px #00ffff",
              "0 0 0px #ff0000"
            ]
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2,
            times: [0, 0.1, 0.2, 0.3, 1]
          }}
        >
          Bem-Vindo ao Portal UNK
        </motion.h1>
      </motion.div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <VinylRecord isPlaying={isPlaying} logoSrc={appLogo} />
      </motion.div>

      <motion.div
        className="mt-12 relative z-10 w-80"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/60 border border-gray-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300 text-sm backdrop-blur-sm"
                placeholder="seu@email.com"
                disabled={loading}
                required
              />
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-gray-900/60 border border-gray-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300 text-sm backdrop-blur-sm"
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              className="p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.div
            className="pt-4 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 rounded-full flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <motion.div
                  className="w-4 h-4 border border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Play className="w-4 h-4 ml-0.5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" />
              )}
            </motion.button>
          </motion.div>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            disabled={loading || !email}
            onClick={async () => {
              try {
                const { error: rpErr } = await supabase?.auth?.resetPasswordForEmail(email, {
                  redirectTo: window?.location?.origin + '/login'
                });
                if (rpErr) {
                  toast.error(rpErr?.message || 'Falha ao enviar link de recuperação.');
                } else {
                  toast.success('Enviamos um link de recuperação para seu email.');
                }
              } catch {
                toast.error('Falha ao enviar link de recuperação.');
              }
            }}
            className="text-gray-400 hover:text-gray-200 text-xs underline disabled:opacity-50"
          >
            Esqueci minha senha
          </button>
        </div>

        <motion.p
          className="text-gray-500 text-xs mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Clique em play para fazer login com suas credenciais
        </motion.p>

        <motion.div
          className="text-center mt-8 text-gray-600 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <p>© 2025 UNK Assessoria Musical. Todos os direitos reservados.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
