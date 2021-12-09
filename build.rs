extern crate bindgen;

use std::env;
use std::path::PathBuf;

fn main() {
    println!("cargo:rustc-link-search=cmake-build-debug");
    println!("cargo:rustc-link-lib=dylib=omega_edit");
    println!("cargo:rerun-if-changed=wrapper.h");

    let bindings = bindgen::Builder::default()
        .header("wrapper.h")
        .allowlist_type("omega_session_t")
        .allowlist_function("omega_edit_create_session")
        .allowlist_function("omega_edit_create_viewport")
        .allowlist_function("omega_edit_insert")
        .allowlist_function("omega_edit_overwrite")
        .allowlist_function("omega_edit_delete")
        .allowlist_function("omega_edit_save")
        .allowlist_function("omega_edit_destroy_session")
        .allowlist_function("omega_viewport_get_data")
        .allowlist_function("omega_viewport_get_length")
        .generate_inline_functions(true)
        .clang_args(&["-x", "c++"])
        // Tell cargo to invalidate the built crate whenever any of the
        // included header files changed.
        .parse_callbacks(Box::new(bindgen::CargoCallbacks))
        .generate()
        .expect("Unable to generate bindings");

    bindings
        .write_to_file("src/bindings.rs")
        .expect("Couldn't write bindings!");
}
