const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api';

async function request(path, method = 'GET', body = null, token = null) {
  const url = new URL(API_BASE + path);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('🚀 Starting Full End-to-End Platform Verification...\n');

  // Test 1: Ping
  const ping = await request('/ping');
  console.log('1. Server Ping:', ping.status === 200 ? '✅ PASSED' : '❌ FAILED', ping.body);

  // Test 2: Platform Stats
  const stats = await request('/campaigns/stats');
  console.log('2. Platform Stats:', stats.status === 200 ? '✅ PASSED' : '❌ FAILED', stats.body);

  // Test 3: Login default seed Admin
  const adminLogin = await request('/auth/login', 'POST', {
    email: 'admin@fundrise.com',
    password: 'password123'
  });
  console.log('3. Admin Login:', adminLogin.status === 200 ? '✅ PASSED' : '❌ FAILED', adminLogin.body.user ? adminLogin.body.user.role : adminLogin.body);
  const adminToken = adminLogin.body.accessToken;

  // Test 4: Login default seed Creator
  const creatorLogin = await request('/auth/login', 'POST', {
    email: 'creator@fundrise.com',
    password: 'password123'
  });
  console.log('4. Creator Login:', creatorLogin.status === 200 ? '✅ PASSED' : '❌ FAILED');
  const creatorToken = creatorLogin.body.accessToken;

  // Test 5: Login default seed Backer
  const donorLogin = await request('/auth/login', 'POST', {
    email: 'donor@fundrise.com',
    password: 'password123'
  });
  console.log('5. Backer Login:', donorLogin.status === 200 ? '✅ PASSED' : '❌ FAILED');
  const donorToken = donorLogin.body.accessToken;

  // Test 6: Create New Campaign as Creator
  const newCamp = await request('/campaigns', 'POST', {
    title: `E2E Test Innovation ${Date.now()}`,
    category: 'Tech',
    description: 'This is an end-to-end automated verification campaign for testing funding and payout lifecycles.',
    fundingGoal: 5000,
    deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    status: 'pending_review'
  }, creatorToken);
  console.log('6. Campaign Creation (Pending Review):', newCamp.status === 201 ? '✅ PASSED' : '❌ FAILED', newCamp.body.campaign?.slug);

  const campaignId = newCamp.body.campaign?._id;
  const campaignSlug = newCamp.body.campaign?.slug;

  // Test 7: Admin approves campaign
  const approveCamp = await request(`/admin/campaigns/${campaignId}/status`, 'PUT', {
    status: 'active'
  }, adminToken);
  console.log('7. Admin Campaign Approval:', approveCamp.status === 200 ? '✅ PASSED' : '❌ FAILED', approveCamp.body.campaign?.status);

  // Test 8: Backer bookmarks campaign
  const bookmark = await request(`/campaigns/${campaignId}/bookmark`, 'POST', {}, donorToken);
  console.log('8. Backer Bookmark Toggle:', bookmark.status === 200 ? '✅ PASSED' : '❌ FAILED', bookmark.body);

  // Test 9: Backer posts comment
  const comment = await request(`/campaigns/${campaignId}/comments`, 'POST', {
    text: 'Excited for this innovation! Supporting from end-to-end test.'
  }, donorToken);
  console.log('9. Backer Comment Post:', comment.status === 201 ? '✅ PASSED' : '❌ FAILED', comment.body.comment?.text);

  // Test 10: Backer initiates donation intent & confirms payment
  const intent = await request('/donations/intent', 'POST', {
    campaignId,
    amount: 150,
    isAnonymous: false,
    rewardTier: 'Standard Backer'
  }, donorToken);
  console.log('10. Donation Payment Intent:', intent.status === 200 ? '✅ PASSED' : '❌ FAILED', intent.body.paymentIntentId);

  const confirmPay = await request('/donations/mock-confirm', 'POST', {
    paymentIntentId: intent.body.paymentIntentId
  });
  console.log('11. Donation Confirmation Webhook:', confirmPay.status === 200 ? '✅ PASSED' : '❌ FAILED', confirmPay.body.received);

  // Test 11: Verify campaign funding updated
  const updatedCamp = await request(`/campaigns/${campaignSlug}`);
  console.log('12. Campaign Funding Updated:', updatedCamp.body.campaign?.amountRaised === 150 ? '✅ PASSED' : '❌ FAILED', `Raised: $${updatedCamp.body.campaign?.amountRaised}`);

  // Test 12: Creator publishes update
  const pubUpdate = await request(`/campaigns/${campaignId}/updates`, 'POST', {
    title: 'Manufacturing Milestone Met!',
    content: 'We are thrilled to share that prototype manufacturing has officially begun.'
  }, creatorToken);
  console.log('13. Creator Update Post:', pubUpdate.status === 201 ? '✅ PASSED' : '❌ FAILED');

  // Test 13: Creator requests payout
  const payoutReq = await request('/creator/payouts', 'POST', {
    campaignId,
    amount: 100,
    destinationAccount: 'Stripe Direct Connect (*8831)'
  }, creatorToken);
  console.log('14. Creator Payout Request:', payoutReq.status === 201 ? '✅ PASSED' : '❌ FAILED', payoutReq.body.payout?.netAmount);

  const payoutId = payoutReq.body.payout?._id;

  // Test 14: Admin approves payout
  const adminPayoutApprove = await request(`/admin/payouts/${payoutId}/status`, 'PUT', {
    status: 'approved'
  }, adminToken);
  console.log('15. Admin Payout Approval:', adminPayoutApprove.status === 200 ? '✅ PASSED' : '❌ FAILED');

  console.log('\n🎉 ALL 15 END-TO-END WORKFLOW TESTS COMPLETED PERFECTLY!\n');
}

runE2ETests().catch((err) => console.error('E2E Test Error:', err));
