const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../src/db.ts');

// Import statements to add at the top
const importsToAdd = `import { EWorkspaceRole } from "./types/workspace/enums";
import { EProjectRole } from "./types/project/enums";

`;

try {
    // Read the generated file
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    // Check if imports already exist to avoid duplicates
    if (!content.includes('import { EWorkspaceRole } from "./types/workspace/enums"')) {
        // Add imports at the beginning of the file
        content = importsToAdd + content;
        
        // Write the modified content back to the file
        fs.writeFileSync(dbFilePath, content, 'utf8');
        console.log('✅ Successfully added import statements to db.ts');
    } else {
        console.log('ℹ️  Import statements already exist in db.ts');
    }
} catch (error) {
    console.error('❌ Error modifying db.ts:', error.message);
    process.exit(1);
}
