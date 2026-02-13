import React, { useMemo } from 'react';
import { Prospect, Canton } from '../types';
import { motion } from 'framer-motion';
import { Map as MapIcon, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SwissMapProps {
    leads: Prospect[];
    onCantonClick?: (canton: Canton) => void;
}

// Map SVG path data for Swiss cantons (Full Names used as keys for internal SVG logic)
const CANTON_MAP_DATA: Record<string, { code: Canton; path: string; cx: number; cy: number }> = {
    'Zürich': { code: Canton.ZH, path: 'M 380 180 L 420 170 L 440 190 L 430 220 L 390 210 Z', cx: 410, cy: 195 },
    'Berne': { code: Canton.BE, path: 'M 280 200 L 350 190 L 360 240 L 320 260 L 260 240 Z', cx: 310, cy: 225 },
    'Lucerne': { code: Canton.LU, path: 'M 360 210 L 390 200 L 400 230 L 370 240 Z', cx: 380, cy: 220 },
    'Uri': { code: Canton.UR, path: 'M 380 240 L 410 230 L 415 260 L 385 265 Z', cx: 398, cy: 248 },
    'Schwyz': { code: Canton.SZ, path: 'M 390 210 L 420 205 L 425 230 L 395 235 Z', cx: 408, cy: 220 },
    'Obwald': { code: Canton.OW, path: 'M 360 230 L 380 225 L 385 245 L 365 250 Z', cx: 373, cy: 238 },
    'Nidwald': { code: Canton.NW, path: 'M 380 225 L 395 220 L 400 240 L 385 245 Z', cx: 390, cy: 232 },
    'Glaris': { code: Canton.GL, path: 'M 420 200 L 445 195 L 450 220 L 425 225 Z', cx: 435, cy: 210 },
    'Zoug': { code: Canton.ZG, path: 'M 380 205 L 400 200 L 405 220 L 385 225 Z', cx: 393, cy: 212 },
    'Fribourg': { code: Canton.FR, path: 'M 240 230 L 280 220 L 290 250 L 250 260 Z', cx: 265, cy: 240 },
    'Soleure': { code: Canton.SO, path: 'M 300 180 L 340 175 L 345 200 L 305 205 Z', cx: 322, cy: 190 },
    'Bâle-Ville': { code: Canton.BS, path: 'M 280 140 L 295 135 L 300 155 L 285 160 Z', cx: 290, cy: 148 },
    'Bâle-Campagne': { code: Canton.BL, path: 'M 260 150 L 300 145 L 310 170 L 270 175 Z', cx: 285, cy: 160 },
    'Schaffhouse': { code: Canton.SH, path: 'M 400 130 L 440 125 L 445 150 L 405 155 Z', cx: 422, cy: 140 },
    'Appenzell Rhodes-Extérieures': { code: Canton.AR, path: 'M 460 175 L 480 170 L 485 190 L 465 195 Z', cx: 472, cy: 182 },
    'Appenzell Rhodes-Intérieures': { code: Canton.AI, path: 'M 465 180 L 480 176 L 483 193 L 468 197 Z', cx: 474, cy: 186 },
    'Saint-Gall': { code: Canton.SG, path: 'M 440 160 L 490 155 L 500 200 L 450 205 Z', cx: 470, cy: 180 },
    'Grisons': { code: Canton.GR, path: 'M 420 230 L 520 210 L 540 300 L 440 310 Z', cx: 480, cy: 262 },
    'Argovie': { code: Canton.AG, path: 'M 320 170 L 370 165 L 380 195 L 330 200 Z', cx: 350, cy: 182 },
    'Thurgovie': { code: Canton.TG, path: 'M 420 150 L 460 145 L 470 170 L 430 175 Z', cx: 445, cy: 160 },
    'Tessin': { code: Canton.TI, path: 'M 360 310 L 420 295 L 430 360 L 370 375 Z', cx: 395, cy: 335 },
    'Vaud': { code: Canton.VD, path: 'M 140 240 L 220 230 L 235 280 L 155 290 Z', cx: 187, cy: 260 },
    'Valais': { code: Canton.VS, path: 'M 220 260 L 340 250 L 350 310 L 230 320 Z', cx: 285, cy: 285 },
    'Neuchâtel': { code: Canton.NE, path: 'M 220 200 L 260 195 L 270 220 L 230 225 Z', cx: 245, cy: 210 },
    'Genève': { code: Canton.GE, path: 'M 100 280 L 130 275 L 135 300 L 105 305 Z', cx: 117, cy: 290 },
    'Jura': { code: Canton.JU, path: 'M 240 160 L 280 155 L 290 185 L 250 190 Z', cx: 265, cy: 172 }
};

interface CantonStat {
    count: number;
    hasExclusivity: boolean;
}

const SwissMap: React.FC<SwissMapProps> = ({ leads, onCantonClick }) => {
    // 1. Calculate stats by Canton
    const stats = useMemo(() => {
        const data: Record<string, CantonStat> = {};

        // Initialize all cantons
        Object.values(Canton).forEach(c => {
            data[c] = { count: 0, hasExclusivity: false };
        });

        // Fill with current leads
        leads.forEach(l => {
            const canton = l.canton;
            if (data[canton]) {
                data[canton].count += 1;
                if (l.interestExclusivity) data[canton].hasExclusivity = true;
            }
        });

        return data;
    }, [leads]);

    const maxCount = Math.max(...Object.values(stats).map(s => s.count), 1);

    const getStatusColor = (cantonCode: Canton, isHovered: boolean) => {
        const s = stats[cantonCode];
        if (!s || s.count === 0) return isHovered ? '#F5F5F3' : '#FFFFFF';

        if (s.hasExclusivity) return isHovered ? '#1A1A17' : '#2D2D29'; // Dark for Exclusive

        const intensity = s.count / maxCount;
        if (intensity >= 0.7) return isHovered ? '#A68F54' : '#C0A76A'; // Gold 600/500
        if (intensity >= 0.3) return isHovered ? '#C0A76A' : '#D4AF6A'; // Gold 500/400

        return isHovered ? '#D4AF6A' : '#E8E8E5'; // Light goldish vs neutral
    };

    const getStatusLabel = (cantonCode: Canton) => {
        const s = stats[cantonCode];
        if (!s || s.count === 0) return 'Libre';
        if (s.hasExclusivity) return 'Exclusif';
        if (s.count >= (maxCount * 0.7)) return 'Saturé';
        return 'Actif';
    };

    return (
        <div className="bg-white rounded-3xl border border-executive-neutral-200 p-10 shadow-sm animate-in fade-in duration-700">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <MapIcon size={16} className="text-executive-gold-500" />
                        <h2 className="text-sm font-bold text-executive-neutral-800 uppercase tracking-wider">Carte Stratégique des Territoires</h2>
                    </div>
                    <p className="text-executive-neutral-500 text-xs font-medium italic">Pilotage de la capilarité et des droits d'exclusivité Swiss Sàrl</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 bg-executive-neutral-50 px-6 py-3 rounded-2xl border border-executive-neutral-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-white border border-executive-neutral-200"></div>
                        <span className="text-[10px] font-bold text-executive-neutral-500 uppercase tracking-tight">Libre</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-executive-gold-600"></div>
                        <span className="text-[10px] font-bold text-executive-neutral-500 uppercase tracking-tight">Actif</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-executive-neutral-800"></div>
                        <span className="text-[10px] font-bold text-executive-neutral-500 uppercase tracking-tight">Exclusif</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 items-center">
                {/* Map SVG */}
                <div className="col-span-8 relative bg-executive-neutral-50 rounded-3xl p-6 border border-executive-neutral-100/50">
                    <svg viewBox="0 0 640 480" className="w-full h-auto drop-shadow-2xl">
                        {Object.entries(CANTON_MAP_DATA).map(([name, data]) => {
                            const cantonStats = stats[data.code];
                            const color = getStatusColor(data.code, false);

                            return (
                                <g key={data.code} className="group">
                                    <motion.path
                                        d={data.path}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="cursor-pointer transition-all duration-300 hover:z-10"
                                        stroke="#D1D1CC"
                                        strokeWidth="1"
                                        fill={color}
                                        whileHover={{ scale: 1.02, stroke: '#C0A76A', strokeWidth: 2 }}
                                        onClick={() => onCantonClick?.(data.code)}
                                    />
                                    {cantonStats.count > 0 && (
                                        <text
                                            x={data.cx}
                                            y={data.cy}
                                            textAnchor="middle"
                                            className={`text-[9px] font-black pointer-events-none select-none ${cantonStats.hasExclusivity ? 'fill-executive-gold-500' : 'fill-executive-neutral-800'
                                                }`}
                                        >
                                            {cantonStats.count}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Side Stats */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-executive-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 size={18} className="text-status-success" />
                            <h3 className="text-xs font-bold text-executive-neutral-800 uppercase tracking-tight">Couverture Actuelle</h3>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-bold text-executive-neutral-800">
                                {Object.values(stats).filter(s => s.count > 0).length}
                            </p>
                            <p className="text-executive-neutral-400 text-sm font-medium mb-1">/ 26 Cantons</p>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-executive-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-status-success transition-all duration-1000"
                                style={{ width: `${(Object.values(stats).filter(s => s.count > 0).length / 26) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-executive-neutral-800 p-6 rounded-3xl text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-executive-gold-500">
                            <ShieldCheck size={18} />
                            <h3 className="text-xs font-bold uppercase tracking-tight">Zones Exclusives</h3>
                        </div>
                        <p className="text-4xl font-bold">
                            {Object.values(stats).filter(s => s.hasExclusivity).length}
                        </p>
                        <p className="text-executive-neutral-400 text-[10px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                            Contrats Premium Actifs avec protection territoriale
                        </p>
                    </div>

                    <div className="bg-status-warning/5 p-6 rounded-3xl border border-status-warning/20">
                        <div className="flex items-center gap-2 mb-2 text-status-warning">
                            <AlertTriangle size={16} />
                            <h3 className="text-[10px] font-bold uppercase">Opportunités</h3>
                        </div>
                        <p className="text-xs text-executive-neutral-600 font-medium leading-relaxed">
                            Le canton de <span className="font-bold text-executive-neutral-800">Vaud</span> présente un potentiel de <span className="text-status-success font-bold">CHF 120k</span> non encore exploité.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwissMap;
