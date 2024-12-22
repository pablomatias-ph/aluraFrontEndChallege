const API_URL = "http://localhost:3000/productos";

// Obtener parámetros de la URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProductData() {
    const response = await fetch(`${API_URL}/${productId}`);
    const producto = await response.json();

    document.getElementById("product-name").value = producto.nombre;
    document.getElementById("product-price").value = producto.precio.toString().replace(".", ",");
}

document.getElementById("edit-product-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("product-name").value;
    const precioInput = document.getElementById("product-price").value;
    const imagen = document.getElementById("product-image").files[0];

    const precio = parseFloat(precioInput.replace(",", "."));
    if (isNaN(precio)) {
        alert("Por favor, ingresa un precio válido.");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("precio", precio.toFixed(2));
    if (imagen) {
        formData.append("imagen", imagen);
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: "PUT",
            body: formData,
        });

        if (response.ok) {
            alert("Producto actualizado con éxito.");
            window.location.href = "index.html"; // Redirige a index.html
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert("Ocurrió un error al actualizar el producto.");
        console.error(error);
    }
});

// Cargar los datos del producto al abrir la página
loadProductData();