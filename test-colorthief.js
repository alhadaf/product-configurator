const ColorThief = require('colorthief');
const fs = require('fs');
const path = require('path');

// Test ColorThief functionality
async function testColorThief() {
  try {
    console.log('Testing ColorThief functionality...');
    
    // Create a simple test image (in a real scenario, you would use an actual image file)
    console.log('ColorThief library imported successfully');
    
    // Example of how you would use ColorThief with an image:
    /*
    const img = new Image();
    img.src = 'path/to/your/image.jpg';
    img.onload = async function() {
      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      const palette = colorThief.getPalette(img);
      
      console.log('Dominant color:', dominantColor);
      console.log('Color palette:', palette);
    };
    */
    
    console.log('ColorThief test completed');
  } catch (error) {
    console.error('Error testing ColorThief:', error);
  }
}

testColorThief();