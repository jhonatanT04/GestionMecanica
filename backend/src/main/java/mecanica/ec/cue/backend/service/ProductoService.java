package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.Producto;
import mecanica.ec.cue.backend.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listar(Boolean bajoMinimo) {
        if (Boolean.TRUE.equals(bajoMinimo)) {
            return productoRepository.findBajoStockMinimo();
        }
        return productoRepository.findAll();
    }

    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
    }

    public Producto crear(Producto producto) {
        producto.setId(null);
        producto.setSku(normalizarSku(producto.getSku()));
        if (producto.getStockActual() == null) {
            producto.setStockActual(0);
        }
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto producto = obtener(id);
        producto.setSku(normalizarSku(datos.getSku()));
        producto.setNombre(datos.getNombre());
        producto.setCategoria(datos.getCategoria());
        producto.setStockActual(datos.getStockActual() != null ? datos.getStockActual() : producto.getStockActual());
        producto.setStockMinimo(datos.getStockMinimo());
        producto.setPrecioCompra(datos.getPrecioCompra());
        producto.setPrecioVenta(datos.getPrecioVenta());
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        productoRepository.delete(obtener(id));
    }

    public Producto descontarStock(Long productoId, int cantidad) {
        Producto producto = obtener(productoId);
        if (producto.getStockActual() < cantidad) {
            throw new StockInsuficienteException("Stock insuficiente para el producto " + producto.getSku()
                    + ": disponible " + producto.getStockActual() + ", solicitado " + cantidad);
        }
        producto.setStockActual(producto.getStockActual() - cantidad);
        return productoRepository.save(producto);
    }

    public Producto reponerStock(Long productoId, int cantidad) {
        Producto producto = obtener(productoId);
        producto.setStockActual(producto.getStockActual() + cantidad);
        return productoRepository.save(producto);
    }

    private String normalizarSku(String sku) {
        return sku == null ? null : sku.trim().toUpperCase();
    }
}
