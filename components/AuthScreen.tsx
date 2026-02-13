import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';

const AuthScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#F5F5DC] to-[#F4E4BC] flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E8E6DA]/30 rounded-full blur-3xl"></div>
            </div>

            <LoginForm />

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 text-center"
            >
                <p className="text-xs text-[#5A5A5A] font-medium">
                    DermaKor Swiss © 2026 • Strategic Partner Pipeline
                </p>
            </motion.div>
        </div>
    );
};

export default AuthScreen;
