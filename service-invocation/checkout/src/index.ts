import { Config, HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk"

export async function handler(_req: HttpRequest, res: ResponseBuilder) {
  let dapr = getDaprSettings();
  for (var i = 1; i <= 10; i++) {
    let order = { orderId: i };
    let url = `${dapr.host}:${dapr.port}/orders`;

    console.log("Sending request to: " + url);
    try {
      let res = await fetch(url, { method: "POST", body: JSON.stringify(order), headers: { "dapr-app-id": "order-processor" } });
      console.log("Sent order, status: " + res.status);
    } catch (e) {
      console.log("Error: " + e);
    }
  }
  res.status(200).body("Hi, checkout!");
}

interface DaprSettings {
  host: string,
  port: string,
}

function getDaprSettings(): DaprSettings {
  return {
    host: Config.get("dapr_host"),
    port: Config.get("dapr_port"),
  }
}
