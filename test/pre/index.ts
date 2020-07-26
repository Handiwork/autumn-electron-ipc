import { r2mApi, m2rApi, r2mApiTs, APIRenderer, m2rApiTs } from "../common";
import { checkApiImpl } from '../../lib';

class RendererServer implements APIRenderer {
    hello(who: string[]): string {
        return who.join(" array ")
    }

}

export async function bootstrap(log: (arg: string) => void) {
    const listener = checkApiImpl(m2rApi.manifest, {
        async hello(param: string[]) {
            return `hello ${param.join(",")}`
        }
    })
    m2rApi.plugInRenderer(listener)
    m2rApiTs.plugInRenderer(new RendererServer())
    const client = r2mApi.getClient()
    log(`client.hello("Autumn"): ${await client.hello("Autumn")}`)
    log(`client.hello(): ${await client.hello()}`)
    log(`client.complex({ f1: "nine", f2: 9 })}: ${JSON.stringify(await client.complex({ f1: "nine", f2: 9 }))}`)
    log(`client.sigOk(): ${await client.sigOk()}`)
    const tsClient = r2mApiTs.getClient()
    log(`tsClient.key(): ${await tsClient.key()}`)
    log(`tsClient.hello("a", "b", "c"): ${await tsClient.hello("a", "b", "c")}`)
    log(`tsClient.asyncHello("e", "f", "g"): ${await tsClient.asyncHello("e", "f", "g")}`)
    log(`tsClient.sigOk(): ${await tsClient.sigOk()}`)
}