package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.Marca;
import mecanica.ec.cue.backend.repository.MarcaRepository;
import mecanica.ec.cue.backend.repository.VehiculoRepository;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;
    private final VehiculoRepository vehiculoRepository;

    public MarcaService(MarcaRepository marcaRepository, VehiculoRepository vehiculoRepository) {
        this.marcaRepository = marcaRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    public List<Marca> listar(Boolean soloActivas) {
        if (Boolean.TRUE.equals(soloActivas)) {
            return marcaRepository.findByActivaTrueOrderByNombreAsc();
        }
        return marcaRepository.findAllByOrderByNombreAsc();
    }

    public Marca obtener(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + id));
    }

    public Marca crear(Marca marca) {
        marca.setId(null);
        marca.setNombre(normalizarNombre(marca.getNombre()));
        if (marca.getActiva() == null) {
            marca.setActiva(true);
        }
        return marcaRepository.save(marca);
    }

    public Marca actualizar(Long id, Marca datos) {
        Marca marca = obtener(id);
        marca.setNombre(normalizarNombre(datos.getNombre()));
        marca.setActiva(datos.getActiva() != null ? datos.getActiva() : marca.getActiva());
        return marcaRepository.save(marca);
    }

    /** Solo se eliminan marcas sin vehiculos; las que estan en uso se desactivan. */
    public void eliminar(Long id) {
        Marca marca = obtener(id);
        if (vehiculoRepository.existsByMarcaId(id)) {
            throw new IllegalArgumentException(
                    "La marca " + marca.getNombre() + " esta asignada a vehiculos; desactivela en lugar de eliminarla");
        }
        marcaRepository.delete(marca);
    }

    private String normalizarNombre(String nombre) {
        return nombre == null ? null : nombre.trim().replaceAll("\\s+", " ");
    }
}
