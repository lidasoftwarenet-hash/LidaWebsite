const puppeteer = require('c:/temp_test/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const iPhone = puppeteer.KnownDevices['iPhone XR'];
  await page.emulate(iPhone);
  await page.goto('http://127.0.0.1:5500/interview-prep.html');

  const data = await page.evaluate(() => {
    const wideElements = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.clientWidth > 420 || el.scrollWidth > 420) {
        wideElements.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          text: el.innerText ? el.innerText.substring(0, 30).replace(/\n/g, ' ') : ''
        });
      }
    });
    return wideElements;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
