const currentUrl = "https://replit.com/@vincentmurakami/Fb-messenger-#readme.md " // copy your repl url here on the up current url example https://replit.com/@hutchinsharold1/PUPPETEER-UPTIME-OPEN-SOURCE-INDEXJS-ONLY#index.js
const uptimeUrl = "https://0d9bec28-cb3d-4479-98ff-14f865d4a6ec-00-1kw637dix9x8e.sisko.replit.dev/"; //make the repl file is running already 
const fs = require('fs');
const path = require('path');
const freeport = require('freeport');
const ProxyChain = require('proxy-chain');
const puppeteer = require('puppeteer-core');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');
const express = require('express');

const app = express();
const port = 3000;
const screenshotPath = path.join(__dirname, 'screenshot.jpg');

let browser, page, newTab;

async function run() {
  freeport(async (err, proxyPort) => {
    if (err) {
      console.error('Error finding free port:', err);
      return;
    }

    const proxyServer = new ProxyChain.Server({ port: proxyPort });

    proxyServer.listen(async () => {
      const { stdout: chromiumPath } = await promisify(exec)("which chromium");

      browser = await puppeteer.launch({
        headless: false,
        executablePath: chromiumPath.trim(),
        ignoreHTTPSErrors: true,
        args: [
          '--ignore-certificate-errors',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          `--proxy-server=127.0.0.1:${proxyPort}`
        ]
      });

      page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7;en-us) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Safari/530.17");

      const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
      await page.setCookie(...cookies);

      await page.goto(uptimeUrl, { waitUntil: 'networkidle2' });

      newTab = await browser.newPage();
      await newTab.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7;en-us) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Safari/530.17");
      await newTab.setCookie(...cookies);
      await newTab.goto(currentUrl, { waitUntil: 'networkidle2' });

      await page.screenshot({ path: screenshotPath, type: 'jpeg' });

      app.get('/ss', async (req, res) => {
        try {
          res.sendFile(screenshotPath);
        } catch (err) {
          console.error('Error sending screenshot:', err);
          res.status(500).send('Error sending screenshot');
        }
      });

      app.listen(port, () => {
        console.log(`Express server listening on port ${port}`);
      });

      console.log('Browser is running. Press Ctrl+C to exit.');
    });
  });
}

run();
//big thanks Johnsteve A.K.A Choru to idea about puppeteer module npm since planning about that puppeteer core module to uptime the replit without Deployment paid thanks me later and supports our chatbot community 