use omega_edit_rs::*;

fn main() {
    let mut s = Session::new();

    // add a view for watching changes
    s.view_cb(0, 100, Box::new(|v| println!("[[{} {}]]", v, v.len())));

    // add two views for display
    let hello = s.view(0, 5);
    let world = s.view(6, 10);

    // make some changes
    s.push("Hello Weird!!!!");
    s.overwrite("orl", 7);
    s.delete(11, 3);

    // display the views
    println!("{} {}", hello, world);
}
