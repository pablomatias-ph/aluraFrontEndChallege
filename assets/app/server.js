const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../../"))); // Sirve archivos estáticos desde la raíz

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads")); // Carpeta de imágenes subidas
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único basado en timestamp
    },
});
const upload = multer({ storage });

// Ruta del archivo JSON que actúa como "base de datos"
const DB_PATH = path.join(__dirname, "../../productos.json"); // Ruta correcta del productos.json

// Funciones para manejar el archivo JSON
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Rutas del API

// Obtener todos los productos
app.get("/productos", (req, res) => {
    const productos = readDB();
    res.json(productos);
});

// Agregar un nuevo producto
app.post("/productos", upload.single("imagen"), (req, res) => {
    const productos = readDB();
    const nuevoProducto = {
        id: Date.now(),
        nombre: req.body.nombre,
        precio: parseFloat(req.body.precio.replace(",", ".")), // Convierte el precio al formato decimal
        imagen: req.file ? `uploads/${req.file.filename}` : "assets/imagenes/default.jpg",
    };
    productos.push(nuevoProducto);
    writeDB(productos);
    res.status(201).json(nuevoProducto);
});

// Eliminar un producto
app.delete("/productos/:id", (req, res) => {
    const productos = readDB();
    const id = parseInt(req.params.id, 10);
    const productoIndex = productos.findIndex((p) => p.id === id);

    if (productoIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar la imagen del servidor si está en `uploads`
    const producto = productos[productoIndex];
    if (producto.imagen.startsWith("uploads/")) {
        const imagePath = path.join(__dirname, "../", producto.imagen);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    productos.splice(productoIndex, 1);
    writeDB(productos);
    res.status(200).json({ message: "Producto eliminado" });
});

// Obtener un producto por ID
app.get("/productos/:id", (req, res) => {
    const productos = readDB();
    const id = parseInt(req.params.id, 10);
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
});

// Editar un producto existente
app.put("/productos/:id", upload.single("imagen"), (req, res) => {
    const productos = readDB();
    const id = parseInt(req.params.id, 10);
    const productoIndex = productos.findIndex((p) => p.id === id);

    if (productoIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = productos[productoIndex];
    producto.nombre = req.body.nombre || producto.nombre;
    producto.precio = parseFloat(req.body.precio.replace(",", ".")) || producto.precio;

    if (req.file) {
        // Eliminar la imagen anterior si existe
        if (producto.imagen.startsWith("uploads/")) {
            const oldImagePath = path.join(__dirname, "../", producto.imagen);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        producto.imagen = `uploads/${req.file.filename}`;
    }

    productos[productoIndex] = producto;
    writeDB(productos);
    res.status(200).json(producto);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});