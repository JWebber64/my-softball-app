import { supabase } from './supabaseClient';

export const scoreSheetOperations = {
  async createScoreSheet(parsedData, teamId) {
    if (!teamId) {
      throw new Error('Team ID is required to create a score sheet');
    }

    // No need to check roles manually - RLS policies will handle it
    const { data, error } = await supabase
      .from('score_sheets')
      .insert([
        {
          team_id: teamId,
          ...parsedData
        }
      ]);

    if (error) {
      throw new Error('Not authorized to create score sheets for this team');
    }

    return data;
  },

  async uploadScoreSheetImage(file, scoreSheetId) {
    const fileName = `${scoreSheetId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.SCORESHEETS)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: updateData, error: updateError } = await supabase
      .from('score_sheets')
      .update({ 
        original_image_url: uploadData.path,
        processing_status: 'pending'
      })
      .eq('id', scoreSheetId)
      .select();

    if (updateError) throw updateError;
    return updateData;
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








