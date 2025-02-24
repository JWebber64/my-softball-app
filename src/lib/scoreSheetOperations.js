import { supabase, checkAuth, initializeStorage } from './supabaseClient';

export const scoreSheetOperations = {
  // Create a new score sheet
  async createScoreSheet(parsedData) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data, error } = await supabase
      .from('score_sheets')
      .insert([{
        game_number: parsedData.gameInfo.gameNumber,
        game_date: parsedData.gameInfo.date || new Date().toISOString().split('T')[0],
        game_time: parsedData.gameInfo.time,
        field: parsedData.gameInfo.field,
        weather: parsedData.gameInfo.weather,
        opponent_name: parsedData.gameInfo.opponent,
        home_team: parsedData.gameInfo.isHomeTeam,
        innings: parsedData.innings,
        lineup: parsedData.players,
        substitutions: [],
        final_score: parsedData.finalScore,
        notes: parsedData.gameInfo.notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a score sheet
  async updateScoreSheet(id, updates) {
    const { data, error } = await supabase
      .from('score_sheets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get a score sheet
  async getScoreSheet(gameNumber) {
    const { data, error } = await supabase
      .from('score_sheets')
      .select('*')
      .eq('game_number', gameNumber)
      .single();

    if (error) throw error;
    console.log('Retrieved scoresheet data:', data); // Debug log
    return data;
  },

  // Get all score sheets
  async getAllScoreSheets() {
    const { data, error } = await supabase
      .from('score_sheets')
      .select('*')
      .order('game_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Add a new inning to the score sheet
  async addInning(scoreSheetId, inningData) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data: currentSheet, error: fetchError } = await supabase
      .from('score_sheets')
      .select('innings')
      .eq('id', scoreSheetId)
      .single();

    if (fetchError) throw fetchError;

    const updatedInnings = [...(currentSheet.innings || []), inningData];

    const { data, error } = await supabase
      .from('score_sheets')
      .update({ 
        innings: updatedInnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', scoreSheetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update score for the current inning
  async updateScore(scoreSheetId, { us, them }) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data, error } = await supabase
      .from('score_sheets')
      .update({ 
        final_score: { us, them },
        updated_at: new Date().toISOString()
      })
      .eq('id', scoreSheetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Record a play in the current inning
  async recordPlay(scoreSheetId, inningNumber, playData) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data: currentSheet, error: fetchError } = await supabase
      .from('score_sheets')
      .select('innings')
      .eq('id', scoreSheetId)
      .single();

    if (fetchError) throw fetchError;

    const innings = [...(currentSheet.innings || [])];
    if (!innings[inningNumber - 1]) {
      innings[inningNumber - 1] = { plays: [] };
    }

    innings[inningNumber - 1].plays.push({
      ...playData,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('score_sheets')
      .update({ 
        innings,
        updated_at: new Date().toISOString()
      })
      .eq('id', scoreSheetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Export game data as CSV
  async exportGameStats(scoreSheetId) {
    const { data: scoreSheet, error } = await supabase
      .from('score_sheets')
      .select('*')
      .eq('id', scoreSheetId)
      .single();

    if (error) throw error;

    // Generate CSV content
    const playerStats = new Map();
    let csvContent = 'Player,AB,H,1B,2B,3B,HR,BB,AVG\n';

    scoreSheet.innings.forEach(inning => {
      inning.plays?.forEach(play => {
        const playerId = play.playerId;
        
        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            hits: 0,
            singles: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            outs: 0,
            walks: 0,
            atBats: 0,
          });
        }

        const stat = playerStats.get(playerId);
        
        // Update stats based on play type
        switch (play.type) {
          case 'single':
            stat.hits++;
            stat.singles++;
            stat.atBats++;
            break;
          case 'double':
            stat.hits++;
            stat.doubles++;
            stat.atBats++;
            break;
          case 'triple':
            stat.hits++;
            stat.triples++;
            stat.atBats++;
            break;
          case 'homerun':
            stat.hits++;
            stat.homeRuns++;
            stat.atBats++;
            break;
          case 'out':
            stat.outs++;
            stat.atBats++;
            break;
          case 'walk':
            stat.walks++;
            break;
        }
      });
    });

    // Generate CSV rows
    playerStats.forEach((stat, playerId) => {
      const avg = stat.atBats > 0 ? (stat.hits / stat.atBats).toFixed(3) : '.000';
      csvContent += `Player ${playerId},${stat.atBats},${stat.hits},${stat.singles},${stat.doubles},${stat.triples},${stat.homeRuns},${stat.walks},${avg}\n`;
    });

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `game_${scoreSheet.game_number}_stats.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Add a play to an inning
  async addPlay(gameNumber, inningNumber, playerNumber, playData) {
    const sheet = await this.getScoreSheet(gameNumber);
    const innings = [...(sheet.innings || [])];
    
    // Ensure inning exists
    while (innings.length < inningNumber) {
      innings.push({ number: innings.length + 1, plays: {}, runs: 0 });
    }

    // Add or update play
    innings[inningNumber - 1].plays[playerNumber] = playData;

    // Update running score if needed
    if (playData.runs) {
      innings[inningNumber - 1].runs = (innings[inningNumber - 1].runs || 0) + playData.runs;
    }

    return this.updateScoreSheet(sheet.id, {
      innings,
      final_score: this.calculateFinalScore(innings)
    });
  },

  // Add a substitution
  async addSubstitution(gameNumber, substitutionData) {
    const sheet = await this.getScoreSheet(gameNumber);
    const substitutions = [...(sheet.substitutions || [])];

    substitutions.push({
      ...substitutionData,
      timestamp: new Date().toISOString()
    });

    return this.updateScoreSheet(sheet.id, { substitutions });
  },

  // Update player lineup
  async updateLineup(gameNumber, lineup) {
    const sheet = await this.getScoreSheet(gameNumber);
    return this.updateScoreSheet(sheet.id, { lineup });
  },

  // Helper function to calculate final score
  calculateFinalScore(innings) {
    const total = innings.reduce((sum, inning) => sum + (inning.runs || 0), 0);
    return {
      ...innings[0]?.final_score,
      us: total
    };
  },

  // Get player statistics for a game
  async getPlayerGameStats(gameNumber, playerNumber) {
    const sheet = await this.getScoreSheet(gameNumber);
    const stats = {
      atBats: 0,
      hits: 0,
      runs: 0,
      rbis: 0
    };

    sheet.innings?.forEach(inning => {
      const play = inning.plays?.[playerNumber];
      if (play) {
        stats.atBats += play.isAtBat ? 1 : 0;
        stats.hits += play.isHit ? 1 : 0;
        stats.runs += play.runs || 0;
        stats.rbis += play.rbis || 0;
      }
    });

    return stats;
  },

  // Upload image for a score sheet
  async uploadImage(gameNumber, file) {
    if (!file) {
      console.warn('No file provided for upload');
      return null;
    }
    
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error('User must be authenticated to perform this action');
      }

      // Quick validation
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Create file path
      const safeGameNumber = String(gameNumber).replace(/[^0-9]/g, '');
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const safeFileName = `game_${safeGameNumber}.${fileExtension}`;
      const filePath = `game_images/${safeFileName}`;

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scoresheets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('scoresheets')
        .getPublicUrl(filePath);

      return { filePath, publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Delete scoresheet image
  async deleteImage(gameNumber) {
    const sheet = await this.getScoreSheet(gameNumber);
    if (!sheet.image_url) return;

    const filePath = sheet.image_url.split('/').slice(-2).join('/');
    
    const { error: deleteError } = await supabase.storage
      .from('scoresheets')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from('score_sheets')
      .update({ image_url: null })
      .eq('game_number', gameNumber);

    if (updateError) throw updateError;
  }
};
