use omega_edit_rs::*;
use std::error::Error;

fn foo(v: &Viewport) {
    println!("[{} {}]", v, v.len())
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut s = Session::new();
    let v = s.view(0, 100, Box::new(foo));

    s.push("Hello Weird!!!!");
    s.overwrite("orl", 7);
    s.delete(11, 3);

    println!("{}", v);

    Ok(())
}
