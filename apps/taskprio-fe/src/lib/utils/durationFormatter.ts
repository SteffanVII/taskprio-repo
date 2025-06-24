

// Conversion constants (in minutes)
export const TIME_UNITS = {
    mm: 30 * 24 * 60, // month = 30 days = 43200 minutes
    w: 7 * 24 * 60,   // week = 7 days = 10080 minutes  
    d: 24 * 60,       // day = 24 hours = 1440 minutes
    h: 60,            // hour = 60 minutes
    m: 1              // minute = 1 minute
}

// Validate estimate string format
export const isValidDurationString = (text: string): boolean => {
    if (!text.trim()) return true; // Empty is valid
    
    // Remove extra spaces and normalize
    const normalized = text.trim().replace(/\s+/g, ' ');
    
    // Regex to match the full pattern: number followed by unit, with optional spaces
    const fullRegex = /^(\d+mm(\s+|$))?(\d+w(\s+|$))?(\d+d(\s+|$))?(\d+h(\s+|$))?(\d+m(\s*|$))?$/;
    
    if (!fullRegex.test(normalized)) return false;
    
    // Extract individual parts
    const regex = /(\d+)(mm|w|d|h|m)/g;
    const matches = [...normalized.matchAll(regex)];
    
    if (matches.length === 0) return false;
    
    // Check order and no duplicates
    const allowedOrder = ['mm', 'w', 'd', 'h', 'm'];
    const usedUnits = new Set<string>();
    let lastIndex = -1;
    
    for (const match of matches) {
        const unit = match[2];
        const value = parseInt(match[1]);
        
        // Check if value is positive
        if (value <= 0) return false;
        
        // Check for duplicates
        if (usedUnits.has(unit)) return false;
        usedUnits.add(unit);
        
        // Check order
        const currentIndex = allowedOrder.indexOf(unit);
        if (currentIndex <= lastIndex) return false;
        lastIndex = currentIndex;
    }
    
    return true;
};

// Parse text like "1mm 2w 3d 4h 5m" to total minutes
export const parseDurationString = (text: string): number | null => {
    if (!text.trim()) return null;
    
    const regex = /(\d+)(mm|w|d|h|m)/g;
    let totalMinutes = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2] as keyof typeof TIME_UNITS;
        totalMinutes += value * TIME_UNITS[unit];
    }
    
    return totalMinutes > 0 ? totalMinutes : null;
}

// Format minutes back to text like "1mm 2w 3d 4h 5m"
export const formatDurationString = (minutes: number | null): string => {
    if (!minutes || minutes === 0) return "";
    
    let remaining = minutes;
    const parts: string[] = [];
    
    // Process in order: mm, w, d, h, m
    for (const [unit, unitMinutes] of Object.entries(TIME_UNITS)) {
        if (remaining >= unitMinutes) {
            const count = Math.floor(remaining / unitMinutes);
            parts.push(`${count}${unit}`);
            remaining -= count * unitMinutes;
        }
    }
    
    return parts.join(' ');
}