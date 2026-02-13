import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageSquare, Check, CheckCheck, Clock } from 'lucide-react';
import { messagingService, InternalMessage } from '../services/messagingService';
import { useAuth } from './AuthProvider';
import { supabase } from '../utils/supabase';

interface MessagingPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Contact {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<InternalMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedContact) {
            loadMessages();
            markAsRead();
        }
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time subscription
    useEffect(() => {
        const subscription = supabase
            .channel('public:internal_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'internal_messages'
            }, payload => {
                const msg = payload.new as InternalMessage;
                // If the message is for the current open conversation
                if (selectedContact && (
                    (msg.sender_id === selectedContact.id && msg.recipient_id === user?.id) ||
                    (msg.sender_id === user?.id && msg.recipient_id === selectedContact.id)
                )) {
                    // Avoid duplicates if optimistic update already added it
                    setMessages(prev => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });

                    if (msg.recipient_id === user?.id) {
                        messagingService.markAsRead(msg.sender_id);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [selectedContact, user]);

    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user?.id);

        if (!error && data) {
            setContacts(data);
        }
    };

    const loadMessages = async () => {
        if (!selectedContact) return;
        setLoading(true);
        try {
            const msgs = await messagingService.fetchMessages(selectedContact.id);
            setMessages(msgs);
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        if (!selectedContact) return;
        await messagingService.markAsRead(selectedContact.id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        const content = newMessage.trim();
        setNewMessage(''); // Clear immediately for better UX
        setSending(true);

        try {
            const sentMsg = await messagingService.sendMessage(selectedContact.id, content);

            // Optimistic update: Add message to list immediately
            setMessages(prev => {
                if (prev.find(m => m.id === sentMsg.id)) return prev;
                return [...prev, sentMsg];
            });
        } catch (err) {
            console.error('Error sending message:', err);
            setNewMessage(content); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1115] border-l border-[#2D323B] z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#2D323B] flex items-center justify-between bg-[#161920]">
                            <div className="flex items-center gap-3">
                                {selectedContact ? (
                                    <button
                                        onClick={() => setSelectedContact(null)}
                                        className="p-2 hover:bg-[#2D323B] rounded-lg transition-colors text-[#9E9E96]"
                                    >
                                        <X size={20} />
                                    </button>
                                ) : (
                                    <MessageSquare className="text-[#D4AF37]" size={24} />
                                )}
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">
                                        {selectedContact ? selectedContact.full_name : 'Messages Internes'}
                                    </h2>
                                    <p className="text-[#9E9E96] text-xs font-bold uppercase tracking-widest mt-0.5">
                                        {selectedContact ? selectedContact.role : 'Collaboration en temps réel'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[#2D323B] rounded-xl transition-colors text-[#9E9E96]">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {!selectedContact ? (
                                /* Contacts List */
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {contacts.map(contact => (
                                        <button
                                            key={contact.id}
                                            onClick={() => setSelectedContact(contact)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#161920] border border-[#2D323B] hover:border-[#D4AF37]/50 hover:bg-[#1C1F26] transition-all group text-left"
                                        >
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-105 transition-transform">
                                                <User className="text-[#D4AF37]" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{contact.full_name}</h3>
                                                <p className="text-xs text-[#6B6B63] font-bold uppercase tracking-wider">{contact.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* Chat View */
                                <>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Clock className="animate-spin text-[#D4AF37]" size={32} />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-[#6B6B63] space-y-4">
                                                <MessageSquare size={48} className="opacity-20" />
                                                <p className="text-sm font-bold">Aucun message. Commencez la discussion !</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${msg.sender_id === user?.id
                                                        ? 'bg-[#D4AF37] text-[#1C1F26] rounded-tr-none'
                                                        : 'bg-[#1C1F26] text-white border border-[#2D323B] rounded-tl-none'
                                                        }`}>
                                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                        <div className={`flex items-center gap-1.5 mt-2 ${msg.sender_id === user?.id ? 'text-[#1C1F26]/60' : 'text-[#6B6B63]'
                                                            }`}>
                                                            <span className="text-[10px] font-bold">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {msg.sender_id === user?.id && (
                                                                msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-6 bg-[#161920] border-t border-[#2D323B]">
                                        <form onSubmit={handleSendMessage} className="relative">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Écrivez votre message..."
                                                className="w-full bg-[#0F1115] border border-[#2D323B] text-white rounded-2xl px-6 py-4 pr-14 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all placeholder-[#6B6B63]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || sending}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#D4AF37] text-[#1C1F26] rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                            >
                                                <Send size={18} strokeWidth={3} />
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MessagingPanel;
