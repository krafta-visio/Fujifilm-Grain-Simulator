/**
 * Fujifilm Grain Simulator - Grain Processing Module
 * 
 * @description Professional-grade film grain simulation algorithm
 * @developer krafta.
 * @portfolio https://www.facebook.com/krafta.visio
 * @github https://github.com/krafta-visio
 * @version 1.0.0
 * @created 2025
 */
 
class GrainProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async applyGrain(imageElement, settings) {
        return new Promise((resolve) => {
            const width = imageElement.naturalWidth;
            const height = imageElement.naturalHeight;

            // Set canvas size
            this.canvas.width = width;
            this.canvas.height = height;

            // Draw original image
            this.ctx.drawImage(imageElement, 0, 0, width, height);

            // Get image data
            const imageData = this.ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Apply natural monochromatic grain
            this._applyNaturalGrain(data, width, height, settings);

            // Put processed data back
            this.ctx.putImageData(imageData, 0, 0);

            resolve(this.canvas);
        });
    }

    _applyNaturalGrain(data, width, height, settings) {
        const isoParams = this._getIsoParameters(settings.iso);
        const grainIntensity = settings.strength * isoParams.intensity;
        const grainSize = settings.grainSize * isoParams.size;

        // Create luminance map untuk adaptive grain
        const luminanceMap = this._createLuminanceMap(data, width, height);
        
        // Generate monochromatic grain pattern sekali saja
        const grainPattern = this._generateMonochromaticGrain(width, height, grainSize);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const luminance = luminanceMap[y][x];
                
                // Get adaptive strength berdasarkan luminance
                // Grain lebih terlihat di mid-tones, kurang di shadows/highlights
                const adaptiveStrength = this._getAdaptiveStrength(luminance, grainIntensity);
                
                // Get monochromatic grain value
                const grainValue = grainPattern[y][x] * adaptiveStrength * 255;
                
                // Apply same grain value to all RGB channels (monochromatic)
                data[index] = this._clamp(data[index] + grainValue);     // Red
                data[index + 1] = this._clamp(data[index + 1] + grainValue); // Green
                data[index + 2] = this._clamp(data[index + 2] + grainValue); // Blue
                // Alpha channel tetap sama
            }
        }
    }

    _generateMonochromaticGrain(width, height, grainSize) {
        const grain = Array(height).fill().map(() => Array(width).fill(0));
        
        // Multi-frequency noise simulation (karakteristik film Fuji)
        const scales = [1.0, 2.0, 4.0]; // Fine, medium, coarse grain
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let grainValue = 0;
                
                // Combine multiple noise frequencies
                for (let i = 0; i < scales.length; i++) {
                    const scale = scales[i] * grainSize;
                    const weight = 1.0 / (i + 1); // Higher frequencies have less weight
                    
                    // Generate coherent noise dengan Perlin-like characteristics
                    const noise = this._generateCoherentNoise(x / scale, y / scale);
                    grainValue += noise * weight;
                }
                
                // Normalize dan apply film-like curve
                grainValue = this._applyFilmCurve(grainValue / scales.length);
                grain[y][x] = grainValue;
            }
        }
        
        return grain;
    }

    _generateCoherentNoise(x, y) {
        // Simple coherent noise function (simplified Perlin noise)
        const X = Math.floor(x);
        const Y = Math.floor(y);
        
        // Fractional part
        const xf = x - X;
        const yf = y - Y;
        
        // Get random gradients at grid points
        const n00 = this._gradientDot(X, Y, xf, yf);
        const n01 = this._gradientDot(X, Y + 1, xf, yf - 1);
        const n10 = this._gradientDot(X + 1, Y, xf - 1, yf);
        const n11 = this._gradientDot(X + 1, Y + 1, xf - 1, yf - 1);
        
        // Smooth interpolation
        const u = this._fade(xf);
        const v = this._fade(yf);
        
        const nx0 = this._lerp(n00, n10, u);
        const nx1 = this._lerp(n01, n11, u);
        
        return this._lerp(nx0, nx1, v);
    }

    _gradientDot(ix, iy, x, y) {
        // Random gradient using hash function
        const random = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453;
        const angle = (random - Math.floor(random)) * Math.PI * 2;
        
        const gx = Math.cos(angle);
        const gy = Math.sin(angle);
        
        return gx * x + gy * y;
    }

    _fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    _lerp(a, b, t) {
        return a + t * (b - a);
    }

    _applyFilmCurve(value) {
        // Film-like response curve - lebih natural daripada linear
        return Math.tanh(value * 2) * 0.5;
    }

    _createLuminanceMap(data, width, height) {
        const map = Array(height).fill().map(() => Array(width).fill(0));
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Calculate luminance (standard formula)
                map[y][x] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }
        }
        
        return map;
    }

    _getAdaptiveStrength(luminance, baseIntensity) {
        // Fuji grain characteristic: lebih terlihat di mid-tones
        // Kurang terlihat di shadows (0.0) dan highlights (1.0)
        const midtoneCurve = Math.exp(-Math.pow(luminance - 0.5, 2) / 0.18);
        
        // Base intensity + midtone boost
        return baseIntensity * (0.4 + 0.6 * midtoneCurve);
    }

    _clamp(value) {
        return Math.max(0, Math.min(255, value));
    }

    _getIsoParameters(iso) {
        const params = {
            100:  { intensity: 0.08, size: 0.7, contrast: 0.3 },
            200:  { intensity: 0.12, size: 0.8, contrast: 0.4 },
            400:  { intensity: 0.18, size: 0.9, contrast: 0.5 },
            800:  { intensity: 0.25, size: 1.0, contrast: 0.6 },
            1600: { intensity: 0.35, size: 1.2, contrast: 0.7 },
            3200: { intensity: 0.50, size: 1.5, contrast: 0.8 }
        };
        
        return params[iso] || params[800];
    }

    // Optimized version untuk performance
    async applyGrainOptimized(imageElement, settings) {
        return new Promise((resolve) => {
            const width = imageElement.naturalWidth;
            const height = imageElement.naturalHeight;

            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx.drawImage(imageElement, 0, 0);

            const imageData = this.ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            const isoParams = this._getIsoParameters(settings.iso);
            const grainIntensity = settings.strength * isoParams.intensity;
            
            // Generate grain pattern terlebih dahulu
            const grainPattern = this._generateOptimizedGrain(width, height, isoParams.size * settings.grainSize);
            
            for (let i = 0; i < data.length; i += 4) {
                const luminance = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;
                const pixelIndex = i / 4;
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                
                const adaptiveStrength = this._getAdaptiveStrength(luminance, grainIntensity);
                const grainValue = grainPattern[y][x] * adaptiveStrength * 255;
                
                data[i]     = this._clamp(data[i] + grainValue);     // R
                data[i + 1] = this._clamp(data[i + 1] + grainValue); // G
                data[i + 2] = this._clamp(data[i + 2] + grainValue); // B
            }

            this.ctx.putImageData(imageData, 0, 0);
            resolve(this.canvas);
        });
    }

    _generateOptimizedGrain(width, height, grainSize) {
        const grain = Array(height).fill().map(() => Array(width).fill(0));
        const scale = Math.max(1, 1000 / Math.max(width, height)); // Adaptive scale based on image size
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Combined noise sources untuk texture yang lebih natural
                const value1 = Math.random() - 0.5;
                const value2 = Math.random() - 0.5;
                const value3 = Math.random() - 0.5;
                
                // Weighted combination untuk natural distribution
                grain[y][x] = (value1 * 0.6 + value2 * 0.3 + value3 * 0.1) * grainSize;
            }
        }
        
        return grain;
    }
}