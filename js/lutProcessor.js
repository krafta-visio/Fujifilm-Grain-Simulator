/**
 * Fujifilm Grain Simulator - LUT Processing Module
 * 
 * @description Dynamic LUT processor with auto-discovery and optimized performance
 * @developer krafta.
 * @portfolio https://www.facebook.com/krafta.visio
 * @github https://github.com/krafta-visio
 * @version 2.0.0
 * @created 2025
 */

class LUTProcessor {
    constructor() {
        this.lutCache = new Map();
        this.lutSize = 64;
        this.lutManifest = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize LUT system (singleton pattern)
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🎨 LUT system already initialized');
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initializeInternal();
        return this.initPromise;
    }

    async _initializeInternal() {
        console.log('🚀 Initializing dynamic LUT system...');
        
        try {
            // Try to load manifest first
            await this.loadLUTManifest();
        } catch (error) {
            console.warn('📋 Manifest not found, scanning folder...');
            await this.scanLUTsFolder();
        }
        
        this.isInitialized = true;
        console.log('✅ LUT system ready -', this.lutCache.size, 'LUTs available');
    }

    /**
     * Load LUT manifest for better organization
     */
    async loadLUTManifest() {
        try {
            const response = await fetch('luts/manifest.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.lutManifest = await response.json();
            console.log('📄 LUT manifest loaded:', this.lutManifest);
            
            // Initialize cache from manifest
            this.lutManifest.luts.forEach(lut => {
                this.lutCache.set(lut.id, {
                    data: null,
                    metadata: lut,
                    lastAccessed: Date.now()
                });
            });
            
        } catch (error) {
            console.log('❌ No manifest found:', error.message);
            throw error;
        }
    }

    /**
     * Scan LUTs folder for automatic discovery
     */
    async scanLUTsFolder() {
        console.log('🔍 Scanning LUTs folder...');
        
        const discoveredLUTs = new Set();

        // Method 1: Try directory listing
        try {
            const response = await fetch('luts/');
            if (response.ok) {
                const html = await response.text();
                const lutFiles = this.parseDirectoryListing(html);
                lutFiles.forEach(file => discoveredLUTs.add(file.replace('.cube', '')));
            }
        } catch (error) {
            console.log('📁 Directory listing not available');
        }

        // Method 2: Try common LUT names
        if (discoveredLUTs.size === 0) {
            await this.scanCommonLUTs(discoveredLUTs);
        }

        // Initialize cache with discovered LUTs
        discoveredLUTs.forEach(lutId => {
            this.lutCache.set(lutId, {
                data: null,
                metadata: { id: lutId, name: this.formatLUTName(lutId) },
                lastAccessed: Date.now()
            });
        });

        console.log('📋 Discovered LUTs:', Array.from(discoveredLUTs));
    }

    /**
     * Scan for common LUT files
     */
    async scanCommonLUTs(discoveredLUTs) {
        const commonLUTs = [
            'Agfa_Optima_100', 'Agfa_Optima_200', 'Agfa_Portrait_160',
            'Fuji_Astia_100F', 'Fuji_Pro_400h', 'Fuji_Provia_100F',
            'Kodak_Portra_400', 'Kodak_Ektar_100', 'Kodak_Ultramax_400',
            'Fuji_Superia_200', 'Fuji_Superia_400', 'Fuji_Superia_800',
            'Kodak_Gold_200', 'Kodak_Gold_400', 'Ilford_HP5_400'
        ];

        const checkPromises = commonLUTs.map(async (lutName) => {
            try {
                const response = await fetch(`luts/${lutName}.cube`, { method: 'HEAD' });
                if (response.ok) {
                    discoveredLUTs.add(lutName);
                }
            } catch (error) {
                // Silently skip missing files
            }
        });

        await Promise.allSettled(checkPromises);
    }

    /**
     * Parse HTML directory listing
     */
    parseDirectoryListing(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href$=".cube"]');
        
        return Array.from(links)
            .map(link => link.getAttribute('href'))
            .filter(filename => filename && filename.endsWith('.cube'));
    }

    /**
     * Get list of available LUTs for UI
     */
    async getAvailableLUTs() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const availableLUTs = [];
        
        for (const [lutId, lutInfo] of this.lutCache) {
            availableLUTs.push({
                id: lutId,
                name: lutInfo.metadata?.name || this.formatLUTName(lutId),
                displayName: this.formatDisplayName(lutId),
                loaded: lutInfo.data !== null,
                category: lutInfo.metadata?.category || 'film'
            });
        }

