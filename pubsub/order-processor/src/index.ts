import { Config, HttpRequest, HttpResponse, Router } from "@fermyon/spin-sdk"

let router = Router();
let decoder = new TextDecoder();

router.get("/dapr/subscribe", () => {
  console.log("Got a subscription request!");
  let dapr = getDaprSettings();

  let subscriptions = [{
    pubsubname: dapr.pubSubName,
    topic: dapr.pubSubTopic,
    route: "/dapr/orders"
  }];
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscriptions)
  }
});

router.post("/dapr/orders", async (_req, extra) => {
  console.log("Order processor received a request from the pubsub component!");
  let order = JSON.parse(decoder.decode(extra.body));
  console.log(order);

  return {
    status: 200,
    body: "OK"
  }
});

router.all("*", () => {
  console.log("Received a request to an unknown path!");
  return {
    status: 404,
    body: "Not found"
  }
});

export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
  console.log("Got a request: " + request.uri);
  return router.handleRequest(request, { body: request.body });
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
