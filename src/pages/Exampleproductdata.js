// Example product data structure for ProductDetail component
// This shows how to format your products with colors and multiple images

const exampleProducts = [
  {
    id: 1,
    name: "Premium Sneaker",
    price: "$129.99",
    description: "Ultra-comfortable premium sneaker crafted with breathable materials and superior cushioning. Perfect for everyday wear and light athletic activities.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    
    // Color variations with multiple images per color
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/1.jpg",  // Main image
          "/images/sneaker-black-2.jpg",  // Side view
          "/images/sneaker-black-3.jpg",  // Detail shot
        ]
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: [
          "/images/sneaker-white-1.jpg",
          "/images/sneaker-white-2.jpg",
          "/images/sneaker-white-3.jpg",
        ]
      },
      {
        name: "Red",
        hex: "#DC2626",
        images: [
          "/images/sneaker-red-1.jpg",
          "/images/sneaker-red-2.jpg",
          "/images/sneaker-red-3.jpg",
        ]
      },
      {
        name: "Navy",
        hex: "#1E3A8A",
        images: [
          "/images/sneaker-navy-1.jpg",
          "/images/sneaker-navy-2.jpg",
        ]
      },
      {
        name: "Gray",
        hex: "#6B7280",
        images: [
          "/images/sneaker-gray-1.jpg",
          "/images/sneaker-gray-2.jpg",
          "/images/sneaker-gray-3.jpg",
          "/images/sneaker-gray-4.jpg",
        ]
      }
    ],
    
    // Fallback image (used if colors are not available)
    image: "/images/sneaker-default.jpg"
  },
  
  {
    id: 2,
    name: "Classic T-Shirt",
    price: "$29.99",
    description: "Essential wardrobe staple made from premium cotton. Soft, breathable, and designed for all-day comfort.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [
          "/images/tshirt-black-1.jpg",
          "/images/tshirt-black-2.jpg",
        ]
      },
      {
        name: "White",
        hex: "#FFFFFF",
        images: [
          "/images/tshirt-white-1.jpg",
          "/images/tshirt-white-2.jpg",
        ]
      },
      {
        name: "Olive",
        hex: "#6B7F3E",
        images: [
          "/images/tshirt-olive-1.jpg",
          "/images/tshirt-olive-2.jpg",
        ]
      },
      {
        name: "Navy",
        hex: "#1E3A8A",
        images: [
          "/images/tshirt-navy-1.jpg",
        ]
      }
    ],
    
    image: "/images/tshirt-default.jpg"
  }
];

export default exampleProducts;

/* 
USAGE NOTES:
============

1. Each product must have:
   - id, name, price, description, sizes
   - colors array (optional but recommended)
   - fallback image

2. Each color object has:
   - name: Display name of the color
   - hex: Hex color code for the color swatch
   - images: Array of image URLs (minimum 1, can have multiple)

3. The component will:
   - Display color swatches in circular buttons
   - Show the first image of selected color by default
   - Allow users to navigate through images with prev/next buttons
   - Show image indicators at the bottom
   - Smoothly transition between images

4. Supported hex formats:
   - "#000000" (black)
   - "#FFFFFF" (white)
   - "#DC2626" (red)
   - Any valid hex color code

5. For products without color variations:
   - Simply omit the colors array
   - Only the main image will be shown
   - Color selector won't appear

*/