        // Sort by name for better UX
        availableLUTs.sort((a, b) => a.name.localeCompare(b.name));
        
        return availableLUTs;
    }

    /**
     * Format LUT ID to readable name
     */
    formatLUTName(lutId) {
        return lutId
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/(\d+)$/, ' $1');
    }

    /**
     * Format display name with type indicator
     */
    formatDisplayName(lutId) {
        const baseName = this.formatLUTName(lutId);
        
        // Smart type detection
        let type = '(color)';
        const lowerId = lutId.toLowerCase();
        
        if (lowerId.includes('acros') || lowerId.includes('hp5') || lowerId.includes('mono') ||
            lowerId.includes('tmax') || lowerId.includes('ilford')) {
            type = '(B&W)';
        } else if (lowerId.includes('cinema') || lowerId.includes('eterna')) {
            type = '(cinematic)';
        } else if (lowerId.includes('vivid') || lowerId.includes('velvia')) {
            type = '(vibrant)';
        } else if (lowerId.includes('portrait') || lowerId.includes('portra')) {
            type = '(portrait)';
        }
        
        return `${baseName} ${type}`;
    }

    /**
     * Load external LUT file
     */
    async loadExternalLUT(lutName) {
        console.log(`📥 Loading LUT: ${lutName}`);
        
        try {
            const response = await fetch(`luts/${lutName}.cube`);
            if (!response.ok) {
                throw new Error(`LUT not found: ${lutName}.cube`);
            }
            
            const cubeContent = await response.text();
            const lutData = this.parseCUBEFile(cubeContent);
            
            // Update cache
            if (this.lutCache.has(lutName)) {
                const lutInfo = this.lutCache.get(lutName);
                lutInfo.data = lutData;
                lutInfo.lastAccessed = Date.now();
            } else {
                this.lutCache.set(lutName, {
                    data: lutData,
                    metadata: { id: lutName, name: this.formatLUTName(lutName) },
                    lastAccessed: Date.now()
                });
            }
            
            console.log(`✅ LUT loaded: ${lutName}`);
            return lutData;
            
        } catch (error) {
            console.error(`❌ Failed to load LUT ${lutName}:`, error);
            
            // Remove problematic LUT from cache
            this.lutCache.delete(lutName);
            throw error;
        }
    }

    /**
     * Load custom LUT from file upload
     */
    async loadCustomLUT(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const lutData = this.parseCUBEFile(e.target.result);
                    
                    this.lutCache.set('custom', {
                        data: lutData,
                        metadata: { 
                            id: 'custom', 
                            name: 'Custom LUT',
                            description: `Uploaded: ${file.name}`
                        },
                        lastAccessed: Date.now()
                    });
                    
                    console.log('✅ Custom LUT loaded:', file.name);
                    resolve(lutData);
                    
                } catch (error) {
                    reject(new Error(`Failed to parse LUT: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse .cube file content
     */
    parseCUBEFile(content) {
        const lines = content.split('\n');
        const lut = {
            size: 33, // Default size
            data: [],
            title: 'Unknown LUT'
        };

        for (const line of lines) {
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;

            if (trimmed.startsWith('TITLE')) {
                lut.title = trimmed.replace('TITLE', '').replace(/"/g, '').trim();
            }
            else if (trimmed.startsWith('LUT_3D_SIZE')) {
                lut.size = parseInt(trimmed.replace('LUT_3D_SIZE', '').trim());
            }
            else {
                // Parse data lines
                const values = trimmed.split(/\s+/).filter(v => v);
                if (values.length === 3) {
                    lut.data.push({
                        r: Math.max(0, Math.min(1, parseFloat(values[0]))),
                        g: Math.max(0, Math.min(1, parseFloat(values[1]))),
                        b: Math.max(0, Math.min(1, parseFloat(values[2])))
                    });
                }
            }
        }

        if (lut.data.length === 0) {
            throw new Error('No valid LUT data found');
        }

        // Validate LUT size
        const expectedSize = lut.size * lut.size * lut.size;
        if (lut.data.length !== expectedSize) {
            console.warn(`LUT size mismatch: expected ${expectedSize}, got ${lut.data.length}`);
        }

        return lut;
    }

    /**
     * Apply LUT to ImageData (main processing method)
     */
    async applyLUT(imageData, lutName, strength = 1.0) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Early returns for no-op cases
        if (lutName === 'none' || strength === 0 || !imageData) {
            return imageData;
        }

        // Get or load LUT
        let lutInfo = this.lutCache.get(lutName);
        if (!lutInfo) {
            console.warn(`❌ LUT not found: ${lutName}`);
            return imageData;
        }

        let lutData = lutInfo.data;
        if (!lutData) {
            try {
                lutData = await this.loadExternalLUT(lutName);
            } catch (error) {
                console.warn(`❌ Failed to load LUT ${lutName}:`, error);
                return imageData;
            }
        }

        // Update access time for cache management
        lutInfo.lastAccessed = Date.now();

        // Apply LUT transformation
        return this.applyLUTTransformation(imageData, lutData, strength);
    }

    /**
     * Apply LUT transformation to ImageData
     */
    applyLUTTransformation(imageData, lut, strength) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        const data = newImageData.data;
        const lutSize = lut.size;
        const dataLength = data.length;

        // Optimized loop for better performance
        for (let i = 0; i < dataLength; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            const lutColor = this.sampleLUT3D(lut, r, g, b, lutSize);

            // Blend with original based on strength
            data[i]     = this.mix(data[i],     lutColor.r * 255, strength);
            data[i + 1] = this.mix(data[i + 1], lutColor.g * 255, strength);
            data[i + 2] = this.mix(data[i + 2], lutColor.b * 255, strength);
            // Alpha channel remains unchanged
        }

        return newImageData;
    }

    /**
     * 3D LUT sampling with trilinear interpolation
     */
    sampleLUT3D(lut, r, g, b, size) {
        const x = r * (size - 1);
        const y = g * (size - 1);
        const z = b * (size - 1);

        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const z0 = Math.floor(z);
        const x1 = Math.min(x0 + 1, size - 1);
        const y1 = Math.min(y0 + 1, size - 1);
        const z1 = Math.min(z0 + 1, size - 1);

        const dx = x - x0;
        const dy = y - y0;
        const dz = z - z0;

        // Get the 8 corner points
        const c000 = this.getLUTColor(lut, x0, y0, z0, size);
        const c100 = this.getLUTColor(lut, x1, y0, z0, size);
        const c010 = this.getLUTColor(lut, x0, y1, z0, size);
        const c110 = this.getLUTColor(lut, x1, y1, z0, size);
        const c001 = this.getLUTColor(lut, x0, y0, z1, size);
        const c101 = this.getLUTColor(lut, x1, y0, z1, size);
        const c011 = this.getLUTColor(lut, x0, y1, z1, size);
        const c111 = this.getLUTColor(lut, x1, y1, z1, size);

        // Trilinear interpolation
        const c00 = this.mixColor(c000, c100, dx);
        const c01 = this.mixColor(c001, c101, dx);
        const c10 = this.mixColor(c010, c110, dx);
        const c11 = this.mixColor(c011, c111, dx);

        const c0 = this.mixColor(c00, c10, dy);
        const c1 = this.mixColor(c01, c11, dy);

        return this.mixColor(c0, c1, dz);
    }

    /**
     * Get LUT color at specific coordinates
     */
    getLUTColor(lut, x, y, z, size) {
        const index = (z * size * size) + (y * size) + x;
        return lut.data[Math.min(index, lut.data.length - 1)];
    }

    /**
     * Color mixing helper
     */
    mixColor(c1, c2, t) {
        return {
            r: this.mix(c1.r, c2.r, t),
            g: this.mix(c1.g, c2.g, t),
            b: this.mix(c1.b, c2.b, t)
        };
    }

    /**
     * Linear interpolation
     */
    mix(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Preload specific LUTs for better performance
     */
    async preloadLUTs(lutNames) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const preloadPromises = lutNames.map(async (lutName) => {
            if (this.lutCache.has(lutName)) {
                const lutInfo = this.lutCache.get(lutName);
                if (!lutInfo.data) {
                    await this.loadExternalLUT(lutName);
                }
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log(`✅ Preloaded ${lutNames.length} LUTs`);
    }

    /**
     * Clear cache to free memory
     */
    clearCache(keepLoaded = true) {
        if (!keepLoaded) {
            this.lutCache.clear();
        } else {
            // Only clear unloaded LUTs
            for (const [lutName, lutInfo] of this.lutCache) {
                if (!lutInfo.data) {
                    this.lutCache.delete(lutName);
                }
            }
        }
        console.log('🧹 LUT cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        let loaded = 0;
        let total = 0;
        
        for (const [_, lutInfo] of this.lutCache) {
            total++;
            if (lutInfo.data) loaded++;
        }
        
        return { total, loaded, percentage: (loaded / total * 100).toFixed(1) };
    }
}