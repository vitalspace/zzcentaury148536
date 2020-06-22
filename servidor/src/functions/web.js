'use strict'
/* Dependencies */
const fetch = require('node-fetch')
const puppteer = require('puppeteer-core')
/* DB */
const { getConnection } = require('../database/database')
/* Constants */
const google = 'https://google.com'
const list = 'http://104.244.75.253:7777/api/web/list'
/* Utils */
const { getExecutablePath } = require('../utils/utils')
/* Settings */

const run = async () => {
  const executablePath = await getExecutablePath()
  await lauchpuppeteer({ executablePath })
}

const lauchpuppeteer = async lauchOptions => {
  const browser = await puppteer.launch({
    headless: true,
    args: [
      `--app=${google}`,
      // '--window-size=1,1',
      '--disable-audio-output',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    ...lauchOptions
  })
  const [page] = await browser.pages()
  await page.setViewport({ width: 200, height: 200 });
  await getData(page, browser)
}


async function getData(page, browser) {
  try {
    const token = getConnection().get('token').value()
    const response = await fetch(list, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token[0]}`
      }
    });
    const json = await response.json();

    for await (const i of json) {
      const { type, link, time } = i

      if (type === 'web') {

        await page.goto(link, { timeout: 0, waitUntil: "networkidle2" })
        await page.click('body')

        browser.on('targetcreated', async (target) => {
          if (target.type() === 'page') {
            const page = await target.page();
            const url = page.url();
            if (url.search(`${link}`) == -1) {
              await page.waitFor(10000)
              await page.close();
            }
          }
        });



        await page.waitFor(10000)

        /* Choose if you like it or not */
        if (await page.$('iframe[src="about:blank"]') !== null) {
          const obj = [{ action: 'yes' }, { action: 'yes' }, { action: 'no' }, { action: 'no' }, { action: 'no' }, { action: 'no' }]
          const values = Object.values(obj);
          const res = values[parseInt(Math.random() * values.length)]
          console.log('pasando por adsterra', res.action)
          if (res.action === 'yes') {
            const iframe = await page.$('iframe[src="about:blank"]');
            const frame = await iframe.contentFrame();
            const button = await frame.$('a');
            button.click();
          }
        } 

        if (await page.$('iframe[src="https://cdn.tubecorp.com/i/b.html?spot=1056&src=512777893&pid=27340&width=728&height=90&spaceid=861"]') !== null) { 
          const obj = [{ action: 'yes' }, { action: 'yes' }, { action: 'no' }, { action: 'no' }, { action: 'no' }, { action: 'no' }]
          const values = Object.values(obj);
          const res = values[parseInt(Math.random() * values.length)]
          console.log('pasando por tube', res.action)
          if (res.action === 'yes') {
            const iframe = await page.$('iframe[src="https://cdn.tubecorp.com/i/b.html?spot=1056&src=512777893&pid=27340&width=728&height=90&spaceid=861"]');
            iframe.click();
          }
        }

        if (await page.$('.clickme') !== null) {
          await page.$eval('.clickme', elem => elem.click());
          await page.waitFor(10000)
          await page.$eval('.clickme', elem => elem.click());
          await page.waitFor(10000)
          await page.$eval('.clickme', elem => elem.click());
          await page.waitFor(10000)
          await page.$eval('.clickme', elem => elem.click());
          await page.waitFor(10000)
          await page.$eval('.clickme', elem => elem.click());
        }

      }
      await page.waitFor(time)
    }
  } catch (error) {
    console.log(error)
  }
}


module.exports = run