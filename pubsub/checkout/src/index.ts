import { Config, HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk"

export async function handler(_req: HttpRequest, res: ResponseBuilder) {
  let dapr = getDaprSettings();
  for (var i = 1; i <= 10; i++) {
    let order = { orderId: i };
    let url = `${dapr.host}:${dapr.port}/v1.0/publish/${dapr.pubSubName}/${dapr.pubSubTopic}`;

    console.log("Sending request to: " + url);
    try {
      let res = await fetch(url, { method: "POST", body: JSON.stringify(order) });
      console.log("Sent order to, status: " + res.status);
    } catch (e) {
      console.log("Error: " + e);
    }
  }
  res.status(200).body("Hi, checkout!");
}

interface DaprSettings {
  host: string,
  port: string,
  pubSubName: string,
  pubSubTopic: string,
}

function getDaprSettings(): DaprSettings {
  return {
    host: Config.get("dapr_host"),
    port: Config.get("dapr_port"),
    pubSubName: Config.get("dapr_pubsub_name"),
    pubSubTopic: Config.get("dapr_pubsub_topic"),
  }
}
