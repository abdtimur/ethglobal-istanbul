use wasm_bindgen::prelude::*;
use web_time::Instant;

// https://github.com/GoogleChromeLabs/wasm-bindgen-rayon#setting-up
pub use wasm_bindgen_rayon::init_thread_pool;

/// Provides `println!(..)`-style syntax for `console.log` logging.
#[macro_export]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub async fn prover(input_json_str: &str) -> Result<String, JsValue> {
    set_panic_hook();

    let start_time = Instant::now();

    // TODO:

    log!("elapsed: {}s", start_time.elapsed().as_secs());

    Ok("{}".to_string())
}
