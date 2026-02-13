import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const prospects = [
    // Suiza Alemana
    {
        company_name: 'Kosmetik + Podologie Dort GmbH',
        company_website: 'www.kosmetik-dort.ch',
        company_type: 'INSTITUT',
        address_street: 'Landstrasse 81',
        address_city: 'Wettingen',
        address_postal_code: '5430',
        canton: 'AG',
        contact_email: 'info@kosmetik-dort.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Madame Beauty Institut',
        company_type: 'INSTITUT',
        address_street: 'Spitalgasse 36',
        address_city: 'Berna',
        address_postal_code: '3011',
        canton: 'BE',
        contact_first_name: 'Justina',
        contact_last_name: 'Bühler',
        contact_email: 'madame@beauty-institut.ch',
        contact_phone: '079 153 32 15',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Beauty By Anna Schwarz',
        company_type: 'INSTITUT',
        address_street: 'Wehntalerstrasse 600',
        address_city: 'Zúrich',
        address_postal_code: '8046',
        canton: 'ZH',
        contact_email: 'info@beautyanna.ch',
        contact_phone: '+41 76 443 97 65',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Aesthetic Art GmbH',
        company_website: 'www.aestheticart.ch',
        company_type: 'INSTITUT',
        address_street: 'Seefeldstrasse 128',
        address_city: 'Zúrich',
        address_postal_code: '8008',
        canton: 'ZH',
        contact_email: 'info@aestheticart.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Kosmetikinstitut Puderdose',
        company_type: 'INSTITUT',
        address_street: 'Landstrasse 32',
        address_city: 'Andelfingen',
        address_postal_code: '8450',
        canton: 'ZH',
        contact_email: 'info@kosmetik-puderdose.ch',
        source: 'PROSPECTION',
        potential_monthly: 'MOINS_5K',
    },
    {
        company_name: 'Bellezza Babor Beauty Spa',
        company_type: 'INSTITUT',
        address_street: 'Spitalgasse 4',
        address_city: 'Berna',
        address_postal_code: '3011',
        canton: 'BE',
        contact_email: 'empfang@kosmetik-bellezza.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Schoenzeit GmbH',
        company_type: 'INSTITUT',
        address_street: 'Bahnhofstrasse 14',
        address_city: 'Burgdorf',
        address_postal_code: '3400',
        canton: 'BE',
        contact_email: 'spa@schoenzeit.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'NW Beauty Zürich GmbH',
        company_type: 'INSTITUT',
        address_street: 'Löwenstrasse 1',
        address_city: 'Zúrich',
        address_postal_code: '8001',
        canton: 'ZH',
        contact_email: 'zürich@nwbeauty.ch',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },

    // Ginebra
    {
        company_name: 'Nova Beauty',
        company_type: 'INSTITUT',
        address_street: 'Rue Cornavin 11',
        address_city: 'Ginebra',
        address_postal_code: '1201',
        canton: 'GE',
        contact_email: 'novabeauty@icloud.com',
        contact_phone: '+41 79 780 66 26',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Leman Aesthetic Clinic',
        company_type: 'CLINIQUE',
        address_street: 'Place des Eaux-Vives 6',
        address_city: 'Ginebra',
        address_postal_code: '1207',
        canton: 'GE',
        contact_email: 'info@leman-clinic.ch',
        contact_phone: '+41 22 346 59 56',
        source: 'PROSPECTION',
        potential_monthly: 'QUINZE_25K',
    },
    {
        company_name: 'Geneva Aesthetic Clinic',
        company_type: 'CLINIQUE',
        address_street: 'Rue de la Rôtisserie 1',
        address_city: 'Ginebra',
        address_postal_code: '1204',
        canton: 'GE',
        contact_first_name: 'Sanda',
        contact_last_name: 'Carini',
        contact_email: 'contact@genevacc.ch',
        contact_phone: '+41 22 310 45 64',
        source: 'PROSPECTION',
        potential_monthly: 'QUINZE_25K',
    },
    {
        company_name: 'Aesthetic Medicine',
        company_type: 'CLINIQUE',
        address_street: 'Avenue de Beau-Séjour 23',
        address_city: 'Ginebra',
        address_postal_code: '1206',
        canton: 'GE',
        contact_first_name: 'Nasser',
        contact_last_name: 'Madi',
        contact_email: 'info@aesthetic-medicine.ch',
        contact_phone: '+41 22 830 00 45',
        source: 'PROSPECTION',
        potential_monthly: 'QUINZE_25K',
    },

    // Vaud
    {
        company_name: 'Entourage Aesthetic Clinic',
        company_type: 'CLINIQUE',
        address_street: 'Avenue de la Gare 39',
        address_city: 'Lausana',
        address_postal_code: '1003',
        canton: 'VD',
        contact_first_name: 'Francesco',
        contact_last_name: 'de Boccard',
        contact_email: 'f.deboccard@entourage.ch',
        source: 'PROSPECTION',
        potential_monthly: 'QUINZE_25K',
    },
    {
        company_name: 'Clinique Matignon',
        company_type: 'CLINIQUE',
        address_street: 'Chemin de Beau-Rivage 18',
        address_city: 'Lausana',
        address_postal_code: '1006',
        canton: 'VD',
        contact_first_name: 'Véronique',
        contact_last_name: 'Bani',
        contact_email: 'veronique.bani@me.com',
        source: 'PROSPECTION',
        potential_monthly: 'VINGT_CINQ_50K',
    },
    {
        company_name: "Institut N'joy",
        company_type: 'INSTITUT',
        address_street: 'Rue De Fribourg 28',
        address_city: 'Vevey',
        address_postal_code: '1800',
        canton: 'VD',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },

    // Valais
    {
        company_name: 'AquarElle - Atelier de beauté & boutique',
        company_type: 'INSTITUT',
        address_street: "Route d'Italie 152",
        address_city: 'Uvrier',
        address_postal_code: '1958',
        canton: 'VS',
        contact_first_name: 'Magali',
        contact_last_name: 'Lathion Mayor',
        contact_email: 'aquarelle@bluemail.ch',
        contact_phone: '078 760 01 84',
        source: 'PROSPECTION',
        potential_monthly: 'MOINS_5K',
    },
    {
        company_name: 'Institut de Beauté Aude',
        company_type: 'INSTITUT',
        address_street: 'Avenue du Midi 8',
        address_city: 'Sion',
        address_postal_code: '1950',
        canton: 'VS',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },

    // Escuelas y Asociaciones
    {
        company_name: 'SFK (Asociación Suiza de Cosmética)',
        company_type: 'ECOLE',
        address_street: 'Bernstrasse-West 64',
        address_city: 'Suhr',
        address_postal_code: '5034',
        canton: 'AG',
        contact_first_name: 'Nicole',
        contact_last_name: 'Schmid',
        contact_email: 'nicole.schmid@sfkinfo.ch',
        source: 'PROSPECTION',
        potential_monthly: 'VINGT_CINQ_50K',
        interest_academy: true,
    },
    {
        company_name: 'ASE-CFC (Asociación de Esteticistas)',
        company_type: 'ECOLE',
        address_street: 'CP 226',
        address_city: 'La Tour-de-Peilz',
        address_postal_code: '1814',
        canton: 'VD',
        contact_first_name: 'Diane',
        contact_last_name: 'Bryois',
        contact_email: 'info.asecfc@gmail.com',
        contact_phone: '079 874 55 26',
        source: 'PROSPECTION',
        potential_monthly: 'VINGT_CINQ_50K',
        interest_academy: true,
    },
    {
        company_name: 'Laserschule Schweiz',
        company_type: 'ECOLE',
        address_street: 'Leimgrubenweg 9',
        address_city: 'Basilea',
        address_postal_code: '4053',
        canton: 'BS',
        contact_email: 'info@laserschule.ch',
        source: 'PROSPECTION',
        potential_monthly: 'VINGT_CINQ_50K',
        interest_academy: true,
    },
    {
        company_name: 'Elégance Studio Esthétique',
        company_type: 'ECOLE',
        address_street: 'Av. de la Poste 16',
        address_city: 'Renens',
        address_postal_code: '1020',
        canton: 'VD',
        contact_email: 'info@elegance-boutique.ch',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
        interest_academy: true,
    },

    // Expertos Cantonales
    {
        company_name: 'Marion Siegenthaler - Experta Cantonal Zúrich',
        company_type: 'INSTITUT',
        canton: 'ZH',
        contact_first_name: 'Marion',
        contact_last_name: 'Siegenthaler',
        contact_email: 'masiegi@gmail.com',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Marie-Pomme Pauchard - Experta Cantonal Ginebra',
        company_type: 'INSTITUT',
        canton: 'GE',
        contact_first_name: 'Marie-Pomme',
        contact_last_name: 'Pauchard',
        contact_email: 'cheffe.expert.asa@gmail.com',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Katya Gubbiotti - Experta Cantonal Vaud',
        company_type: 'INSTITUT',
        canton: 'VD',
        contact_first_name: 'Katya',
        contact_last_name: 'Gubbiotti',
        contact_email: 'katyagubbiotti@gmail.com',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Laurence Rapillard - Experta Cantonal Valais',
        company_type: 'INSTITUT',
        canton: 'VS',
        contact_first_name: 'Laurence',
        contact_last_name: 'Rapillard',
        contact_email: 'laurence.rapillard@bluewin.ch',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Susan Bielmann - Experta Cantonal Friburgo',
        company_type: 'INSTITUT',
        canton: 'FR',
        contact_first_name: 'Susan',
        contact_last_name: 'Bielmann',
        contact_email: 's.bielmann@ortrafr.ch',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Prisca Bernauer - Experta Cantonal Basilea',
        company_type: 'INSTITUT',
        canton: 'BS',
        contact_first_name: 'Prisca',
        contact_last_name: 'Bernauer',
        contact_email: 'bernauer.prisca@gmail.com',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },

    // Basilea y Suiza Oriental
    {
        company_name: 'Bodyzone Cosmetics & Spa',
        company_type: 'INSTITUT',
        address_street: 'Freie Strasse 103',
        address_city: 'Basilea',
        address_postal_code: '4001',
        canton: 'BS',
        contact_email: 'info@bodyzone.ch',
        source: 'PROSPECTION',
        potential_monthly: 'DIX_15K',
    },
    {
        company_name: 'Cosmetics for Beauty',
        company_website: 'www.cosmetics-for-beauty.ch',
        company_type: 'INSTITUT',
        address_street: 'Güterstrasse 144',
        address_city: 'Basilea',
        address_postal_code: '4053',
        canton: 'BS',
        contact_first_name: 'Elke',
        contact_last_name: 'Stähle',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'ANGEL beauty lounge',
        company_type: 'INSTITUT',
        address_street: 'Churfirstenstrasse 54',
        address_city: 'Wil',
        address_postal_code: '9500',
        canton: 'SG',
        contact_email: 'info@angelbeautylounge.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Beauty & Body Praxis',
        company_type: 'INSTITUT',
        address_street: 'Vorstadt 12',
        address_city: 'Schaffhausen',
        address_postal_code: '8200',
        canton: 'SH',
        contact_email: 'info@beautybody.ch',
        source: 'PROSPECTION',
        potential_monthly: 'CINQ_10K',
    },
    {
        company_name: 'Nives Cosmetics',
        company_type: 'INSTITUT',
        address_street: 'Schlatterstrasse 23',
        address_city: 'Thayngen',
        address_postal_code: '8240',
        canton: 'SH',
        contact_email: 'nives@nives-cosmetic.ch',
        source: 'PROSPECTION',
        potential_monthly: 'MOINS_5K',
    },
];

