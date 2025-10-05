/**
 * Fujifilm Grain Simulator - App Processing Module
 * 
 * @description Professional-grade film grain simulation algorithm
 * @developer krafta.
 * @portfolio https://www.facebook.com/krafta.visio
 * @github https://github.com/krafta-visio
 * @version 1.0.0
 * @created 2025
 */

class FujiGrainApp {
    constructor() {
        this.validator = new FileValidator();
        this.exifReader = new ExifReader();
        this.grainProcessor = new GrainProcessor();
        
        this.originalImage = null;
        this.processedCanvas = null;
        this.currentSettings = {};
        this.currentFile = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // File input
        const fileInput = document.getElementById('imageInput');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                this.handleFileSelect(file);
            }
        });

        // Settings controls
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

        // Initialize settings
        this.currentSettings = {
            iso: document.getElementById('isoSelect').value,
            strength: parseFloat(document.getElementById('strengthSlider').value),
            grainSize: parseFloat(document.getElementById('grainSizeSlider').value)
        };
    }

    async handleFileSelect(file) {
        if (!file) return;

        try {
            this.showLoading(true);
            this.enableControls(false);
            
            console.log('Processing file:', file.name);
            this.currentFile = file;
            
            // Validate file dan dapatkan data URL
            const validation = await this.validator.validateFile(file);
            console.log('File validated:', validation);
            
            // Load image menggunakan data URL dari validator
            await this.loadImage(validation.dataUrl);
            
            // Read EXIF data
            const exifData = await this.exifReader.getExifData(file);
            console.log('EXIF data:', exifData);
            
            // Update UI dengan file info
            this.updateFileInfo(validation, exifData);
            
            // Auto-configure ISO based on EXIF
            this.autoConfigureIso(exifData);
            
            this.enableControls(true);
            
        } catch (error) {
            console.error('Error processing file:', error);
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
                console.log('Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                this.originalImage = img;
                this.displayOriginalImage(img);
                resolve(img);
            };

            img.onerror = () => {
                console.error('Failed to load image');
                reject(new Error('Gagal memuat gambar'));
            };

            img.src = dataUrl;
        });
    }

    displayOriginalImage(img) {
        const originalImgElement = document.getElementById('originalImage');
        const previewContainer = document.getElementById('previewContainer');
        const emptyState = document.getElementById('emptyState');

        // Clear previous image
        originalImgElement.src = '';
        
        // Set new image
        originalImgElement.src = img.src;
        
        // Update canvas preview
        const canvas = document.getElementById('processedCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        // Show/hide containers
        previewContainer.classList.remove('d-none');
        emptyState.classList.add('d-none');

        // Update image stats
        document.getElementById('imageStats').textContent = 
            `Dimensi: ${img.naturalWidth} × ${img.naturalHeight} pixels | Aspect Ratio: ${(img.naturalWidth / img.naturalHeight).toFixed(2)}`;
    }

    updateFileInfo(validation, exifData) {
        const fileInfo = this.validator.getFileInfo(validation.file, validation);
        
        // Update file info display
        document.getElementById('fileDetails').textContent = 
            `Nama: ${fileInfo.name} | Ukuran: ${fileInfo.size} | Dimensi: ${fileInfo.dimensions}`;
        
        document.getElementById('fileInfo').classList.remove('d-none');

        // Update EXIF info if available
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
            console.log('Auto-configured ISO to:', recommendedIso);
        }
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        console.log('Setting updated:', key, value);
        
        // Auto-apply jika gambar sudah diproses
        if (this.processedCanvas) {
            this.applyGrain();
        }
    }


	async applyGrain() {
		if (!this.originalImage) {
			console.error('No image to process');
			return;
		}

		try {
			this.showLoading(true);
			console.log('Applying natural grain with settings:', this.currentSettings);
			
			// Add loading state to preview
			document.getElementById('processedCanvas').classList.add('grain-loading');
			
			// Use optimized grain processor
			this.processedCanvas = await this.grainProcessor.applyGrainOptimized(
				this.originalImage, 
				this.currentSettings
			);

			this.displayProcessedImage();
			document.getElementById('downloadBtn').disabled = false;
			console.log('Natural grain applied successfully');
			
		} catch (error) {
			console.error('Error applying grain:', error);
			this.showError('Gagal menerapkan grain: ' + error.message);
		} finally {
			this.showLoading(false);
			document.getElementById('processedCanvas').classList.remove('grain-loading');
		}
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
            document.getElementById('downloadBtn').disabled = true;
            console.log('Image reset to original');
        }
    }

    downloadResult() {
        if (!this.processedCanvas) {
            console.error('No processed image to download');
            return;
        }

        try {
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `fuji-grain-${timestamp}.jpg`;
            link.href = this.processedCanvas.toDataURL('image/jpeg', 0.95);
            link.click();
            console.log('Download initiated');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Gagal mengunduh gambar');
        }
    }

    enableControls(enabled) {
        document.getElementById('applyGrainBtn').disabled = !enabled;
        document.getElementById('resetBtn').disabled = !enabled;
        document.getElementById('downloadBtn').disabled = !enabled;
        document.getElementById('isoSelect').disabled = !enabled;
        document.getElementById('strengthSlider').disabled = !enabled;
        document.getElementById('grainSizeSlider').disabled = !enabled;
    }

    resetFileInput() {
        document.getElementById('imageInput').value = '';
        this.currentFile = null;
        this.enableControls(false);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }

    showError(message) {
        // Gunakan alert sederhana dulu
        alert(`Error: ${message}`);
        console.error('App Error:', message);
    }
}

// Initialize app ketika DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    new FujiGrainApp();
});