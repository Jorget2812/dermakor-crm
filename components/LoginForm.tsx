import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { UserRole } from '../types';
import { Mail, Lock, Shield, ArrowRight, UserCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
    const { signIn } = useAuth();
    const [loginRole, setLoginRole] = useState<string>(UserRole.SALES_REP);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) throw signInError;

            // Note: The actual role will still be determined by the profile in Supabase.
            // This selection helps guide the user and adds the requested distinction.
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials'
                ? 'Identifiants invalides. Vérifiez votre email et mot de passe.'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative"
        >
            <div className="bg-[#1C1F26]/90 backdrop-blur-2xl rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[60px] -translate-y-16 translate-x-16"></div>

                <div className="text-center mb-10">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="inline-block p-5 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl mb-6 shadow-2xl shadow-[#D4AF37]/20"
                    >
                        <Shield className="w-8 h-8 text-black" strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">DermaKor Swiss</h1>
                    <p className="text-[#6B6B63] text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Strategic Partner Ecosystem</p>
                </div>

                <div className="mb-8">
                    <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest block mb-4 text-center">Identifiez-vous en tant que :</label>
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => setLoginRole(UserRole.SALES_REP)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${loginRole === UserRole.SALES_REP ? 'bg-[#1C1F26] text-[#D4AF37] shadow-xl border border-[#D4AF37]/20' : 'text-[#6B6B63] hover:text-white'}`}
                        >
                            <UserCircle size={14} /> Collaboreur
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole(UserRole.DIRECTEUR)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${loginRole === UserRole.DIRECTEUR ? 'bg-[#1C1F26] text-[#D4AF37] shadow-xl border border-[#D4AF37]/20' : 'text-[#6B6B63] hover:text-white'}`}
                        >
                            <Shield size={14} /> Directeur
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest block mb-3 ml-1">Email Professionnel</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all placeholder:text-[#3A3A3A]"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest block mb-3 ml-1">Mot de Passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all placeholder:text-[#3A3A3A]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl border bg-red-500/10 border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group mt-6 bg-[#D4AF37] text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#E5C158] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {loginRole === UserRole.DIRECTEUR ? 'Accès Direction' : 'Accès Collaborateur'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>

                    <p className="text-[9px] text-center text-[#6B6B63] font-bold mt-4 opacity-50 px-4">
                        Accès réservé au personnel autorisé. La création de compte est gérée par l'administration.
                    </p>
                </form>
            </div>

            <p className="text-center mt-10 text-[9px] font-black text-[#6B6B63] uppercase tracking-[0.4em] opacity-40">
                SWISS CRM • ÉDITION EXCELLENCE 2026
            </p>
        </motion.div>
    );
};

export default LoginForm;
