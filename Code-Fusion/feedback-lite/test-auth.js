const fetch = require('node-fetch');

async function testAuthSystem() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Testing Authentication System...\n');
    
    try {
        // Test 1: Try accessing admin without login (should redirect or fail)
        console.log('Test 1: Accessing admin without authentication...');
        const adminResponse = await fetch(`${baseURL}/admin`, { 
            redirect: 'manual' 
        });
        if (adminResponse.status === 302) {
            console.log('✅ Admin route properly redirects unauthenticated users');
        } else {
            console.log('❌ Admin route should redirect unauthenticated users');
        }
        
        // Test 2: Try accessing admin API without login
        console.log('\nTest 2: Accessing admin API without authentication...');
        const apiResponse = await fetch(`${baseURL}/api/feedback`);
        if (apiResponse.status === 401) {
            console.log('✅ Admin API properly blocks unauthenticated requests');
        } else {
            console.log('❌ Admin API should block unauthenticated requests');
        }
        
        // Test 3: Login with wrong password
        console.log('\nTest 3: Login with incorrect password...');
        const wrongLoginResponse = await fetch(`${baseURL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'wrong-password' })
        });
        if (wrongLoginResponse.status === 401) {
            console.log('✅ Login correctly rejects wrong password');
        } else {
            console.log('❌ Login should reject wrong password');
        }
        
        // Test 4: Login with correct password
        console.log('\nTest 4: Login with correct password...');
        const correctLoginResponse = await fetch(`${baseURL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'admin123' })
        });
        if (correctLoginResponse.status === 200) {
            const loginData = await correctLoginResponse.json();
            if (loginData.success) {
                console.log('✅ Login successful with correct password');
            } else {
                console.log('❌ Login should succeed with correct password');
            }
        } else {
            console.log('❌ Login failed with correct password');
        }
        
        console.log('\n🎉 Authentication system tests completed!');
        console.log('\n📝 Manual testing instructions:');
        console.log('1. Go to http://localhost:3000/admin (should redirect to login)');
        console.log('2. Go to http://localhost:3000/admin/login');
        console.log('3. Try wrong password (should show error)');
        console.log('4. Use password: admin123 (should login successfully)');
        console.log('5. Access admin panel and try logout');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure the server is running: node server.js');
    }
}

// Run tests
testAuthSystem();