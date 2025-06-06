import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFxq-9Lofrt2GHHZQpS_Gg9kb8dvpPzio",
  authDomain: "admin-app-6426c.firebaseapp.com",
  projectId: "admin-app-6426c",
  storageBucket: "admin-app-6426c.firebasestorage.app",
  messagingSenderId: "52366603200",
  appId: "1:52366603200:web:cae73849a83893838d4e25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Simulación de datos
const datos = {
  ventas: [
    { fecha: "2025-06-06", producto: "Lavandina", cliente: "Supermercado A", total: 3000 },
    { fecha: "2025-06-06", producto: "Detergente", cliente: "Kiosco B", total: 2000 },
    { fecha: "2025-06-05", producto: "Cloro", cliente: "Panadería C", total: 5000 },
    { fecha: "2025-06-06", producto: "Lavandina", cliente: "Supermercado A", total: 4000 },
  ],
  productos: [
    { nombre: "Lavandina", stock: 25 },
    { nombre: "Detergente", stock: 15 },
    { nombre: "Cloro", stock: 10 }
  ]
};

// Función principal
function mostrarResumen(fecha = "2025-06-06") {
  const ventasHoy = datos.ventas.filter(v => v.fecha === fecha);
  const totalVentas = ventasHoy.reduce((sum, v) => sum + v.total, 0);
  const totalStock = datos.productos.reduce((sum, p) => sum + p.stock, 0);

  document.getElementById("ventasDia").textContent = totalVentas;
  document.getElementById("stockDisponible").textContent = totalStock;

  // Ventas por producto
  const ventasPorProducto = {};
  ventasHoy.forEach(v => {
    ventasPorProducto[v.producto] = (ventasPorProducto[v.producto] || 0) + v.total;
  });

  const listaVentas = document.getElementById("listaVentasProducto");
  listaVentas.innerHTML = "";
  for (let producto in ventasPorProducto) {
    const li = document.createElement("li");
    li.textContent = `${producto}: $${ventasPorProducto[producto]}`;
    listaVentas.appendChild(li);
  }

  // Mejores clientes
  const ventasPorCliente = {};
  datos.ventas.forEach(v => {
    ventasPorCliente[v.cliente] = (ventasPorCliente[v.cliente] || 0) + v.total;
  });

  const clientesOrdenados = Object.entries(ventasPorCliente).sort((a, b) => b[1] - a[1]);
  const listaClientes = document.getElementById("listaClientesTop");
  listaClientes.innerHTML = "";
  clientesOrdenados.slice(0, 3).forEach(([cliente, total]) => {
    const li = document.createElement("li");
    li.textContent = `${cliente}: $${total}`;
    listaClientes.appendChild(li);
  });
}

// Filtro por fecha
document.getElementById("fechaFiltro").addEventListener("change", e => {
  mostrarResumen(e.target.value);
});

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch(error => {
      console.error("Error al cerrar sesión:", error);
    });
});

// Mostrar al cargar
mostrarResumen();