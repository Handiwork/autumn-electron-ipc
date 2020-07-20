import { r2mApi, m2rApi } from "../common";
import { API } from '../../lib';

class Listener implements API<typeof m2rApi.manifest>{
    async hello(param: string[]) {
        return `hello ${param.join(",")}`
    }
}

export async function bootstrap(log:(string)=>void) {
    const client = r2mApi.getClient()
    const listener = new Listener()
    m2rApi.plugInRenderer(listener)
    log(`client.hello("Autumn"): ${await client.hello("Autumn")}`)
    log(`client.hello(): ${await client.hello()}`)
    log(`client.complex({ f1: "nine", f2: 9 })}: ${JSON.stringify(await client.complex({ f1: "nine", f2: 9 }))}`)
    log(`client.sigOk(): ${await client.sigOk()}`)
}