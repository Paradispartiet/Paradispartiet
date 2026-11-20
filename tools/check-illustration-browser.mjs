/**
 * Målrettet visuell QA: hvert motiv skal vises på ett konkret sted.
 * Kjør på GitHub Actions; bilder lastes fra lokal GitHub Pages-lignende server.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:8765/Paradispartiet/";
const plan = JSON.parse(fs.readFileSync("docs/ILLUSTRASJONSPLAN.json","utf8"));
const pages = [...new Set(plan.images.map(x=>x.page))];
const expectedByPage = Object.groupBy(plan.images, x=>x.page);
const devices=[
  ["mobile",{width:390,height:844}],
  ["ipad",{width:820,height:1180}],
  ["desktop",{width:1440,height:900}]
];
const errors=[];
fs.mkdirSync("illustration-screenshots",{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for(const [device,viewport] of devices) {
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/,route=>route.abort());
    const globallyUsed=new Map();
    for(const filename of pages) {
      const response=await page.goto(base+filename,{waitUntil:"domcontentloaded",timeout:30000});
      if(!response?.ok()) {errors.push(device+" "+filename+": status "+response?.status());continue}
      const selector=".vision-home-image, .vision-page-image, .vision-banner-image, .vision-card-art, .vision-topic-art";
      const images=page.locator(selector);
      const expected=expectedByPage[filename]||[];
      const count=await images.count();
      if(count!==expected.length) errors.push(device+" "+filename+": forventet "+expected.length+" men fant "+count+" illustrasjoner");
      const seenOnPage=new Set();
      for(let i=0;i<count;i++){
        const node=images.nth(i);
        const info=await node.evaluate(img=>({
          name:decodeURIComponent(new URL(img.src).pathname.split("/").pop().replace(".webp","")),
          src:img.src,alt:img.alt,loading:img.loading
        }));
        if(!expected.some(x=>x.id===info.name)) errors.push(device+" "+filename+": ikke-planlagt bilde "+info.name);
        if(seenOnPage.has(info.name)) errors.push(device+" "+filename+": bildegjenbruk på samme side: "+info.name);
        seenOnPage.add(info.name);
        if(globallyUsed.has(info.name)) errors.push(device+": bildet "+info.name+" brukes både på "+globallyUsed.get(info.name)+" og "+filename);
        globallyUsed.set(info.name,filename);
        if(!info.alt.trim()) errors.push(device+" "+filename+": mangler forklarende alt-tekst for "+info.name);
        try{
          await node.scrollIntoViewIfNeeded({timeout:8000});
          const dims=await node.evaluate(async img=>{await img.decode();return {width:img.naturalWidth,height:img.naturalHeight}});
          if(dims.width<900||dims.height<500) errors.push(device+" "+filename+": uventet lite motiv "+info.name);
        }catch(e){errors.push(device+" "+filename+": bilde ikke synlig eller lastet "+info.name+" "+e.message.slice(0,90))}
      }
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      if(overflow>3) errors.push(device+" "+filename+": horisontal scroll "+overflow+" px");
      if(["index.html","politikk.html","prosjekter.html","om.html","Prosjekter/GlassHus.html","Prosjekter/BilfriBy.html"].includes(filename)){
        await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await page.screenshot({
          path:"illustration-screenshots/"+device+"-"+filename.replaceAll("/","-").replace(".html","")+".png",
          fullPage:false
        });
      }
      console.log(device,filename,"planlagt",expected.length,"funnet",count,"overflow",overflow);
    }
    if(globallyUsed.size!==plan.images.length)
      errors.push(device+": forventet "+plan.images.length+" unike motiv men fant "+globallyUsed.size);
    await page.close();
  }
}finally{await browser.close()}
if(errors.length){console.error("Bildekontroll feilet:\n"+errors.map(x=>" - "+x).join("\n"));process.exitCode=1;}
else console.log("OK: "+plan.images.length+" bilder brukt nøyaktig én gang på hver av tre skjermstørrelser.");
