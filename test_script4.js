const puppeteer = require('c:/temp_test/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const iPhone = puppeteer.KnownDevices['iPhone XR'];
  await page.emulate(iPhone);
  await page.goto('http://127.0.0.1:5500/interview-prep.html');

  const afterFix = await page.evaluate(() => {
    // Only apply body width constraint
    document.body.style.width = '100vw';
    document.body.style.overflowX = 'hidden';
    
    return new Promise(resolve => {
      setTimeout(() => {
        const hamburger = document.querySelector('.mobile-menu-toggle');
        resolve({
          innerWidth: window.innerWidth,
          hamburgerRect: hamburger ? hamburger.getBoundingClientRect().toJSON() : null
        });
      }, 100);
    });
  });

  console.log('--- Body width: 100vw, overflow-x: hidden ---');
  console.log(JSON.stringify(afterFix, null, 2));

  await browser.close();
})();
