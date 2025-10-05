/**
 * Fujifilm Grain Simulator - App Processing Module
 * 
 * @description Professional-grade film grain simulation algorithm
 * @developer krafta.
 * @portfolio https://www.facebook.com/krafta.visio
 * @github https://github.com/krafta-visio
 * @version 2.0.0
 * @created 2025
 */

class FujiGrainApp {
    constructor() {
        this.validator = new FileValidator();
        this.exifReader = new ExifReader();
        this.grainProcessor = new GrainProcessor();
        this.lutProcessor = new LUTProcessor();
        
        this.originalImage = null;
        this.processedCanvas = null;
        this.currentSettings = {};
        this.currentFile = null;
        this.availableLUTs = [];
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('🚀 Initializing Fujifilm Grain Simulator...');
        this.initializeEventListeners();
        this.loadAvailableLUTs();
        this.initializeSettings();
    }

    initializeEventListeners() {
        console.log('📝 Setting up event listeners...');
        
        // File input
        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('📁 File selected:', file.name);
                this.handleFileSelect(file);
            }
        });

        // Grain settings controls
        document.getElementById('isoSelect').addEventListener('change', (e) => {
            this.updateSetting('iso', e.target.value);
        });

        document.getElementById('strengthSlider').addEventListener('input', (e) => {
            document.getElementById('strengthValue').textContent = e.target.value;
            this.updateSetting('strength', parseFloat(e.target.value));
        });

        document.getElementById('grainSizeSlider').addEventListener('input', (e) => {
            document.getElementById('grainSizeValue').textContent = e.target.value;
            this.updateSetting('grainSize', parseFloat(e.target.value));
        });
        
        // LUT controls
        document.getElementById('lutSelect').addEventListener('change', (e) => {
            this.handleLUTSelection(e.target.value);
        });

        document.getElementById('lutFileInput').addEventListener('change', (e) => {
            this.handleCustomLUTUpload(e.target.files[0]);
        });

        document.getElementById('lutStrengthSlider').addEventListener('input', (e) => {
            document.getElementById('lutStrengthValue').textContent = e.target.value;
            this.updateSetting('lutStrength', parseFloat(e.target.value));
        });

        document.getElementById('applyLutToggle').addEventListener('change', (e) => {
            this.updateSetting('applyLUT', e.target.checked);
        });

        // Action buttons
        document.getElementById('applyGrainBtn').addEventListener('click', () => {
            this.applyGrain();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetImage();
        });

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadResult();
        });
    }

    initializeSettings() {
        this.currentSettings = {
            iso: document.getElementById('isoSelect').value,
            strength: parseFloat(document.getElementById('strengthSlider').value),
            grainSize: parseFloat(document.getElementById('grainSizeSlider').value),
            selectedLUT: 'none',
            lutStrength: 1.0,
            applyLUT: true
        };
        console.log('⚙️ Settings initialized:', this.currentSettings);
    }

    async loadAvailableLUTs() {
        try {
            console.log('🎨 Loading available LUTs...');
            this.availableLUTs = await this.lutProcessor.getAvailableLUTs();
            this.populateLUTDropdown();
            console.log('✅ Available LUTs loaded:', this.availableLUTs.length, 'LUTs found');
        } catch (error) {
            console.error('❌ Failed to load LUT list:', error);
        }
    }

	populateLUTDropdown() {
		const lutSelect = document.getElementById('lutSelect');
		
		// Create a new option set
		const newOptions = [
			// Static options
			{ value: 'none', text: 'No LUT (Original Colors)', selected: true },
			{ value: 'custom', text: 'Custom LUT...' }
		];
		
		// Add dynamic LUTs
		this.availableLUTs.forEach(lut => {
			newOptions.push({
				value: lut.id,
				text: lut.displayName
			});
		});
		
		// Clear and rebuild dropdown
		lutSelect.innerHTML = '';
		newOptions.forEach(opt => {
			const option = document.createElement('option');
			option.value = opt.value;
			option.textContent = opt.text;
			if (opt.selected) option.selected = true;
			lutSelect.appendChild(option);
		});
		
		console.log(`📋 LUT dropdown rebuilt with ${this.availableLUTs.length} LUTs + static options`);
	}

    handleLUTSelection(lutName) {
        const customUpload = document.getElementById('customLutUpload');
        customUpload.style.display = lutName === 'custom' ? 'block' : 'none';
        this.updateSetting('selectedLUT', lutName);
    }

    async handleCustomLUTUpload(file) {
        if (!file) return;

        try {
            this.showLoading(true);
            await this.lutProcessor.loadCustomLUT(file);
            console.log('✅ Custom LUT loaded successfully');
            this.showSuccess('Custom LUT loaded successfully!');
        } catch (error) {
            this.showError('Failed to load LUT: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleFileSelect(file) {
        if (!file) return;

        try {
            this.showLoading(true);
            this.enableControls(false);
            
            console.log('📄 Processing file:', file.name);
            this.currentFile = file;
            
            // Validate file
            const validation = await this.validator.validateFile(file);
            console.log('✅ File validated:', validation);
            
            // Load image
            await this.loadImage(validation.dataUrl);
            
            // Read EXIF data
            const exifData = await this.exifReader.getExifData(file);
            console.log('📊 EXIF data:', exifData);
            
            // Update UI
            this.updateFileInfo(validation, exifData);
            this.autoConfigureIso(exifData);
            
            this.enableControls(true);
            
        } catch (error) {
            console.error('❌ Error processing file:', error);
            this.showError(error.message);
            this.resetFileInput();
        } finally {
            this.showLoading(false);
        }
    }

    async loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('🖼️ Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                this.originalImage = img;
                this.displayOriginalImage(img);
                resolve(img);
            };

            img.onerror = () => {
                console.error('❌ Failed to load image');
                reject(new Error('Failed to load image'));
            };

            img.src = dataUrl;
        });
    }

    displayOriginalImage(img) {
        const originalImgElement = document.getElementById('originalImage');
        const previewContainer = document.getElementById('previewContainer');
        const emptyState = document.getElementById('emptyState');

        // Clear and set new image
        originalImgElement.src = '';
        originalImgElement.src = img.src;
        
        // Update canvas preview
        const canvas = document.getElementById('processedCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        // Update UI state
        previewContainer.classList.remove('d-none');
        emptyState.classList.add('d-none');

        // Update image stats
        document.getElementById('imageStats').textContent = 
            `Dimensions: ${img.naturalWidth} × ${img.naturalHeight} pixels | Aspect Ratio: ${(img.naturalWidth / img.naturalHeight).toFixed(2)}`;
    }

    updateFileInfo(validation, exifData) {
        const fileInfo = this.validator.getFileInfo(validation.file, validation);
        
        // Update file info
        document.getElementById('fileDetails').textContent = 
            `Name: ${fileInfo.name} | Size: ${fileInfo.size} | Dimensions: ${fileInfo.dimensions}`;
        document.getElementById('fileInfo').classList.remove('d-none');

        // Update EXIF info
        if (exifData) {
            document.getElementById('exifDetails').textContent = 
                this.exifReader.formatExifDisplay(exifData);
            document.getElementById('exifInfo').classList.remove('d-none');
        } else {
            document.getElementById('exifInfo').classList.add('d-none');
        }
    }

    autoConfigureIso(exifData) {
        const isoSelect = document.getElementById('isoSelect');
        if (exifData && isoSelect.value === 'auto') {
            const recommendedIso = this.exifReader.getRecommendedIso(exifData);
            isoSelect.value = recommendedIso;
            this.updateSetting('iso', recommendedIso);
            console.log('⚙️ Auto-configured ISO to:', recommendedIso);
        }
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        console.log('⚙️ Setting updated:', key, value);
    }

    async applyGrain() {
        if (!this.originalImage) {
            this.showError('Please upload an image first');
            return;
        }

        // 🚀 PRIORITAS: Tampilkan loading screen DULU
        this.showLoading(true);
        this.enableControls(false);
        document.getElementById('processedCanvas').classList.add('grain-loading');

        // ⏳ Beri browser waktu untuk render loading screen
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            console.log('🎯 Starting image processing with settings:', this.currentSettings);
            
            // Step 1: Apply grain
            const canvas = await this.grainProcessor.applyGrainOptimized(
                this.originalImage, 
                this.currentSettings
            );

            // Step 2: Apply LUT if enabled
            if (this.currentSettings.applyLUT && 
                this.currentSettings.selectedLUT && 
                this.currentSettings.selectedLUT !== 'none') {
                
                await this.applyLUTToCanvas(canvas);
            }

            // Step 3: Update result
            this.processedCanvas = canvas;
            this.displayProcessedImage();
            
            console.log('✅ Image processing completed successfully');
            this.showSuccess('Grain and color grading applied successfully!');
            
        } catch (error) {
            console.error('❌ Error processing image:', error);
            this.handleProcessingError(error);
            
        } finally {
            this.showLoading(false);
            this.enableControls(true);
            document.getElementById('processedCanvas').classList.remove('grain-loading');
        }
    }

    async applyLUTToCanvas(canvas) {
        try {
            console.log('🎨 Applying LUT:', this.currentSettings.selectedLUT);
            
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const processedData = await this.lutProcessor.applyLUT(
                imageData, 
                this.currentSettings.selectedLUT,
                this.currentSettings.lutStrength || 1.0
            );
            
            if (!processedData || !(processedData instanceof ImageData)) {
                throw new Error('LUT processing returned invalid ImageData');
            }
            
            ctx.putImageData(processedData, 0, 0);
            console.log('✅ LUT applied successfully');
            
        } catch (lutError) {
            console.error('❌ LUT processing failed:', lutError);
            this.showError('LUT processing failed: ' + lutError.message + '. Continuing without color grading.');
        }
    }

    handleProcessingError(error) {
        let errorMessage = 'Failed to process image: ' + error.message;
        
        if (error.message.includes('memory') || error.message.includes('size')) {
            errorMessage = 'Image is too large for processing. Try with a smaller image.';
        } else if (error.message.includes('LUT')) {
            errorMessage = 'Color grading failed: ' + error.message;
        } else if (error.message.includes('grain')) {
            errorMessage = 'Grain application failed: ' + error.message;
        }
        
        this.showError(errorMessage);
        this.resetImage();
    }

    displayProcessedImage() {
        const canvasElement = document.getElementById('processedCanvas');
        const context = canvasElement.getContext('2d');
        
        canvasElement.width = this.processedCanvas.width;
        canvasElement.height = this.processedCanvas.height;
        
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        context.drawImage(this.processedCanvas, 0, 0);
    }

    resetImage() {
        if (this.originalImage) {
            this.displayOriginalImage(this.originalImage);
            this.processedCanvas = null;
            
            // Reset UI controls
            this.resetUIControls();
            
            // Reset settings
            this.currentSettings = {
                iso: '800',
                strength: 0.7,
                grainSize: 1.0,
                selectedLUT: 'none',
                lutStrength: 1.0,
                applyLUT: true
            };
            
            console.log('🔄 Image and settings reset to original');
        }
    }

	resetUIControls() {
		// Reset LUT controls - set to "none" instead of rebuilding
		document.getElementById('lutSelect').value = 'none';
		document.getElementById('customLutUpload').style.display = 'none';
		document.getElementById('lutStrengthSlider').value = 1.0;
		document.getElementById('lutStrengthValue').textContent = '1.0';
		document.getElementById('applyLutToggle').checked = true;
		
		// Reset grain controls
		document.getElementById('isoSelect').value = '800';
		document.getElementById('strengthSlider').value = 0.7;
		document.getElementById('strengthValue').textContent = '0.7';
		document.getElementById('grainSizeSlider').value = 1.0;
		document.getElementById('grainSizeValue').textContent = '1.0';
	}

    downloadResult() {
        if (!this.processedCanvas) {
            this.showError('No processed image to download. Please apply grain first.');
            return;
        }

        try {
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `fuji-grain-${timestamp}.jpg`;
            link.href = this.processedCanvas.toDataURL('image/jpeg', 0.95);
            link.click();
            
            console.log('📥 Download initiated');
            this.showSuccess('Download started!');
            
        } catch (error) {
            console.error('❌ Download error:', error);
            this.showError('Failed to download image: ' + error.message);
        }
    }

    enableControls(enabled) {
        const controls = [
            'applyGrainBtn', 'resetBtn', 'downloadBtn', 
            'isoSelect', 'strengthSlider', 'grainSizeSlider',
            'lutSelect', 'lutStrengthSlider', 'applyLutToggle', 'lutFileInput'
        ];
        
        controls.forEach(controlId => {
            const element = document.getElementById(controlId);
            if (element) {
                element.disabled = !enabled;
                
                // Update apply button appearance
                if (controlId === 'applyGrainBtn') {
                    if (enabled) {
                        element.innerHTML = '<i class="fas fa-magic me-2"></i>Apply Grain & LUT';
                        element.classList.remove('btn-secondary');
                        element.classList.add('btn-primary');
                    } else {
                        element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                        element.classList.remove('btn-primary');
                        element.classList.add('btn-secondary');
                    }
                }
            }
        });
        
        // Update download button state
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.disabled = !(enabled && this.processedCanvas);
        }
    }

    resetFileInput() {
        document.getElementById('imageInput').value = '';
        this.currentFile = null;
        this.enableControls(false);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const overlay = document.getElementById('loadingOverlay');
        
        if (show) {
            // Prioritaskan tampilan loading screen
            spinner.classList.remove('d-none');
            if (!overlay) {
                const newOverlay = document.createElement('div');
                newOverlay.id = 'loadingOverlay';
                newOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-none';
                newOverlay.style.zIndex = '9998';
                document.body.appendChild(newOverlay);
            }
            // Force synchronous rendering
            document.getElementById('loadingOverlay').classList.remove('d-none');
            document.body.style.cursor = 'wait';
            
        } else {
            spinner.classList.add('d-none');
            if (overlay) {
                overlay.classList.add('d-none');
            }
            document.body.style.cursor = 'default';
        }
    }

    showError(message) {
        console.error('❌ App Error:', message);
        
        // Use Bootstrap toast for better UX
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        new bootstrap.Toast(toast, { delay: 5000 }).show();
        
        // Auto remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    showSuccess(message) {
        console.log('✅ Success:', message);
        
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        new bootstrap.Toast(toast, { delay: 3000 }).show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing Fujifilm Grain Simulator...');
    new FujiGrainApp();
});