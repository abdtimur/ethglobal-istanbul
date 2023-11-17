import * as Comlink from "comlink";
import init, { initThreadPool, prover } from "@pages/client";

export class Prover {
  constructor() {
    console.log("client: initiated");
  }

  async prover(inputJSONStr: string): Promise<string> {
    console.log("client: prover started");

    const numConcurrency = navigator.hardwareConcurrency;
    console.log("client: navigator.hardwareConcurrency:", numConcurrency);

    await init();
    await initThreadPool(numConcurrency);

    const result = await prover(inputJSONStr);
    console.log("client: result:", result);

    return result;
  }
}

Comlink.expose(Prover);
