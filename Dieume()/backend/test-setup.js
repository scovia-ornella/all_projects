// Test script to verify backend setup
const { testConnection, syncDatabase } = require('./models');

async function testSetup() {
  console.log(' Testing SmartPark SIMS Backend Setup...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await testConnection();
    
    // Test database sync
    console.log('2. Testing database synchronization...');
    await syncDatabase();
    
    console.log('\n✅ All tests passed! Backend setup is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend server: cd ../frontend-project && npm run dev');
    console.log('   3. Open http://localhost:5173 in your browser');
    console.log('   4. Login with username: admin, password: admin123');
    
  } catch (error) {
    console.error('\n Setup test failed:', error.message);
    console.log('\n Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check database credentials in .env file');
    console.log('   3. Ensure database "smartpark_sims" exists');
    process.exit(1);
  }
  
  process.exit(0);
}

testSetup();
