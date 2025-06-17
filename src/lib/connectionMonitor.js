import { supabase } from './supabaseClient';

class ConnectionMonitor {
  constructor() {
    this.isConnected = false;
    this.listeners = [];
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 2000;
  }

  async checkConnection() {
    try {
      const { error } = await supabase.from('team_members').select('count');
      if (error) throw error;
      
      this.isConnected = true;
      this.retryCount = 0;
      this.notifyListeners();
      return true;
    } catch (err) {
      this.isConnected = false;
      this.notifyListeners();
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.checkConnection(), this.retryDelay);
      }
      return false;
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }
}

export const connectionMonitor = new ConnectionMonitor();