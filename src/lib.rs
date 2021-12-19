#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]

use std::ffi::CString;
use std::ptr;

include!("bindings.rs");

type ViewportCallback = unsafe extern "C" fn(*const omega_viewport_t, *const omega_change_t);

pub struct Session {
    p: *mut omega_session_t,
}

impl Drop for Session {
    fn drop(&mut self) {
        unsafe {
            omega_edit_destroy_session(self.p);
        }
    }
}

impl Session {
    pub fn new() -> Self {
        let p = unsafe { omega_edit_create_session(ptr::null(), None, ptr::null_mut()) };
        Self { p }
    }

    pub fn view(&self, offset: i64, size: i64, cb: Option<ViewportCallback>) -> Viewport {
        let p = unsafe { omega_edit_create_viewport(self.p, offset, size, cb, ptr::null_mut()) };
        Viewport { p }
    }

    pub fn push(&mut self, s: &str) {
        let s = CString::new(s).unwrap();
        unsafe {
            omega_edit_insert(self.p, 0, s.as_c_str().as_ptr(), 0);
        }
    }

    pub fn insert(&mut self, s: &str, offset: i64) {
        let s = CString::new(s).unwrap();
        unsafe {
            omega_edit_insert(self.p, offset, s.as_c_str().as_ptr(), 0);
        }
    }

    pub fn overwrite(&mut self, s: &str, offset: i64) {
        let s = CString::new(s).unwrap();
        unsafe {
            omega_edit_overwrite(self.p, offset, s.as_c_str().as_ptr(), 0);
        }
    }

    pub fn delete(&mut self, offset: i64, len: i64) {
        unsafe {
            omega_edit_delete(self.p, offset, len);
        }
    }
}

pub struct Viewport {
    p: *mut omega_viewport_t,
}
