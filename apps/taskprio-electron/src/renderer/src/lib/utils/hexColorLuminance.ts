
/**
 * Converts a hex color to RGB values and calculates the relative luminance
 * @param hex - Hex color string (with or without #)
 * @returns Luminance value between 0 and 1
 */
export const getHexLuminance = (hex: string): number => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert RGB to linear RGB (sRGB to linear conversion)
  const toLinear = (value: number): number => {
    const normalized = value / 255;
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  
  const linearR = toLinear(r);
  const linearG = toLinear(g);
  const linearB = toLinear(b);
  
  // Calculate relative luminance using ITU-R BT.709 coefficients
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
};

export default getHexLuminance;