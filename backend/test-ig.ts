const { instagramGetUrl } = require('instagram-url-direct');

async function test(url) {
  try {
    const res = await instagramGetUrl(url);
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error(e);
  }
}

test('https://www.instagram.com/reel/C2z2aJ_pS0O/');
