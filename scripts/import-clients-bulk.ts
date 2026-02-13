import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const OWNER_ID = '07271439-3adc-45e8-9fa9-44fe89f52958'; // Jorge Torres

const prospects = [
    // 1. Centros de Formación
    {
        company_name: 'Kosmetik + Podologie Dort GmbH',
        canton: 'AG',
        address_street: 'Landstrasse 81',
        address_city: 'Wettingen',
        address_postal_code: '5430',
        contact_email: 'info@kosmetik-dort.ch',
        company_website: 'www.kosmetik-dort.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Centro de formación y grandes institutos (Lehrbetriebe). Alto valor.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Madame Beauty Institut',
        canton: 'BE',
        address_street: 'Spitalgasse 36',
        address_city: 'Berna',
        address_postal_code: '3011',
        contact_first_name: 'Justina',
        contact_last_name: 'Bühler',
        contact_phone: '079 153 32 15',
        contact_email: 'madame@beauty-institut.ch',
        company_website: 'www.beauty-institut.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Especialistas en Microneedling/Peelings. Justina busca activamente innovación (usa NOON). PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Beauty By Anna Schwarz',
        canton: 'ZH',
        address_street: 'Wehntalerstrasse 600',
        address_city: 'Zúrich',
        address_postal_code: '8046',
        contact_phone: '+41 76 443 97 65',
        contact_email: 'info@beautyanna.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Aesthetic Art GmbH',
        canton: 'ZH',
        address_street: 'Seefeldstrasse 128',
        address_city: 'Zúrich',
        address_postal_code: '8008',
        contact_email: 'info@aestheticart.ch',
        company_website: 'www.aestheticart.ch',
        company_type: 'clinique',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Kosmetikinstitut Puderdose',
        canton: 'ZH',
        address_street: 'Landstrasse 32',
        address_city: 'Andelfingen',
        address_postal_code: '8450',
        contact_email: 'info@kosmetik-puderdose.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Bellezza Babor Beauty Spa',
        canton: 'BE',
        address_street: 'Spitalgasse 4',
        address_city: 'Berna',
        address_postal_code: '3011',
        contact_email: 'empfang@kosmetik-bellezza.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Schoenzeit GmbH',
        canton: 'BE',
        address_street: 'Bahnhofstrasse 14',
        address_city: 'Burgdorf',
        address_postal_code: '3400',
        contact_email: 'spa@schoenzeit.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'NW Beauty Zürich GmbH',
        canton: 'ZH',
        address_street: 'Löwenstrasse 1',
        address_city: 'Zúrich',
        address_postal_code: '8001',
        contact_email: 'zürich@nwbeauty.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },

    // 2. Romandie (GE, VD, VS)
    {
        company_name: 'Nova Beauty',
        canton: 'GE',
        address_street: 'Rue Cornavin 11',
        address_city: 'Ginebra',
        address_postal_code: '1201',
        contact_phone: '+41 79 780 66 26',
        contact_email: 'novabeauty@icloud.com',
        company_type: 'institut',
        source: 'web',
        strategic_notes: 'Muy activos en faciales y microneedling. Enfoque en resultados visibles. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Leman Aesthetic Clinic',
        canton: 'GE',
        address_street: 'Place des Eaux-Vives 6',
        address_city: 'Ginebra',
        address_postal_code: '1207',
        contact_first_name: 'Dr. Daniel',
        contact_last_name: 'Espinoza',
        contact_phone: '+41 22 346 59 56',
        contact_email: 'info@leman-clinic.ch',
        company_website: 'www.leman-clinic.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Fundado por Dr. Espinoza y Dr. Haselbach. Sección estética médica.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Geneva Aesthetic Clinic',
        canton: 'GE',
        address_street: 'Rue de la Rôtisserie 1',
        address_city: 'Ginebra',
        address_postal_code: '1204',
        contact_first_name: 'Sanda',
        contact_last_name: 'Carini',
        contact_phone: '+41 22 310 45 64',
        contact_email: 'contact@genevacc.ch',
        company_type: 'clinique',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Aesthetic Medicine',
        canton: 'GE',
        address_street: 'Avenue de Beau-Séjour 23',
        address_city: 'Ginebra',
        address_postal_code: '1206',
        contact_first_name: 'Dr. Nasser',
        contact_last_name: 'Madi',
        contact_phone: '+41 22 830 00 45',
        contact_email: 'info@aesthetic-medicine.ch',
        company_type: 'clinique',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Entourage Aesthetic Clinic',
        canton: 'VD',
        address_street: 'Avenue de la Gare 39',
        address_city: 'Lausana',
        address_postal_code: '1003',
        contact_first_name: 'Dr. Francesco',
        contact_last_name: 'de Boccard',
        contact_email: 'f.deboccard@entourage.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Email secundario: m.cerrano@entourage.ch',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Clinique Matignon',
        canton: 'VD',
        address_street: 'Chemin de Beau-Rivage 18',
        address_city: 'Lausana',
        address_postal_code: '1006',
        contact_first_name: 'Dra. Véronique',
        contact_last_name: 'Bani',
        contact_email: 'veronique.bani@me.com',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Cadena importante de medicina estética. También Dra. Sophie Pierre.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: "Institut N'joy",
        canton: 'VD',
        address_street: 'Rue De Fribourg 28',
        address_city: 'Vevey',
        address_postal_code: '1800',
        company_type: 'institut',
        source: 'web',
        strategic_notes: 'Especializados en estética médica no invasiva.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'AquarElle',
        canton: 'VS',
        address_street: "Route d'Italie 152",
        address_city: 'Uvrier',
        address_postal_code: '1958',
        contact_first_name: 'Magali',
        contact_last_name: 'Lathion Mayor',
        contact_phone: '078 760 01 84',
        contact_email: 'aquarelle@bluemail.ch',
        company_type: 'institut',
        source: 'web',
        strategic_notes: 'Buscan productos naturales y bio. También contacto Mégane Beytrison (megane.beytrison@gmail.com).',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Institut de Beauté Aude',
        canton: 'VS',
        address_street: 'Avenue du Midi 8',
        address_city: 'Sion',
        address_postal_code: '1950',
        company_type: 'institut',
        source: 'web',
        strategic_notes: 'Enfoque en tratamientos faciales y corporales avanzados.',
        pipeline_stage: 'nouveau'
    },

    // 3. Escuelas y Asociaciones (VIP)
    {
        company_name: 'SFK (Asociación Suiza de Cosmética)',
        canton: 'AG',
        address_street: 'Bernstrasse-West 64',
        address_city: 'Suhr',
        address_postal_code: '5034',
        contact_first_name: 'Nicole',
        contact_last_name: 'Schmid',
        contact_email: 'nicole.schmid@sfkinfo.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'CONTACTO VIP. Puerta de entrada masiva. Formación: Frank Wagner (frank.wagner@sfkinfo.ch).',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'ASE-CFC (Asociación de Esteticistas)',
        canton: 'VD',
        address_city: 'La Tour-de-Peilz',
        address_postal_code: '1814',
        contact_first_name: 'Diane',
        contact_last_name: 'Bryois',
        contact_phone: '079 874 55 26',
        contact_email: 'info.asecfc@gmail.com',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'CONTACTO VIP. Secretaría.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Laserschule Schweiz',
        canton: 'BS',
        address_street: 'Leimgrubenweg 9',
        address_city: 'Basilea',
        address_postal_code: '4053',
        contact_email: 'info@laserschule.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Escuela de Láser y Estética.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Elégance Studio Esthétique',
        canton: 'VD',
        address_street: 'Av. de la Poste 16',
        address_city: 'Renens',
        address_postal_code: '1020',
        contact_email: 'info@elegance-boutique.ch',
        company_type: 'clinique',
        source: 'web',
        strategic_notes: 'Academia.',
        pipeline_stage: 'nouveau'
    },

    // 4. Expertos Cantonales
    {
        company_name: 'Marion Siegenthaler (Experta ZH)',
        canton: 'ZH',
        contact_first_name: 'Marion',
        contact_last_name: 'Siegenthaler',
        contact_email: 'masiegi@gmail.com',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. Si ella usa la marca, otros la siguen. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Marie-Pomme Pauchard (Experta GE)',
        canton: 'GE',
        contact_first_name: 'Marie-Pomme',
        contact_last_name: 'Pauchard',
        contact_email: 'cheffe.expert.asa@gmail.com',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Katya Gubbiotti (Experta VD)',
        canton: 'VD',
        contact_first_name: 'Katya',
        contact_last_name: 'Gubbiotti',
        contact_email: 'katyagubbiotti@gmail.com',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Laurence Rapillard (Experta VS)',
        canton: 'VS',
        contact_first_name: 'Laurence',
        contact_last_name: 'Rapillard',
        contact_email: 'laurence.rapillard@bluewin.ch',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Susan Bielmann (Experta FR)',
        canton: 'FR',
        contact_first_name: 'Susan',
        contact_last_name: 'Bielmann',
        contact_email: 's.bielmann@ortrafr.ch',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Prisca Bernauer (Experta BS)',
        canton: 'BS',
        contact_first_name: 'Prisca',
        contact_last_name: 'Bernauer',
        contact_email: 'bernauer.prisca@gmail.com',
        company_type: 'independant',
        source: 'web',
        strategic_notes: 'Líder de opinión. PRIORIDAD ALTA.',
        pipeline_stage: 'nouveau'
    },

    // 5. Eastern Switzerland & Basel
    {
        company_name: 'Bodyzone Cosmetics & Spa',
        canton: 'BS',
        address_street: 'Freie Strasse 103',
        address_city: 'Basilea',
        address_postal_code: '4001',
        contact_email: 'info@bodyzone.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Cosmetics for Beauty',
        canton: 'BS',
        address_street: 'Güterstrasse 144',
        address_city: 'Basilea',
        address_postal_code: '4053',
        contact_first_name: 'Elke',
        contact_last_name: 'Stähle',
        company_website: 'www.cosmetics-for-beauty.ch',
        company_type: 'institut',
        source: 'web',
        strategic_notes: 'Contacto vía formulario web recomendado.',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'ANGEL beauty lounge',
        canton: 'SG',
        address_street: 'Churfirstenstrasse 54',
        address_city: 'Wil',
        address_postal_code: '9500',
        contact_email: 'info@angelbeautylounge.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Beauty & Body Praxis',
        canton: 'SH',
        address_street: 'Vorstadt 12',
        address_city: 'Schaffhausen',
        address_postal_code: '8200',
        contact_email: 'info@beautybody.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    },
    {
        company_name: 'Nives Cosmetics',
        canton: 'SH',
        address_street: 'Schlatterstrasse 23',
        address_city: 'Thayngen',
        address_postal_code: '8240',
        contact_email: 'nives@nives-cosmetic.ch',
        company_type: 'institut',
        source: 'web',
        pipeline_stage: 'nouveau'
    }
];

async function importProspects() {
    console.log(`🚀 Starting import of ${prospects.length} prospects...`);

    // Transform data to match DatabaseProspect and inject owner_id
    const dataToInsert = prospects.map(p => ({
        ...p,
        contact_first_name: p.contact_first_name || '',
        contact_last_name: p.contact_last_name || '',
        contact_email: p.contact_email || '',
        contact_phone: p.contact_phone || '',
        owner_id: OWNER_ID,
        assigned_to_id: OWNER_ID,
        potential_monthly: 'moins_5k', // Default for now
        interest_academy: false,
        interest_exclusivity: false,
        lead_score: 0,
        is_premium_candidate: false,
        probability_close: 0,
        is_closed: false,
        objections: []
    }));

    const { data, error } = await supabase
        .from('prospects')
        .insert(dataToInsert)
        .select();

    if (error) {
        console.error('❌ Error during import:', error);
        return;
    }

    console.log(`✅ Successfully imported ${data.length} prospects!`);
}

importProspects();
