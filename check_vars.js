const fs = require('fs');

try {
    // Read telegram-notify.js
    const jsContent = fs.readFileSync('telegram-notify.js', 'utf8');
    
    // Extract variables from JS file
    const jsMatches = jsContent.match(/this\.githubContext\[\s*['""]([^'""]+)['"]\s*\]/g) || [];
    const jsVars = jsMatches.map(m => {
        const match = m.match(/['""]([^'""]+)['"]/);
        return match ? match[1] : null;
    }).filter(Boolean).sort();
    
    console.log('Variables found in telegram-notify.js:', jsVars.length);
    jsVars.forEach(v => console.log('  -', v));
    
    // Read documentation
    const docContent = fs.readFileSync('docs/AUTO-CONTEXT-VARIABLES.md', 'utf8');
    
    // Extract variables from documentation
    const docMatches = docContent.match(/\{\{([^}]+)\}\}/g) || [];
    const docVars = [...new Set(docMatches.map(m => m.slice(2, -2)))].sort();
    
    console.log('\nVariables found in documentation:', docVars.length);
    docVars.forEach(v => console.log('  -', v));
    
    // Find missing variables
    const missingInDocs = jsVars.filter(v => !docVars.includes(v));
    const extraInDocs = docVars.filter(v => !jsVars.includes(v));
    
    if (missingInDocs.length > 0) {
        console.log('\n❌ Variables missing in documentation:');
        missingInDocs.forEach(v => console.log('  -', v));
    }
    
    if (extraInDocs.length > 0) {
        console.log('\n⚠️ Extra variables in documentation:');
        extraInDocs.forEach(v => console.log('  -', v));
    }
    
    if (missingInDocs.length === 0 && extraInDocs.length === 0) {
        console.log('\n✅ All variables match!');
        process.exit(0);
    } else {
        console.log('\n❌ Variables mismatch detected!');
        process.exit(1);
    }
    
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
