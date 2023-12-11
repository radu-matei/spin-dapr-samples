use anyhow::Result;
use serde::{Deserialize, Serialize};
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

struct DaprConfig {
    host: String,
    port: String,
    store: String,
}

impl DaprConfig {
    pub fn from_config() -> Result<Self> {
        Ok(Self {
            host: spin_sdk::variables::get("dapr_host")?,
            port: spin_sdk::variables::get("dapr_port")?,
            store: spin_sdk::variables::get("dapr_statestore")?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Order {
    order_id: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct State {
    key: String,
    value: Order,
}

/// A simple Spin HTTP component.
#[http_component]
async fn handle_state_management(req: Request) -> anyhow::Result<impl IntoResponse> {
    println!("Got request: {:?}", req.uri());
    let dapr = DaprConfig::from_config()?;

    let store_url = format!("{}:{}/v1.0/state/{}", dapr.host, dapr.port, dapr.store);
    for i in 0..10 {
        let order = Order {
            order_id: format!("{}", i),
            content: format!("Order {}", i),
        };
        // let order_json = serde_json::to_string(&order)?;
        let state = vec![State {
            key: order.order_id.clone(),
            value: order,
        }];

        // Save state to the store
        println!("Saving order: {:?}", state);
        let _res: Response = spin_sdk::http::send(Request::post(
            store_url.clone(),
            serde_json::to_string(&state)?,
        ))
        .await?;

        // Get state from the store
        let res: Response =
            spin_sdk::http::send(Request::get(format!("{}/{}", store_url, i))).await?;
        // println!("Res: {:?}", res);
        let body = std::str::from_utf8(&res.body())?;
        let retrieved_order: Order = serde_json::from_str(&body)?;
        println!("Got order: {:?}", retrieved_order);

        // Delete state from the store
        let _res: Response = spin_sdk::http::send(
            Request::builder()
                .method(spin_sdk::http::Method::Delete)
                .uri(format!("{}/{}", store_url, i))
                .build(),
        )
        .await?;
    }

    Ok(Response::builder()
        .status(200)
        .body("Finished state management request")
        .build())
}
