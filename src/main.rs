#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod logger;

use clap::Parser;
use include_dir::{Dir, include_dir};
use log::{debug, error, info, trace, warn};
use std::borrow::Cow;
use wry::{
    application::{
        dpi::LogicalSize,
        event::{Event, StartCause, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        window::WindowBuilder,
    },
    http::Response,
    webview::WebViewBuilder,
};

static ASSETS_DIR: Dir = include_dir!("assets");

#[derive(Parser, Debug)]
struct Args {
    #[arg(
        short = 'v',
        long,
        default_value = "off",
        help = "logging level: off, error, warn, info, debug, trace"
    )]
    log_level: String,

    #[arg(
        short = 'f',
        long,
        help = "logging file path -- if not specified print logs to console"
    )]
    log_file: Option<String>,
}

fn main() -> wry::Result<()> {
    let args = Args::parse();
    logger::init(&args.log_level, &args.log_file);
    trace!("main()");

    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("kids (a)cademy fables")
        .with_inner_size(LogicalSize::new(1400, 820))
        .build(&event_loop)?;

    let html_url = "app://local/play.htm";
    info!("loading page: {}", html_url);
    let _webview = WebViewBuilder::new(window)?
        .with_custom_protocol("app".into(), move |request| {
            let path = request.uri().path();
            let file = ASSETS_DIR.get_file(&path[1..]).unwrap();
            let buffer = file.contents().to_vec();
            debug!("load file {}: {}", path, buffer.len());

            let mime_type = match path.rsplit('.').next().unwrap_or("") {
                "htm" => "text/html",
                "css" => "text/css",
                "js" => "text/javascript",
                "json" => "application/json",
                "png" => "image/png",
                "jpg" => "image/jpeg",
                "ico" => "image/x-icon",
                "mp3" => "audio/mpeg",
                _ => "application/octet-stream",
            };

            let response = Response::builder()
                .status(200)
                .header("Content-Type", mime_type)
                .header("Content-Length", buffer.len().to_string())
                .header("Cache-Control", "private, max-age=3600")
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "*")
                .header("Access-Control-Allow-Headers", "*")
                .body(Cow::Owned(buffer))
                .unwrap();

            Ok(response)
        })
        .with_initialization_script(include_str!("init.js"))
        .with_ipc_handler(|_window, request| {
            if let Ok(message) = serde_json::from_str::<serde_json::Value>(&request) {
                if message["type"] == "console" {
                    static EMPTY_ARGS: Vec<serde_json::Value> = vec![];
                    let level = message["level"].as_str().unwrap_or("log");
                    let args = message["args"].as_array().unwrap_or(&EMPTY_ARGS);

                    let js_log = format!(
                        "JS: {}",
                        args.iter()
                            .map(|s| s.as_str().unwrap())
                            .collect::<Vec<&str>>()
                            .join(" ")
                            .trim_matches('"')
                    );
                    match level {
                        "error" => error!("{}", js_log),
                        "warn" => warn!("{}", js_log),
                        "info" => info!("{}", js_log),
                        _ => debug!("{}", js_log),
                    }
                }
            }
        })
        .with_url(&html_url)?
        .with_devtools(true)
        .build()?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;
        match event {
            Event::NewEvents(StartCause::Init) => info!("kids (a)cademy fables started"),
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,
            _ => (),
        }
    });
}
