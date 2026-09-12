import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { env } from "../../utils/env.js";
import { get } from "node:https";
import path from "node:path";
import { S3} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage"
import { renameFile } from "../../utils/String.js";


export async function uploadS3(s3:S3,filePath:string,buf:Buffer):Promise<string>{
  const up = new Upload({
    client:s3,
    params:{
      ContentType: "image/png" ,
      Bucket:env.AWS_BUCKET_NAME!,
      Key:renameFile(filePath),
      Body:buf
    }
  })
  up.on("httpUploadProgress",console.log)
  const {Location} = await up.done()
  if(!Location) throw new Error("Erro ao enviar ")
  return Location
}
export async function donwload(url: string) {
    console.log(`fazendo o download da imagem ${url}`);
    const res = await fetch(url, {
        method: "GET",
    });
    if (!res.ok) throw new Error(`download failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();

    console.log("download concluido");
    return Buffer.from(arrayBuffer);
}

export async function sendByPOST(blob: Buffer<ArrayBuffer>) {
  console.log("Removendo o fundo da imagem");
  // const url = new URL(env.RMBG_URL);
  const body = new FormData();
  body.append("model", "birefnet-general-lite");
  body.append("af", String(250));
  body.append("ab", String(10));

  // Garantir que o conteúdo é um Buffer/ArrayBuffer e adicionar ao FormData
  const fileData = Buffer.from(blob);

  // Criar um Blob para enviar no multipart/form-data com nome e tipo
  const fileBlob = new Blob([fileData], { type: "image/png" });
  const controller = new AbortController();
  body.append("file", fileBlob, "input.png");
  const response = await fetch(env.RMBG_URL, {
    method: "POST",
    signal: controller.signal,
    headers: {},
    body: body,
  });
  const timeout = setTimeout(controller.abort, 900000);
  console.log(response);
  if (response.ok) {
    clearTimeout(timeout);
    console.log("fundo da imagem fundo removido");
    return await response.blob();
  } else {
    console.error(`${response.status}: ${response.statusText}`);
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}


export async function assertModel() {
    //"../../../../data/.u2net/birefnet-general-lite.onnx"
  const modelPath = path.join(import.meta.dirname, "..", "..", "..", "..","data", ".rembg", "birefnet-general-lite","birefnet-general-lite.onnx" )
  const exist = existsSync(modelPath)

  if (exist) {
    return true
  }

  return new Promise((resolve, reject) => {
    try {
      mkdirSync(path.join(import.meta.dirname, "..", "..", "..", "..","data",".rembg", "birefnet-general-lite"),{
        recursive:true
      })
      const stream = createWriteStream(modelPath)
      get("https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx", (res) => {
        res.pipe(stream)
        stream.on('finish', () => {
          stream.close()
          resolve(true)
        })
        stream.on('error', reject)
      }).on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}