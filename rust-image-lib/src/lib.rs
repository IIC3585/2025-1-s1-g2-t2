pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn invert_colors(input: Vec<u8>) -> Vec<u8> {
    input.iter().map(|pixel| 255 - pixel).collect()
}



#[wasm_bindgen]
pub fn grayscale(input: &[u8]) -> Vec<u8> {
    let mut output = input.to_vec();
    for i in (0..input.len()).step_by(4) {
        let avg = ((input[i] as u16 + input[i + 1] as u16 + input[i + 2] as u16) / 3) as u8;
        output[i] = avg;
        output[i + 1] = avg;
        output[i + 2] = avg;
        // Alpha se mantiene igual: output[i + 3] = input[i + 3];
    }
    output
}

use wasm_bindgen::prelude::*;
use image::{ImageBuffer, Rgba};

#[wasm_bindgen]
pub fn blur(input: Vec<u8>, width: u32, height: u32, sigma: f32) -> Vec<u8> {
    let img = ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, input).expect("Invalid image buffer");
    let blurred = image::imageops::blur(&img, sigma);
    blurred.into_raw()
}
