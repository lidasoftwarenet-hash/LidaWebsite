const puppeteer = require('c:/temp_test/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const iPhone = puppeteer.KnownDevices['iPhone XR'];
  await page.emulate(iPhone);
  await page.goto('http://127.0.0.1:5500/interview-prep.html');

  // Step 1: Baseline metrics
  const baseline = await page.evaluate(() => {
    let maxEl = null;
    let maxWidth = 0;
    
    document.querySelectorAll('*').forEach(el => {
      // Exclude html, body, and nav elements to find the true content culprit
      if (['HTML', 'BODY', 'SITE-NAV', 'NAV'].includes(el.tagName)) return;
      
      const width = Math.max(el.clientWidth, el.scrollWidth);
      if (width > maxWidth) {
        maxWidth = width;
        maxEl = el;
      }
    });

    const hamburger = document.querySelector('.mobile-menu-toggle');
    const hRect = hamburger ? hamburger.getBoundingClientRect().toJSON() : null;

    return {
      culprit: {
        tag: maxEl ? maxEl.tagName : null,
        id: maxEl ? maxEl.id : null,
        className: maxEl ? maxEl.className : null,
        width: maxWidth
      },
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hamburgerRect: hRect
    };
  });

  console.log('--- Baseline ---');
  console.log(JSON.stringify(baseline, null, 2));

  // Step 2: Apply constraint
  const afterFix = await page.evaluate(() => {
    // Add a global rule to constrain elements that typically overflow
    const style = document.createElement('style');
    style.innerHTML = '.ipt-card, .code-comp-card, .code-box-wrapper, pre, code { max-width: 100vw; overflow-x: auto; } .ipt-practice-layout { min-width: 0; max-width: 100%; } body { max-width: 100vw; overflow-x: hidden; }';
    document.head.appendChild(style);
    
    return new Promise(resolve => {
      setTimeout(() => {
        const hamburger = document.querySelector('.mobile-menu-toggle');
        resolve({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hamburgerRect: hamburger ? hamburger.getBoundingClientRect().toJSON() : null
        });
      }, 100);
    });
  });

  console.log('\n--- After Global Constrain ---');
  console.log(JSON.stringify(afterFix, null, 2));

  await browser.close();
})();
