import fs from 'node:fs/promises';
import { chromium } from 'playwright';
const folder='evidence/refinement-before';await fs.mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const metrics={};
for(const [name,url,feature] of [
 ['grok','https://x.ai/bot','Message Bots like teammates'],
 ['maus','https://mausbot.com/','Work with a whole team of bots'],
 ['chatgpt','https://chatgpt.com/download/','Download ChatGPT for mobile']
]){
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  const reject=page.getByRole('button',{name:'Reject All',exact:true});if(await reject.count())await reject.click();
  await page.screenshot({path:folder+'/'+name+'-hero.png'});
  const heading=page.getByRole('heading',{name:feature,exact:true});
  if(await heading.count()){await heading.scrollIntoViewIfNeeded();await page.screenshot({path:folder+'/'+name+'-feature.png'})}
  metrics[name]={url,title:await page.title(),headings:await page.locator('h1,h2').allTextContents()};
 }catch(e){metrics[name]={url,error:String(e)}}
}
for(const [name,width,height] of [['laptop',1366,768],['mobile',390,844]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5272/');
 await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].filter(i=>i.src).map(i=>i.decode().catch(()=>{})))});
 metrics[name]=await page.evaluate(()=>({height:document.body.scrollHeight,viewport:innerHeight,sections:[...document.querySelectorAll('main>section')].map(e=>({heading:e.querySelector('h1,h2')?.textContent?.trim(),height:Math.round(e.getBoundingClientRect().height)}))}));
 await page.screenshot({path:folder+'/juno-'+name+'-hero.png'});
 for(const [section,selector] of [['companions','#companions'],['conversation','#features'],['panels','.capability-grid'],['code','#code'],['teams','.team-layout'],['studio','.studio-layout'],['closing','#availability']]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.screenshot({path:folder+'/juno-'+name+'-'+section+'.png'});
 }
}
await browser.close();await fs.writeFile(folder+'/comparison.json',JSON.stringify(metrics,null,2));
console.log(JSON.stringify(metrics,null,2));
