import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lead } from '../types';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a personalized sales strategy for a lead using Gemini AI
 */
export const generateSalesStrategy = async (lead: Lead): Promise<string> => {
    if (!API_KEY) {
        throw new Error('API key not configured. Please add VITE_GEMINI_API_KEY to .env.local');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Eres un consultor experto en ventas para DermaKor Swiss, una marca premium de estética médica especializada en tratamientos PDRN y protocolos avanzados de rejuvenecimiento.

Analiza este lead potencial y genera una estrategia de venta personalizada y accionable:

**INFORMACIÓN DEL LEAD:**
- Nombre: ${lead.name || 'Centro no identificado'}
- Persona de contacto: ${lead.contactPerson || 'No especificado'}
- Cantón: ${lead.canton}
- Tipo de estructura: ${lead.structure}
- Nivel de madurez: ${lead.maturity}
- Potencial mensual: CHF ${lead.monthlyPotential.toLocaleString()}
- Interés declarado: ${lead.declaredInterest}
- Etapa actual: ${lead.stage}
- Exclusividad territorial: ${lead.territorialExclusivity ? 'Sí' : 'No'}
- Capacidad de inversión inicial: CHF ${lead.initialInvestmentCapacity.toLocaleString()}
- Nivel de urgencia: ${lead.urgency}/5
- Sensibilidad al precio: ${lead.priceSensitivity}/5
- Interés en Academy: ${lead.academyInterest ? 'Sí' : 'No'}
- Fuente: ${lead.source}
- Notas: ${lead.notes || 'Sin notas adicionales'}

**TU TAREA:**
Genera una estrategia de venta concreta y profesional que incluya:

1. **Análisis del Perfil**: Evalúa las fortalezas y debilidades de este lead
2. **Propuesta de Valor Adaptada**: Qué aspectos de DermaKor resonarán más con este partner
3. **Argumentos Clave**: 3-4 puntos específicos para usar en la conversación
4. **Objeciones Anticipadas**: Posibles resistencias y cómo abordarlas
5. **Próximos Pasos**: Acciones concretas recomendadas
6. **Estructura de Oferta Sugerida**: Qué productos/servicios priorizar

**CONTEXTO SUIZO:**
- Alta sensibilidad a calidad y exclusividad
- Mercado premium con márgenes protegidos
- Competencia con marcas italianas y suizas establecidas
- Regulación estricta de productos médicos

Sé específico, profesional y accionable. Usa un tono consultivo y orientado a resultados.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating sales strategy:', error);
        throw new Error(`Failed to generate strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
