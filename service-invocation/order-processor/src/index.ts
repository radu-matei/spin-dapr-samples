import { HandleRequest, HttpRequest, HttpResponse, Router } from "@fermyon/spin-sdk"

let router = Router();
let decoder = new TextDecoder();

router.post("/orders", async (req, extra) => {
  console.log("Received order: ", req.url);
  let body = JSON.parse(decoder.decode(extra.body));
  console.log("Received order:", body);

  return { status: 200, body: "Order received" };
});

router.all("*", async (req) => {
  console.log("Received request: ", req.url);
  return { status: 404, body: "Not found" };
});

export const handleRequest: HandleRequest = async function(req: HttpRequest): Promise<HttpResponse> {
  return router.handleRequest(req, { body: req.body });
}
