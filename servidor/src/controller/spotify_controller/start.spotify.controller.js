/* Dependencies */
const colors = require('colors')
const fetch = require('node-fetch')
const geoip = require('geoip-lite');
const publicIp = require('public-ip');
const puppeteer = require('puppeteer-core')
/* DB */
const { getConnection } = require('../../database/database')
/* Constants */
const google = `https://google.com`
const spotify = `https://open.spotify.com`
const urldata = `http://104.244.75.253:7777/api/save-data`
const songsPlayList = 'http://104.244.75.253:7777/api/spotify/list'

/* Utils */
const { getExecutablePath } = require('../../utils/utils')
/* Controller */
let reps = 0
const startCtrl = {}
/* Methods */
startCtrl.start = (req, res) => {
  let reproduction = 0

  const { id } = req.params
  const { reproductions, program, type, username, password, ip, port } = req.query

  if (program === 'manage' && !reproductions && !type) {
    req.flash('api_success', 'Executing "MANAGE" program successfully.')
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
        args: [`--app=${spotify}`, '--window-size=800,600'],
        ignoreDefaultArgs: ['--enable-automation'],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.setViewport({ width: 800, height: 600 });
    }
  }

  if (program === 'work' && reproductions && !type) {
    /* Run */
    req.flash('api_success', 'Executing "WORK" program successfully.')
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
      await page.setViewport({width: 1, height: 1});
      await getData(page, reproductions, browser)

    }
  }

  if (program === 'manage' && type) { 
    req.flash('api_success', 'Executing "MANAGE" program with Proxy successfully.')
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
        `--app=${google}`, 
        '--window-size=800,600',
        `--proxy-server=${ip}:${port}`
      ],
        ignoreDefaultArgs: ['--enable-automation'],
        ...launchOptions
      })
      const [page] = await browser.pages();
      await page.authenticate({ username, password });
      await page.setViewport({ width: 800, height: 600 });
      await page.goto(spotify, { timeout: 0, waitUntil: "networkidle2" })
    }
  }

  if (program === 'work' && reproductions && type) { 
    /* Run */
    req.flash('api_success', 'Executing "WORK" program with Proxy successfully.')
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
      await page.setViewport({width: 1, height: 1});
      await getData(page, reproductions, browser, username, password, ip, port)
    }
  }

  res.redirect('/spotify')

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

      if(await page.$('button._2221af4e93029bedeab751d04fab4b8b-scss._1edf52628d509e6baded2387f6267588-scss') !== null){
        console.log('Closing the browser')
        await browser.close();
      }

      await page.waitFor(5000)

      if (type === 'track') {
        /* Click play button */
        if (await page.$('button._11f5fc88e3dec7bfec55f7f49d581d78-scss') !== null) {
          await page.$eval('button._11f5fc88e3dec7bfec55f7f49d581d78-scss', elem => elem.click());
        }

        await page.waitForSelector('button.control-button.spoticon-play-16.control-button--circled')

        if (await page.$('button.control-button.spoticon-play-16.control-button--circled') !== null) { 
          await page.$eval('button.control-button.spoticon-play-16.control-button--circled', elem => elem.click());
        }

        /* Send data */
        await page.waitFor(120000)
        await page.waitForSelector('h1')
        const id = _id
        const trackname = await page.$eval('a[data-testid="nowplaying-track-link"]', el => el.textContent);
        const tracktime = await page.$eval('span.f1e66e03ba9a9eea0d23aedf0105fe74-scss', el => el.textContent);
        await sendData(id, trackname, tracktime)

        /* Choose if you like it or not */
        if (await page.$('button.control-button.spoticon-heart-16')) {
          const obj = [{action: 'yes'},{action: 'no'},{action: 'no'},{action: 'no'},{action: 'no'},{action: 'no'}]
          const values = Object.values(obj);
          const res = values[parseInt(Math.random() * values.length)]
          if (res.action === 'yes') {
            /* i like */
            await page.$eval('button.control-button.spoticon-heart-16', elem => elem.click());
            /* wait the user profile */
            await page.waitForSelector('a._30d4da6aaba5f863c14acbaebbdd31b7-scss')
            await page.$eval('a._30d4da6aaba5f863c14acbaebbdd31b7-scss', elem => elem.click());
            /* follow user */
            await page.waitForSelector('button.b49b68b14a1771a4cb36313f2b350e84-scss')
            await page.$eval('button.b49b68b14a1771a4cb36313f2b350e84-scss', elem => elem.click());
          }
        }
      }
      if (type === 'list') {
        /* Play playlist */
        if (await page.$('button._11f5fc88e3dec7bfec55f7f49d581d78-scss') !== null) { 
          await page.$eval('button._11f5fc88e3dec7bfec55f7f49d581d78-scss', elem => elem.click());
        }
        /* Save to Your Library */
        if (await page.$('button.a8cc695b476965309a30d01880d6cb01-scss') !== null) { 
          await page.$eval('button.a8cc695b476965309a30d01880d6cb01-scss', elem => elem.click());
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
      service: "spotify",
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
module.exports = startCtrl