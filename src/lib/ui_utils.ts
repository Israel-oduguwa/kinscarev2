export function generateAvatarData(name: string) {
    // Ensure the name has at least two characters and is uppercase
    const initials = name.trim().substring(0, 2).toUpperCase();
  
    // Hash function to generate a consistent number based on the string
    const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  
    // Generate two HSL colors based on the hash
    const hue1 = (hash % 360); // Hue between 0 and 359
    const hue2 = (hue1 + 60) % 360; // Complementary hue
    const saturation = 70; // Saturation percentage
    const lightness = 50; // Lightness percentage
  
    const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
    const color2 = `hsl(${hue2}, ${saturation}%, ${lightness}%)`;
  
    // Return initials and a linear gradient CSS string
    return {
      initials,
      gradient: `linear-gradient(135deg, ${color1}, ${color2})`,
    };
  }
  
  export const sanitizeContent = (htmlContent: string) => {
    if (htmlContent) {
      // Remove <img> tags using regex
      return htmlContent.replace(/<img[^>]*>/gi, "");
    }
  };