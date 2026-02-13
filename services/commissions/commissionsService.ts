import { supabase } from '../../utils/supabase';
import { CommissionRule } from './types';

export const commissionsService = {
  async getRule(month: number, year: number) {
    const { data, error } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CommissionRule | null;
  },

  async saveRule(rule: Partial<CommissionRule>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const ruleData = {
      ...rule,
      created_by: user.id, // Ensure created_by is set
      updated_at: new Date().toISOString()
    };

    if (rule.id) {
      // Update
      const { data, error } = await supabase
        .from('commission_rules')
        .update(ruleData)
        .eq('id', rule.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('commission_rules')
        .insert([ruleData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async duplicateRuleToNextMonth(currentRule: CommissionRule) {
    const nextMonth = currentRule.month === 12 ? 1 : currentRule.month + 1;
    const nextYear = currentRule.month === 12 ? currentRule.year + 1 : currentRule.year;
    
    // Check if rule already exists
    const existing = await this.getRule(nextMonth, nextYear);
    if (existing) {
      throw new Error(`Une règle existe déjà pour ${nextMonth}/${nextYear}`);
    }

    const { id, created_at, updated_at, ...rest } = currentRule;
    
    return this.saveRule({
      ...rest,
      month: nextMonth,
      year: nextYear
    });
  }
};
