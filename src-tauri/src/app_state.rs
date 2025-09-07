use crate::core::models::HistoryItem;
use std::sync::Mutex;

#[derive(Default)]
pub struct AppStateInner {
    pub history: Vec<HistoryItem>,
}

pub type AppState = Mutex<AppStateInner>;
