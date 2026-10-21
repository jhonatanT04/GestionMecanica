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
        normalizar(cliente);
        if (clienteRepository.existsByCedula(cliente.getCedula())) {
            throw new IllegalArgumentException("Ya existe un cliente con la cédula " + cliente.getCedula());
        }
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente datos) {
        Cliente cliente = obtener(id);
        normalizar(datos);
        if (clienteRepository.existsByCedulaAndIdNot(datos.getCedula(), id)) {
            throw new IllegalArgumentException("Ya existe otro cliente con la cédula " + datos.getCedula());
        }
        cliente.setNombres(datos.getNombres());
        cliente.setApellidos(datos.getApellidos());
        cliente.setCedula(datos.getCedula());
        cliente.setTelefono(datos.getTelefono());
        cliente.setEmail(datos.getEmail());
        cliente.setDireccion(datos.getDireccion());
        return clienteRepository.save(cliente);
    }

    private static void normalizar(Cliente cliente) {
        cliente.setNombres(colapsarEspacios(cliente.getNombres()));
        cliente.setApellidos(colapsarEspacios(cliente.getApellidos()));
        String cedula = cliente.getCedula() == null ? "" : cliente.getCedula().replaceAll("[\\s-]", "");
        if (cedula.isEmpty()) {
            throw new IllegalArgumentException("La cédula del cliente es obligatoria");
        }
        if (!CedulaEcuador.esValida(cedula)) {
            throw new IllegalArgumentException("La cédula " + cedula + " no es válida");
        }
        cliente.setCedula(cedula);
    }

    private static String colapsarEspacios(String texto) {
        return texto == null ? null : texto.trim().replaceAll("\\s+", " ");
    }

    public void eliminar(Long id) {
        Cliente cliente = obtener(id);
        clienteRepository.delete(cliente);
    }
}
