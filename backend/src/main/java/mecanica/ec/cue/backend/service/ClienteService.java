package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.Cliente;
import mecanica.ec.cue.backend.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Cliente obtener(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
    }

    public Cliente crear(Cliente cliente) {
        cliente.setId(null);
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente datos) {
        Cliente cliente = obtener(id);
        cliente.setNombre(datos.getNombre());
        cliente.setTelefono(datos.getTelefono());
        cliente.setEmail(datos.getEmail());
        cliente.setDireccion(datos.getDireccion());
        return clienteRepository.save(cliente);
    }

    public void eliminar(Long id) {
        Cliente cliente = obtener(id);
        clienteRepository.delete(cliente);
    }
}
