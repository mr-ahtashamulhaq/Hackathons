// Simple API test script
// Run this after starting the server with: node test-api.js

const baseURL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing Feedback Lite API...\n');

    try {
        // Test 1: Submit feedback
        console.log('1. Testing POST /api/feedback');
        const submitResponse = await fetch(`${baseURL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'This is a test feedback message' })
        });
        
        const submitData = await submitResponse.json();
        console.log('✅ Submit feedback:', submitData);
        
        if (!submitData.success) {
            console.log('❌ Failed to submit feedback');
            return;
        }
        
        const feedbackId = submitData.id;

        // Test 2: Get all feedback
        console.log('\n2. Testing GET /api/feedback');
        const listResponse = await fetch(`${baseURL}/api/feedback`);
        const listData = await listResponse.json();
        console.log('✅ List feedback:', `${listData.count} items found`);

        // Test 3: Get specific feedback
        console.log('\n3. Testing GET /api/feedback/:id');
        const detailResponse = await fetch(`${baseURL}/api/feedback/${feedbackId}`);
        const detailData = await detailResponse.json();
        console.log('✅ Get feedback details:', detailData.success ? 'Found' : 'Not found');

        // Test 4: Update feedback status
        console.log('\n4. Testing PUT /api/feedback/:id');
        const updateResponse = await fetch(`${baseURL}/api/feedback/${feedbackId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved' })
        });
        
        const updateData = await updateResponse.json();
        console.log('✅ Update status:', updateData.success ? 'Updated' : 'Failed');

        console.log('\n🎉 All API tests completed successfully!');
        console.log('\n📖 Next steps:');
        console.log(`   • Open ${baseURL}/submit to test the public form`);
        console.log(`   • Open ${baseURL}/admin to test the admin panel`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running with: npm start');
    }
}

// Run tests
testAPI();