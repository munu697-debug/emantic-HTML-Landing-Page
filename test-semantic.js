import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('=== Checking Heading Hierarchy ===');
const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
const headings = [];
while ((match = headingRegex.exec(html)) !== null) {
  headings.push({ tag: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() });
}
console.table(headings);

console.log('\n=== Checking Images & Alt Attributes ===');
const imgRegex = /<img([^>]+)>/gi;
let imgIndex = 1;
while ((match = imgRegex.exec(html)) !== null) {
  const altMatch = /alt="([^"]*)"/i.exec(match[1]);
  console.log(`Image ${imgIndex++}: alt="${altMatch ? altMatch[1] : 'MISSING'}"`);
}

console.log('\n=== Checking Form Inputs & Labels ===');
const labelRegex = /<label[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/label>/gi;
const labels = [];
while ((match = labelRegex.exec(html)) !== null) {
  labels.push({ forAttr: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() });
}

const inputRegex = /<(input|select|textarea)[^>]*id="([^"]+)"/gi;
const inputs = [];
while ((match = inputRegex.exec(html)) !== null) {
  inputs.push({ tag: match[1], id: match[2] });
}

console.log(`Found ${labels.length} labels and ${inputs.length} inputs.`);
labels.forEach(l => {
  const hasInput = inputs.some(i => i.id === l.forAttr);
  console.log(`Label for="${l.forAttr}" -> matching input found: ${hasInput}`);
});

console.log('\n=== Checking Core Semantic Tags ===');
['header', 'nav', 'main', 'section', 'article', 'footer', 'figure', 'figcaption', 'address', 'fieldset', 'legend'].forEach(tag => {
  const openCount = (html.match(new RegExp('<' + tag + '(\\s|>)', 'gi')) || []).length;
  const closeCount = (html.match(new RegExp('</' + tag + '>', 'gi')) || []).length;
  console.log(`<${tag}> tags: ${openCount} open, ${closeCount} close (balanced: ${openCount === closeCount})`);
});

const hasUid = /μID|&mu;ID/i.test(html);
console.log('\nHas μID in footer:', hasUid);
