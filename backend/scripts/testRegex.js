// Test the regex pattern used in AI plans query
const testTitle = "AI Weight Loss Plan";
const regex = /^AI/;

console.log('Testing regex pattern:');
console.log('Title:', testTitle);
console.log('Regex:', regex);
console.log('Match:', regex.test(testTitle));

// Test with case insensitive flag
const regexCaseInsensitive = /^AI/i;
console.log('Regex (case insensitive):', regexCaseInsensitive);
console.log('Match (case insensitive):', regexCaseInsensitive.test(testTitle));

// Test with different variations
const testCases = [
  "AI Weight Loss Plan",
  "ai weight loss plan", 
  "Ai Weight Loss Plan",
  "AI Nutrition Plan",
  "My Custom Plan"
];

console.log('\nTesting different cases:');
testCases.forEach(title => {
  console.log(`"${title}" -> ${regexCaseInsensitive.test(title)}`);
}); 