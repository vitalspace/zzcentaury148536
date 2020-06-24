/* Despendencies */
const colors = require('colors')
const fetch = require('node-fetch')
const geoip = require('geoip-lite')
const publicIp = require('public-ip')
const puppeteer = require('puppeteer-core')
/* DB */
const { getConnection } = require('../../database/database')
/* Constants */
const google = `https://google.com`
const deezer = `https://www.deezer.com/`
const urldata = `http://104.244.75.253:7777/api/save-data`
const songsPlayList = `http://104.244.75.253:7777/api/deezer/list`
/* Utils */
const { getExecutablePath } = require('../../utils/utils')
/* Controller */
let reps = 0
const startCtrl = {}
/* Methods */
startCtrl.start = (req, res) => {

  const { id, name } = req.params
  const { reproductions, program, type, username, password, ip, port } = req.query

  /* Local */

  if (program === 'manage' && !reproductions && !type) {
    req.flash('api_success', `Running the "Manage" program with the User: ${name}`)
    run()
    async function run() {
      const executablePath = await getExecutablePath({});
      await manage({ executablePath });
      await console.log('Executing the Manage program:'.green, id.yellow);
    }
    const manage = async launchOptions => {
      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: `${id}`,
        args: [`--app=${deezer}`, '--window-size=800,600'],
        ignoreDefaultArgs: ['--enable-automation'],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.setViewport({ width: 800, height: 600 });
    }
  }

  if (program === 'work' && reproductions && !type) {
    /* Run */
    req.flash('api_success', `Running the "Work" program with the User: ${name}`)
    run()
    async function run() {
      const executablePath = await getExecutablePath({});
      await manage({ executablePath });
      await console.log('Executing the Work program'.yellow);
    }

    const manage = async launchOptions => {
      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: `${id}`,
        defaultViewport: false,
        args: [
          `--app=${google}`,
          '--window-size=1,1',
          '--disable-audio-output',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.setViewport({ width: 1, height: 1 });
      await getData(page, reproductions, browser)
    }
  }

  /* Proxy */

  if (program === 'manage' && type) {
    req.flash('api_success', `Running the "Manage" program with the User: ${name}`)
    run()
    async function run() {
      const executablePath = await getExecutablePath({});
      await manage({ executablePath });
      await console.log('Executing the Manage program:'.green, id.yellow);
    }
    const manage = async launchOptions => {
      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: `${id}`,
        args: [
          `--app=${deezer}`, 
          '--window-size=800,600',
          `--proxy-server=${ip}:${port}`
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.authenticate({ username, password });
      await page.setViewport({ width: 800, height: 600 });
    }
  }

  if (program === 'work' && reproductions && type) {
    req.flash('api_success', `Running the "Work" program with the User: ${name}`)
    /* Run */
    run()
    async function run() {
      const executablePath = await getExecutablePath({});
      await manage({ executablePath });
      await console.log('Executing the Work program'.yellow);
    }

    const manage = async launchOptions => {
      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: `${id}`,
        defaultViewport: false,
        args: [
          `--app=${google}`,
          '--window-size=1,1',
          '--disable-audio-output',
          `--proxy-server=${ip}:${port}`,
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.authenticate({ username, password });
      await page.setViewport({ width: 1, height: 1 });
      await getData(page, reproductions, browser, username, password, ip, port)
    }
  }

  res.redirect('/deezer')

}

async function getData(page, reproductions, browser) {
  try {
    const token = getConnection().get('token').value()
    const response = await fetch(songsPlayList, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token[0]}`
      }
    });
    const json = await response.json();

    for await (const i of json) {
      const { _id, time, type } = i
      const track = i.link
      /* Verify if resp and reproductions are equals */
      reps += 1;
      if (reps > reproductions) {
        await browser.close();
        reps = 0;
        break;
      }
      /* GoTo for list */
      await page.goto(track, { timeout: 0, waitUntil: "networkidle2" });
 
      if (await page.$('a.navbar-btn.navbar-btn-login') !== null){
        console.log('Closing the browser')
        await browser.close();
      }

      await page.waitFor(5000)
      /* If is track */
      if (type === 'track') {
        /* Click play button */
        if (await page.$('button.action-item-btn.action-force')) {
          await page.$eval('button.action-item-btn.action-force', elem => elem.click())
        }

        /* Send data */
        await page.waitFor(120000)
        await page.waitForSelector('h1')
        const id = _id
        const trackname = await page.$eval('h1', el => el.textContent);
        const tracktime = await page.$eval('li.header-info-item', el => el.textContent);
        await sendData(id, trackname, tracktime)

        /* Choose if you like it or not */
        if (await page.$('div.states-button-action.is-active')) {
          const obj = [{ action: 'yes' }, { action: 'no' }, { action: 'no' }, { action: 'no' }, { action: 'no' }, { action: 'no' }]
          const values = Object.values(obj);
          const res = values[parseInt(Math.random() * values.length)]
          console.log(res.action)
          if (res.action === 'yes') {
            /* i like */
            await page.$eval('button.root-0-3-1.containedSecondary-0-3-10', elem => elem.click());
            /* wait the user profile */
            await page.waitForSelector('a.heading-link')
            await page.$eval('a.heading-link', elem => elem.click());
            /* follow user */
            await page.waitForSelector('button.root-0-3-1.containedSecondary-0-3-10')
            await page.$eval('button.root-0-3-1.containedSecondary-0-3-10', elem => elem.click());
          }
        }

      }
      /* If is playlist */
      if (type === 'list') {
        /* Play playlist */
        if (await page.$('button.action-item-btn.action-force') !== null) {
          await page.$eval('button.action-item-btn.action-force', elem => elem.click());
        }
        /* Save to Your Library */
        if (await page.$('div.states-button-action.is-active') !== null) {
          await page.$eval('button.root-0-3-1.containedSecondary-0-3-10', elem => elem.click());
        }
      }
      await page.waitFor(time)
    }
  } catch (error) {
    console.log(error);
  }
};

async function sendData(id, trackname, tracktime, username, password, ip, port) {

  /* Load Token */
  const token = getConnection().get('token').value()[0];

  /* Local */
  if (!username && !password && !ip && !port) {

    const localip = await publicIp.v4()
    const geo = geoip.lookup(localip);
    const { country, region, timezone, city } = geo

    const body = {
      service: "deezer",
      id,
      ip: localip,
      city,
      region,
      country,
      timezone,
      trackname,
      tracktime
    }
    const response = await fetch(urldata, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      },
    });

    const json = await response.json();
    console.log(json)

    if (json.error) {
      // fs.removeSync(pathToken);
      // res.redirect('/spotify');
    }
  }

  /* Proxy */
  if (username && password && ip && port) {

    const geo = geoip.lookup(ip);
    const { country, region, timezone, city } = geo

    const body = {
      service: "deezer",
      id,
      ip,
      city,
      region,
      country,
      timezone,
      trackname,
      tracktime
    }

    const response = await fetch(urldata, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      },
    });

    const json = await response.json();
    console.log(json)

    if (json.error) {
      // fs.removeSync(pathToken);
      // res.redirect('/spotify');
    }
  }
  
}
/* Exports */
module.exports = startCtrl