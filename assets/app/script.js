const API_URL = "http://localhost:3000/productos";

async function renderProducts() {
    const response = await fetch(API_URL);
    const productos = await response.json();
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    productos.forEach((producto) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="assets/imagenes/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div class="card-buttons">
                <button class="edit-button" data-id="${producto.id}">✏️ Editar</button>
                <button class="delete-button" data-id="${producto.id}">🗑️ Borrar</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const id = event.target.dataset.id;
            const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
            if (confirmar) {
                await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                renderProducts();
            }
        });
    });

    document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", (event) => {
            const id = event.target.dataset.id;
            window.open(`editar.html?id=${id}`, "_blank");
        });
    });
}

document.getElementById("product-form").addEventListener("submit", async (event) => {
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
    formData.append("imagen", imagen);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            event.target.reset();
            renderProducts();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert("Ocurrió un error al cargar el producto.");
        console.error(error);
    }
});

// Renderizar productos iniciales al cargar la página
window.addEventListener("load", renderProducts);