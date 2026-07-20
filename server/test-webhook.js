

async function testWebhook() {
  const payload = {
    commits: [
      {
        id: "7d0d12799307d8cc98cd4a1239bf098491c13d85",
        message: "Added GitHub Webhook Integration. Fixes WR-114",
        author: {
          name: "John Doe",
          username: "johndoe"
        },
        url: "https://github.com/org/repo/commit/7d0d12799307d8cc98cd4a1239bf098491c13d85"
      },
      {
        id: "e54736f98129cc88a6d45903b44b8026cc9a1d4a",
        message: "Minor styling fix for WR-114 detail panel",
        author: {
          name: "Jane Smith",
          username: "jsmith"
        },
        url: "https://github.com/org/repo/commit/e54736f98129cc88a6d45903b44b8026cc9a1d4a"
      }
    ]
  };

  try {
    const res = await fetch('http://localhost:5000/api/github/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'push'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Webhook Response:', await res.json());
  } catch (e) {
    console.error('Error:', e);
  }
}

testWebhook();
