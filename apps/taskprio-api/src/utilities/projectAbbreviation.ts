

export const getProjectNameAbbreviation = ( projectName : string ) => {
    const cleanedWords = projectName.trim().split( /\s+/ ).filter(Boolean);
    const abbreviation = cleanedWords.map( word => word[0].toUpperCase() ).join( "" );
    return abbreviation;
}