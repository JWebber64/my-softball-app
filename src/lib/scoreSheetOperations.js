import { supabase } from './supabaseClient';

export const scoreSheetOperations = {
  async createScoreSheet(parsedData) {
    const { data, error } = await supabase
      .from('score_sheets')
      .insert([{
        ...parsedData.gameInfo,
        innings: parsedData.innings,
        lineup: parsedData.players,
        substitutions: [],
        final_score: parsedData.finalScore,
      }])
      .select();

    if (error) throw error;
    return data;
  },

  async getScoreSheet(id) {
    const { data, error } = await supabase
      .from('score_sheets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllScoreSheets() {
    const { data, error } = await supabase
      .from('score_sheets')
      .select('*')
      .order('game_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateScoreSheet(id, updates) {
    const { data, error } = await supabase
      .from('score_sheets')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  calculateFinalScore(innings) {
    return innings.reduce((sum, inning) => sum + (inning.runs || 0), 0);
  }
};
