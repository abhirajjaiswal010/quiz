const fs = require('fs');
const content = fs.readFileSync('d:\\clubQUiz\\backend\\controllers\\quizController.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('total')) {
    console.log(`${i + 1}: ${line}`);
  }
});
