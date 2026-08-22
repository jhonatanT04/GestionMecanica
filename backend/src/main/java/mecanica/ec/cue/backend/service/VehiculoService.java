package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.Cliente;
import mecanica.ec.cue.backend.model.Vehiculo;
import mecanica.ec.cue.backend.repository.ClienteRepository;
import mecanica.ec.cue.backend.repository.VehiculoRepository;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ClienteRepository clienteRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository, ClienteRepository clienteRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.clienteRepository = clienteRepository;
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
        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo actualizar(Long id, Vehiculo datos) {
        Vehiculo vehiculo = obtener(id);
        vehiculo.setPlaca(normalizarPlaca(datos.getPlaca()));
        vehiculo.setMarca(datos.getMarca());
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
}
