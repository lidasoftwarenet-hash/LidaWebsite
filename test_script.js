const puppeteer = require('c:/temp_test/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const iPhone = puppeteer.KnownDevices['iPhone XR'];
  await page.emulate(iPhone);
  await page.goto('http://127.0.0.1:5500/interview-prep.html');

  const data = await page.evaluate(() => {
    const el = document.querySelector('.mobile-menu-toggle');
    if (!el) return null;
    
    const result = {
      navHeaderRect: document.querySelector('.nav-header').getBoundingClientRect().toJSON(),
      bodyWidth: document.body.clientWidth,
      htmlWidth: document.documentElement.clientWidth,
      viewportWidth: window.innerWidth,
      ancestors: []
    };

    let curr = el.parentElement;
    while(curr && curr !== document) {
      const style = window.getComputedStyle(curr);
      result.ancestors.push({
        tag: curr.tagName,
        id: curr.id,
        className: curr.className,
        overflowX: style.overflowX,
        overflow: style.overflow,
        transform: style.transform,
        width: style.width,
        rect: curr.getBoundingClientRect().toJSON()
      });
      curr = curr.parentElement;
    }
    return result;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
