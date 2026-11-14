import fs from 'node:fs/promises';
await fs.mkdir('evidence/story-refinement', { recursive: true });
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true,args:['--no-proxy-server']});
const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await p.goto('http://127.0.0.1:5275/');await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:'evidence/story-refinement/desktop.png'});
for(const t of ['0','7','18']){await p.locator(`[data-story-time="${t}"]`).click();assert.equal(await p.locator(`[data-story-time="${t}"]`).getAttribute('aria-pressed'),'true');assert(Math.abs(await p.locator('video').evaluate(v=>v.currentTime)-Number(t))<.5);}
await p.waitForFunction(()=>!document.querySelector('video').seeking);await p.locator('#demo').scrollIntoViewIfNeeded();await p.screenshot({path:'evidence/story-refinement/story.png'});
for(const depth of ['quick','standard','deep']){await p.locator(`[data-depth="${depth}"]`).click();assert.equal(await p.locator(`[data-depth="${depth}"]`).getAttribute('aria-pressed'),'true');}
for(const [name,href] of [['Seoul','#code'],['Toronto','#feature-routines'],['Kyoto','#demo']]){await p.getByRole('button',{name,exact:true}).click();assert.equal(await p.locator('#companion-destination').getAttribute('href'),href);}
for(const selector of ['.routine-feature','.results-feature','#availability']){await p.locator(selector).scrollIntoViewIfNeeded();await p.screenshot({path:`evidence/story-refinement/${selector.replace(/[^a-z]/g,'')}.png`});}
await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:5275/');await p.screenshot({path:'evidence/story-refinement/mobile.png'});
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await b.close();console.log('Story seeking, research explanations, companion paths and mobile overflow checks passed.');
