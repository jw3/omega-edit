use omega_edit_rs::*;
use std::error::Error;
use std::ffi::{CStr, CString};
use std::ptr;

extern "C" fn vpt_change_cbk(v: *const omega_viewport_t, _: *const omega_change_t) {
    unsafe {
        let len = omega_viewport_get_length(v);
        let dat = omega_viewport_get_data(v);
        let dat = std::slice::from_raw_parts(dat, len as usize);
        let str = CStr::from_bytes_with_nul_unchecked(dat);

        match str.to_str() {
            Ok(s) => println!("[{} {}]", s, len),
            Err(_) => {}
        };
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let x = vpt_change_cbk;

    let mut s = Session::new();
    let _v = s.view(0, 100, Some(vpt_change_cbk));

    s.push("Hello Weird!!!!");
    s.overwrite("orl", 7);
    s.delete(11, 3);

    Ok(())
}
