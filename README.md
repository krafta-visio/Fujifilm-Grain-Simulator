# Fujifilm Grain Simulator 🎞️

A free web-based photo editor that brings the magic of Fujifilm's iconic film simulation to your digital photos. Add beautiful, natural grain and authentic film colors that mimic classic film stocks - right in your browser!

![Fujifilm Grain Simulator](https://img.shields.io/badge/Fujifilm-Grain%20Simulator-blue?style=for-the-badge)
![Pure JavaScript](https://img.shields.io/badge/Pure-JavaScript-yellow?style=for-the-badge)
![Free to Use](https://img.shields.io/badge/Free-100%25-green?style=for-the-badge)
![LUTs Supported](https://img.shields.io/badge/50%2B_LUTs_Included-ff69b4?style=for-the-badge)

## ✨ What Makes This Special?

### Authentic Film-like Experience
We've reverse-engineered what makes Fujifilm grain so beloved by photographers. Unlike basic noise filters, our algorithm creates grain that actually behaves like real film! Plus, with our extensive LUT collection, you get authentic film colors too.

### 🎯 Natural Grain Features

| Feature | What It Does | Why It Matters |
|---------|--------------|----------------|
| **Monochromatic Grain** | Creates black-and-white grain only - no weird color speckles | Looks like real film grain, not digital noise |
| **Multi-frequency Noise** | Combines fine and coarse grain layers | Matches the complex texture of actual film |
| **Adaptive Strength** | Grain appears more in mid-tones, less in shadows/highlights | Follows how grain naturally appears in film photography |
| **Film-like Curve** | Special response curve that mimics film characteristics | Feels organic, not artificial or computer-generated |
| **Coherent Noise** | Natural patterns instead of completely random noise | Creates that "organic" film look we all love |
| **Optimized Performance** | Fast processing even on large images | No waiting around for your edits |

## 🎨 New! Film LUTs Color Grading

We now include **50+ professional LUTs** (Look-Up Tables) that accurately recreate the color characteristics of classic film stocks:

### 📸 Included Film Simulations:

#### 🎞️ Fujifilm Series
- **Fujifilm Astia 100F** - Soft, fine-grained for portraits
- **Fujifilm Velvia 100** - High saturation, vibrant colors
- **Fujifilm Provia 100F** - Natural, balanced colors
- **Fujifilm Fortia 50** - Rare, high-color reproduction
- **Fujifilm Superia 400/800** - Versatile consumer films
- **Fujifilm PRO 160** - Professional portrait film
- **Fujifilm X-Pro** - Cross-processing effect

#### 🎞️ Kodak Series
- **Kodak Portra 160/400/800** - Legendary portrait films
- **Kodak Ektar 100** - Ultra-vibrant color negative
- **Kodak Gold 200** - Classic consumer film
- **Kodak Kodachrome 64** - Iconic slide film
- **Kodak Echrome Series** - Professional slide films

#### 🎞️ Agfa Series
- **Agfa Optima 100** - European color palette
- **Agfa Portrait 160** - Soft skin tones
- **Agfa Vista Plus** - Consumer film colors
- **Agfa Chrome RSX** - Slide film characteristics

#### 🎞️ Polaroid Series
- **Polaroid Color 600** - Instant film warmth
- **Polaroid Cinematic** - Movie film look
- **Polaroid Color Instant** - Classic instant colors

#### ⚫ Black & White Collection
- **15+ Monochrome LUTs** - Named after minerals for unique toning:
  - Calcite Mono, Beryl Mono, Bloodstone Mono
  - Bornite Mono, Brazilianite Mono, and more!

## 🚀 Quick Start

1. **Upload** your photo (JPG, PNG, or WebP)
2. **Choose** your ISO simulation or let it auto-detect from EXIF data
3. **Select** from 50+ film LUTs for authentic colors
4. **Adjust** grain strength and LUT intensity to taste
5. **Download** your film-style masterpiece!

## 🛠️ How to Use

### For Photographers:
- **ISO Simulation**: Select your desired film speed or use "Auto" to match your photo's original ISO
- **Film LUTs**: Choose from Fujifilm, Kodak, Agfa, Polaroid, or B&W simulations
- **Natural Controls**: Simple sliders for grain and color intensity
- **Real-time Preview**: See both original and processed versions side-by-side

### For Photo Editors:
- **EXIF-Aware**: Automatically reads camera data for authentic simulations
- **Non-destructive**: Your original file stays untouched
- **LUT Strength Control**: Adjust color intensity from subtle to dramatic
- **High Quality**: Maintains image quality while adding character

## 🌟 Perfect For

- **Film Photography Lovers** who want that analog look on digital photos
- **Fujifilm/Kodak Shooters** looking to enhance their digital workflow
- **Social Media Creators** wanting unique, textured photos with authentic colors
- **Portrait Photographers** needing beautiful skin tones from Portra films
- **Landscape Photographers** wanting Velvia's vibrant colors
- **Anyone** who believes grain and authentic colors add soul to photographs!

## 📸 Supported Formats

- **Input**: JPG, PNG, WebP (up to 10MB)
- **Output**: High-quality JPG with embedded grain and color grading
- **Cameras**: Any digital camera (EXIF data automatically used when available)
- **LUTs**: 50+ included, plus custom .cube file support

## 🎯 Why Our Solution Looks Better

> "Most grain filters just add noise. Our combination of natural grain + authentic LUTs creates real film character."

Traditional digital filters tend to look artificial. Our Fujifilm-inspired approach creates results that:
- **Feels organic** like real film with natural grain structure
- **Authentic colors** using professionally crafted LUTs
- **Adapts to your image** with intelligent grain application
- **Preserves details** while adding texture and character

## 🔧 Technical Details

Built with modern web technologies:
- **HTML5 Canvas** for real-time image processing
- **Pure Vanilla JavaScript** for maximum performance
- **Dynamic LUT System** with auto-discovery and caching
- **EXIF.js** for camera metadata reading
- **Bootstrap 5** for responsive, professional UI
- **Optimized Algorithms** for fast processing of large images

### 🏗️ Architecture Features:
- **Modular Design** - Separate processors for grain and LUTs
- **Smart Caching** - LUTs are cached for instant reuse
- **Memory Efficient** - Automatic cleanup and optimization
- **Cross-browser** - Works on all modern browsers

## 🚀 Live Demo

[https://krafta-visio.github.io/Fujifilm-Grain-Simulator/]

## 📦 Installation & Usage

Want to run it locally? It's incredibly simple:

```bash
git clone https://github.com/krafta-visio/fujifilm-grain-simulator.git
cd fujifilm-grain-simulator
# Open index.html in your browser - that's it!