const mapPotential = (p: string): string => {
    const map: Record<string, string> = {
        'MOINS_5K': 'moins_5k',
        'CINQ_10K': '5k_10k',
        'DIX_15K': '10k_15k',
        'QUINZE_25K': '15k_25k',
        'VINGT_CINQ_50K': '25k_40k',
    };
    return map[p] || 'moins_5k';
};

const mapSource = (s: string): string => {
    const map: Record<string, string> = {
        'PROSPECTION': 'autre',
        'WEB': 'web',
    };
    return map[s] || 'autre';
};

const mapCompanyType = (t: string): string => {
    const map: Record<string, string> = {
        'INSTITUT': 'institut',
        'CLINIQUE': 'clinique',
        'ECOLE': 'institut',
    };
    return map[t] || 'institut';
};

async function importProspects() {
    console.log(`🚀 Starting import of ${prospects.length} prospects...`);

    // Get a director user to assign to, otherwise use null
    const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'director')
        .limit(1);

    const directorId = users?.[0]?.id || null;

    const mappedProspects = prospects.map(p => ({
        company_name: p.company_name,
        company_website: p.company_website || null,
        company_type: mapCompanyType(p.company_type),
        address_street: p.address_street || null,
        address_city: p.address_city || null,
        address_postal_code: p.address_postal_code || null,
        canton: p.canton,
        contact_email: p.contact_email || 'contact@example.ch',
        contact_first_name: p.contact_first_name || '',
        contact_last_name: p.contact_last_name || '',
        contact_phone: p.contact_phone || '',
        source: mapSource(p.source),
        potential_monthly: mapPotential(p.potential_monthly),
        interest_academy: p.interest_academy || false,
        interest_exclusivity: false,
        pipeline_stage: 'nouveau',
        is_closed: false,
        lead_score: 0,
        probability_close: 0,
        is_premium_candidate: p.potential_monthly === 'VINGT_CINQ_50K' || p.company_type === 'CLINIQUE',
        assigned_to_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        objections: []
    }));

    const { data, error } = await supabase
        .from('prospects')
        .insert(mappedProspects)
        .select();

    if (error) {
        console.error('❌ Error inserting prospects:', error);
        return;
    }

    console.log(`✅ ${data.length} prospects imported successfully!`);
}

importProspects();
