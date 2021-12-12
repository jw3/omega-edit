use omega_edit_rs::bindings::*;
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
    unsafe {
        let session = omega_edit_create_session(ptr::null(), None, ptr::null_mut());
        omega_edit_create_viewport(session, 0, 100, Some(vpt_change_cbk), ptr::null_mut());

        let x = CString::new("Hello Weird!!!!")?;
        let y = CString::new("orl")?;
        let z = CString::new("target/hello.txt")?;

        omega_edit_insert(session, 0, x.as_c_str().as_ptr(), 0);
        omega_edit_overwrite(session, 7, y.as_c_str().as_ptr(), 0);
        omega_edit_delete(session, 11, 3);
        omega_edit_save(session, z.as_c_str().as_ptr());
        omega_edit_destroy_session(session);
    }

    Ok(())
}
