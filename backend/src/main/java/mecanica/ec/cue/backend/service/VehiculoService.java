package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.Cliente;
import mecanica.ec.cue.backend.model.Marca;
import mecanica.ec.cue.backend.model.Vehiculo;
import mecanica.ec.cue.backend.repository.ClienteRepository;
import mecanica.ec.cue.backend.repository.MarcaRepository;
import mecanica.ec.cue.backend.repository.VehiculoRepository;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ClienteRepository clienteRepository;
    private final MarcaRepository marcaRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository, ClienteRepository clienteRepository,
            MarcaRepository marcaRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.clienteRepository = clienteRepository;
        this.marcaRepository = marcaRepository;
    }

    public List<Vehiculo> listar() {
        return vehiculoRepository.findAll();
    }

    public Vehiculo obtener(Long id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehiculo no encontrado: " + id));
    }

    public Vehiculo obtenerPorPlaca(String placa) {
        return vehiculoRepository.findByPlaca(normalizarPlaca(placa))
                .orElseThrow(() -> new ResourceNotFoundException("Vehiculo no encontrado con placa: " + placa));
    }

    public Vehiculo crear(Vehiculo vehiculo) {
        vehiculo.setId(null);
        vehiculo.setPlaca(normalizarPlaca(vehiculo.getPlaca()));
        vehiculo.setCliente(resolverCliente(vehiculo.getCliente()));
        vehiculo.setMarca(resolverMarca(vehiculo.getMarca(), null));
        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo actualizar(Long id, Vehiculo datos) {
        Vehiculo vehiculo = obtener(id);
        vehiculo.setPlaca(normalizarPlaca(datos.getPlaca()));
        vehiculo.setMarca(resolverMarca(datos.getMarca(), vehiculo.getMarca()));
        vehiculo.setModelo(datos.getModelo());
        vehiculo.setAnio(datos.getAnio());
        vehiculo.setKilometrajeActual(datos.getKilometrajeActual());
        vehiculo.setCliente(resolverCliente(datos.getCliente()));
        return vehiculoRepository.save(vehiculo);
    }

    public void eliminar(Long id) {
        Vehiculo vehiculo = obtener(id);
        vehiculoRepository.delete(vehiculo);
    }

    private String normalizarPlaca(String placa) {
        return placa == null ? null : placa.trim().toUpperCase();
    }

    private Cliente resolverCliente(Cliente cliente) {
        if (cliente == null || cliente.getId() == null) {
            throw new ResourceNotFoundException("Debe indicar el id del cliente");
        }
        return clienteRepository.findById(cliente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + cliente.getId()));
    }

    /**
     * Una marca desactivada no se puede asignar a vehiculos nuevos, pero un vehiculo
     * que ya la tenia puede conservarla al editarse.
     */
    private Marca resolverMarca(Marca marca, Marca marcaActual) {
        if (marca == null || marca.getId() == null) {
            return null;
        }
        Marca encontrada = marcaRepository.findById(marca.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + marca.getId()));
        boolean esLaActual = marcaActual != null && marcaActual.getId().equals(encontrada.getId());
        if (!Boolean.TRUE.equals(encontrada.getActiva()) && !esLaActual) {
            throw new IllegalArgumentException("La marca " + encontrada.getNombre() + " esta desactivada");
        }
        return encontrada;
    }
}
