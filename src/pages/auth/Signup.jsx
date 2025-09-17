import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'producer',
    company_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e?.target || {};
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData?.password !== formData?.confirmPassword) {
      setError('As senhas não conferem.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData?.password?.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase?.auth?.signUp({
        email: formData?.email,
        password: formData?.password
      });

      if (authError) {
        if (authError?.message?.includes('User already registered')) {
          setError('Este email já está cadastrado.');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
        return;
      }

      if (authData?.user) {
        // Create profile
        const { error: profileError } = await supabase?.from('profiles')?.insert({
            user_id: authData?.user?.id,
            email: formData?.email,
            name: formData?.name,
            role: formData?.role,
            company_name: formData?.company_name,
            phone: formData?.phone
          });

        if (profileError) {
          setError('Erro ao criar perfil. Entre em contato com o suporte.');
          return;
        }

        setSuccess(true);
      }
    } catch (error) {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 blue-border-glow mb-4">
            <Icon name="CheckCircle" size={24} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Conta Criada!
          </h1>
          <p className="text-muted-foreground mb-6">
            Verifique seu email para confirmar a conta e fazer login.
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="blue-border-glow"
          >
            Ir para Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full blue-border-glow mb-4"
          >
            <Icon name="UserPlus" size={24} className="text-blue-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Criar Conta
          </h1>
          <p className="text-muted-foreground text-sm">
            Junte-se ao UNK Artist Hub
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-surface border-red-500/30 p-3 rounded-lg mb-6"
          >
            <div className="flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome Completo
            </label>
            <Input
              type="text"
              name="name"
              value={formData?.name || ''}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData?.email || ''}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Conta
            </label>
            <Select
              name="role"
              value={formData?.role || 'producer'}
              onChange={handleChange}
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            >
              <option value="producer">Produtor de Eventos</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>

          {formData?.role === 'producer' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome da Empresa
              </label>
              <Input
                type="text"
                name="company_name"
                value={formData?.company_name || ''}
                onChange={handleChange}
                placeholder="Nome da sua empresa"
                disabled={loading}
                className="glass-surface border-blue-500/20 focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Telefone
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData?.phone || ''}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Senha
            </label>
            <Input
              type="password"
              name="password"
              value={formData?.password || ''}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirmar Senha
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData?.confirmPassword || ''}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              required
              disabled={loading}
              className="glass-surface border-blue-500/20 focus:border-blue-400"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full blue-border-glow hover:blue-glow transition-smooth disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                <span>Criando Conta...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Icon name="UserPlus" size={18} />
                <span>Criar Conta</span>
              </div>
            )}
          </Button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-300 text-sm transition-smooth"
          >
            Já tem uma conta? Faça login
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;