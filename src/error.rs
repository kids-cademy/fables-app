use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("WebView creation failed")]
    WebViewCreation(),

    #[error("URL setting failed: {0}")]
    UrlSetting(String),

    #[error("Wry error: {0}")]
    Wry(#[from] wry::Error),

    #[error("OS error: {0}")]
    OsError(#[from] wry::application::error::OsError)
}
