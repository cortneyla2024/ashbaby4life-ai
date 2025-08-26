// Simple test demonstration
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// Test cases
console.log('Running basic tests...');

// Test addition
console.log('Testing addition:');
console.log('add(2, 3) =', add(2, 3));
console.log('add(-1, 1) =', add(-1, 1));
console.log('add(0, 0) =', add(0, 0));

// Test subtraction
console.log('\nTesting subtraction:');
console.log('subtract(5, 3) =', subtract(5, 3));
console.log('subtract(1, 1) =', subtract(1, 1));
console.log('subtract(0, 5) =', subtract(0, 5));

// Test multiplication
console.log('\nTesting multiplication:');
console.log('multiply(2, 3) =', multiply(2, 3));
console.log('multiply(-2, 3) =', multiply(-2, 3));
console.log('multiply(0, 5) =', multiply(0, 5));

// Test division
console.log('\nTesting division:');
console.log('divide(6, 2) =', divide(6, 2));
console.log('divide(5, 2) =', divide(5, 2));
console.log('divide(0, 5) =', divide(0, 5));

try {
  console.log('divide(5, 0) =', divide(5, 0));
} catch (error) {
  console.log('divide(5, 0) = Error:', error.message);
}

// Test results
console.log('\n=== Test Results ===');
const tests = [
  { name: 'Addition', result: add(2, 3) === 5 },
  { name: 'Subtraction', result: subtract(5, 3) === 2 },
  { name: 'Multiplication', result: multiply(2, 3) === 6 },
  { name: 'Division', result: divide(6, 2) === 3 },
  { name: 'Division by zero', result: (() => {
    try {
      divide(5, 0);
      return false;
    } catch (error) {
      return error.message === 'Division by zero';
    }
  })() }
];

let passed = 0;
let total = tests.length;

tests.forEach(test => {
  if (test.result) {
    console.log(`✅ ${test.name}: PASSED`);
    passed++;
  } else {
    console.log(`❌ ${test.name}: FAILED`);
  }
});

console.log(`\nTest Summary: ${passed}/${total} tests passed`);
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

if (passed === total) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}
