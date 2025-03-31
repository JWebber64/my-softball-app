import * as tf from '@tensorflow/tfjs';
import { createWorker } from 'tesseract.js';
import { PLAY_MAPPINGS } from '../utils/scoresheetParser';

class OCRService {
  constructor() {
    this.worker = null;
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.worker = await createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      
      // Load TensorFlow model
      this.model = await tf.loadLayersModel('/models/image_quality/model.json');
      this.initialized = true;
    } catch (error) {
      console.error('OCR initialization error:', error);
      throw new Error('Failed to initialize OCR service');
    }
  }

  async processImage(imageData) {
    if (!this.initialized) await this.initialize();

    try {
      const result = await this.worker.recognize(imageData);
      return result.data.text;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  parsePlay(text) {
    const cleanedText = this.cleanText(text).toUpperCase();
    
    if (!cleanedText) {
      return { event: '', type: 'empty', value: '' };
    }

    for (const [pattern, mapping] of Object.entries(PLAY_MAPPINGS)) {
      if (cleanedText.match(new RegExp(pattern))) {
        return { ...mapping, value: cleanedText };
      }
    }

    return {
      event: cleanedText,
      type: 'unknown',
      value: cleanedText
    };
  }

  async checkImageQuality(imageData) {
    if (!imageData) throw new Error('No image data provided');

    // Validate dimensions
    if (imageData.width < 800 || imageData.height < 600) {
      throw new Error('Image resolution too low. Minimum 800x600 required.');
    }

    const tensor = this.preprocessImage(imageData);
    const qualityScore = await this.assessQuality(tensor);
    tensor.dispose();

    return {
      score: qualityScore,
      isAcceptable: qualityScore > 0.7,
      details: this.getQualityDetails(qualityScore)
    };
  }

  preprocessImage(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.drawImage(imageData, 0, 0);

    return tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(canvas)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();
      return imageTensor;
    });
  }

  async assessQuality(tensor) {
    const prediction = await this.model.predict(tensor).data();
    return prediction[0];
  }

  getQualityDetails(score) {
    if (score > 0.9) return 'Excellent image quality';
    if (score > 0.7) return 'Good image quality';
    if (score > 0.5) return 'Fair image quality - consider retaking';
    return 'Poor image quality - please retake';
  }

  cleanText(text) {
    return text.replace(/[^\w\s\-/|]|_/g, '').trim();
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.initialized = false;
  }
}

export const ocrService = new OCRService();
