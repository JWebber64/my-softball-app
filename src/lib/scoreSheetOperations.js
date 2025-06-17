import { STORAGE_BUCKETS } from '../constants/storage';
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

    // Check if processing_status column exists by querying the table structure
    const { data: columnData, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'score_sheets')
      .eq('column_name', 'processing_status');

    const hasProcessingStatus = columnData && columnData.length > 0;

    // Update with or without processing_status based on column existence
    const updateObj = { image_url: uploadData.path };  // Changed from original_image_url to image_url
    if (hasProcessingStatus) {
      updateObj.processing_status = 'pending';
    }

    const { data: updateData, error: updateError } = await supabase
      .from('score_sheets')
      .update(updateObj)
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
  },

  async uploadScoreSheet(file, teamIdentifier) {
    if (!teamIdentifier) {
      throw new Error('Team ID is required to upload a score sheet');
    }

    try {
      // Generate a unique filename
      const fileName = `team_${teamIdentifier}/${Date.now()}-${file.name}`;
      
      // Upload file to the scoresheets bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.SCORESHEETS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get current user with the new API
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      // Create a minimal record - just storing the image reference
      // No stats calculation at this point
      const scoreSheetData = {
        team_id: teamIdentifier,
        scoresheet_creator_id: user.id, // Use user.id from the getUser() response
        game_date: new Date().toISOString().split('T')[0],
        game_number: 1,
        home_team: true,
        final_score: { us: 0, them: 0 },
        image_url: uploadData.path,
        is_pending: true,
        is_processed: false,
        processing_status: 'pending'
      };
      
      // Use the RPC function instead of direct table access
      // This bypasses RLS and handles the ambiguity internally
      const { data, error: insertError } = await supabase
        .rpc('create_score_sheet', {
          sheet_data: scoreSheetData
        });
      
      if (insertError) {
        // Clean up the uploaded file if insert failed
        await supabase.storage
          .from(STORAGE_BUCKETS.SCORESHEETS)
          .remove([uploadData.path]);
        
        throw insertError;
      }
      
      return data;
    } catch (error) {
      console.error('Score sheet upload error:', error);
      throw new Error(`Failed to upload score sheet: ${error.message}`);
    }
  },

  async saveDigitalScoreSheet(scoreSheetId, digitalData) {
    if (!scoreSheetId) {
      throw new Error('Score sheet ID is required');
    }

    try {
      // Update the score sheet with digital data and set is_pending to false
      const { data, error } = await supabase
        .from('score_sheets')
        .update({
          innings: digitalData.innings || [],
          lineup: digitalData.players || [],
          final_score: digitalData.finalScore || { us: 0, them: 0 },
          opponent_name: digitalData.opponentName || '',
          game_date: digitalData.gameDate || new Date().toISOString().split('T')[0],
          game_number: digitalData.gameNumber || 1,
          home_team: digitalData.homeTeam !== undefined ? digitalData.homeTeam : true,
          is_pending: false, // This will trigger stats calculation
          is_processed: true,
          processing_status: 'completed'
        })
        .eq('id', scoreSheetId)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error saving digital score sheet:', error);
      throw new Error(`Failed to save digital score sheet: ${error.message}`);
    }
  },

  async deleteScoreSheet(scoreSheetId) {
    if (!scoreSheetId) {
      throw new Error('Score sheet ID is required');
    }

    try {
      // Use a stored procedure to handle everything
      const { data, error } = await supabase
        .rpc('delete_score_sheet_completely', { 
          p_id: scoreSheetId 
        });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting score sheet:', error);
      throw new Error(`Failed to delete score sheet: ${error.message}`);
    }
  },

  async resetDigitalData(scoreSheetId) {
    if (!scoreSheetId) {
      throw new Error('Score sheet ID is required');
    }

    try {
      // Reset digital data but keep the image
      const { data, error } = await supabase
        .from('score_sheets')
        .update({
          innings: [],
          lineup: [],
          final_score: { us: 0, them: 0 },
          opponent_name: '',
          is_pending: true,
          is_processed: false,
          processing_status: 'pending'
        })
        .eq('id', scoreSheetId)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error resetting digital data:', error);
      throw new Error(`Failed to reset digital data: ${error.message}`);
    }
  }
};






























