import { exit } from "node:process";
import { RemoverFundoProduto, rmQuee } from "../../utils/quee.js";
import "./worker.js"
import { db } from "../../utils/db.js";
import { produtos } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
await db.delete(produtos).where(eq(produtos.id, 9000))
const [data] = await db.insert(produtos).values([{
    id:9000,
    idTipo:1,
    precoCentavos:1,
    slug:"testwe",
    imagemPrincipal:"https://raw.githubusercontent.com/Eeu2005/Eeu2005/main/Logo/EuLogo.png",
    nome:"TESTE",
    descricao:"TESTE"
}]).returning()

let job = await rmQuee.add(
    `rmBG-${data.id}`,
    { idProduto:data.id },
  );
  let _= "1"
setInterval(async()=>{
    let a =  await rmQuee.getJob(job.id!)
    if(!a) exit()
    if(_==a.progress) return
    _=a.progress.toString()
    if(a.progress==100||await a.isCompleted()) { 
        db.delete(produtos).where(eq(produtos.id,data.id))
        exit()
    }
    console.log({
        progress: a.progress,
        json: a.asJSON()
    })
},100)