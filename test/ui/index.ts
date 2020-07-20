import { bootstrap } from "test/pre";

const logArea = document.getElementById("log")

function log(entry: string) {
    console.log(entry)
    const e = document.createElement("p")
    e.innerText = entry
    logArea?.appendChild(e)
}
bootstrap(log)