import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const sample=path.resolve('../juno-website-studio/Fieldnotes');fs.mkdirSync(sample,{recursive:true});
fs.writeFileSync(sample+'/bookshop.js',`const books = [
  { title: "A Field Guide to Getting Lost", author: "Rebecca Solnit" },
  { title: "The Summer Book", author: "Tove Jansson" },
  { title: "A Month in the Country", author: "J. L. Carr" },
];

export function bookCard(book) {
  const card = document.createElement("article");
  const title = document.createElement("h2");
  const author = document.createElement("p");

  title.textContent = book.title;
  author.textContent = book.author;
  card.append(title, author);

  return card;
}

export function renderShelf(container) {
  container.replaceChildren(...books.map(bookCard));
}
`);
fs.writeFileSync(sample+'/README.md','# Fieldnotes\n\nA small neighborhood bookshop. Good books, a note in every one.\n');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9331');
const page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('5271'));
await page.keyboard.press('Escape');
const buttons=await page.getByRole('button').all();
console.log('Buttons',await page.getByRole('button').allTextContents());
const result=await page.evaluate(async(projectRoot)=>{
 const {bots}=await fetch('/api/bots').then(r=>r.json());const seoul=bots.find(b=>b.name==='Seoul');
 return window.ogb.codeRuntime.openWorkspace({conversationId:seoul.threadId,projectRoot,botId:seoul.id,title:'Build the bookshop',workspaceTab:'files'});
},sample);
console.log('Workspace opened',JSON.stringify(result).slice(0,1800));
await page.getByRole('button',{name:/Seoul Code/}).click();
await page.getByRole('button',{name:'Code',exact:true}).click();
console.log((await page.locator('body').innerText()).slice(-6000));
await page.screenshot({path:'evidence/code-stage-inspect.png'});
await browser.close();
