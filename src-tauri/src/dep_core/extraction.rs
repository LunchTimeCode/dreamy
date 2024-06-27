use std::time::{Duration, SystemTime, UNIX_EPOCH};

pub fn extraction_time() -> Duration {
    let now = SystemTime::now();
    now.duration_since(UNIX_EPOCH)
        .expect("we are in the future")
}
