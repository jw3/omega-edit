use omega_edit_rs::*;

fn main() {
    let mut s = Session::new();
    let v = s.view(0, 100, Box::new(|v| println!("[[{} {}]]", v, v.len())));

    s.push("Hello Weird!!!!");
    s.overwrite("orl", 7);
    s.delete(11, 3);

    println!("{}", v);
}
