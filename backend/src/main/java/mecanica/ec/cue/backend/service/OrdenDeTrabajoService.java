package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.EstadoOrden;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.Usuario;
import mecanica.ec.cue.backend.model.Vehiculo;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;
import mecanica.ec.cue.backend.repository.UsuarioRepository;
import mecanica.ec.cue.backend.repository.VehiculoRepository;

@Service
public class OrdenDeTrabajoService {

    private final OrdenDeTrabajoRepository ordenRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public OrdenDeTrabajoService(OrdenDeTrabajoRepository ordenRepository, VehiculoRepository vehiculoRepository,
            UsuarioRepository usuarioRepository) {
        this.ordenRepository = ordenRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<OrdenDeTrabajo> listar() {
        return ordenRepository.findAll();
    }

    public OrdenDeTrabajo obtener(Long id) {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada: " + id));
    }

    public OrdenDeTrabajo crear(OrdenDeTrabajo orden) {
        orden.setId(null);
        orden.setVehiculo(resolverVehiculo(orden.getVehiculo()));
        orden.setMecanicoAsignado(resolverMecanico(orden.getMecanicoAsignado()));
        if (orden.getEstado() == null) {
            orden.setEstado(EstadoOrden.RECIBIDO);
        }
        return ordenRepository.save(orden);
    }

    public OrdenDeTrabajo actualizar(Long id, OrdenDeTrabajo datos) {
        OrdenDeTrabajo orden = obtener(id);
        orden.setFechaEntrada(datos.getFechaEntrada());
        orden.setFechaEstimadaSalida(datos.getFechaEstimadaSalida());
        orden.setFechaRealSalida(datos.getFechaRealSalida());
        orden.setKilometrajeIngreso(datos.getKilometrajeIngreso());
        orden.setProblemaReportado(datos.getProblemaReportado());
        orden.setDiagnostico(datos.getDiagnostico());
        orden.setEstado(datos.getEstado() != null ? datos.getEstado() : orden.getEstado());
        orden.setVehiculo(resolverVehiculo(datos.getVehiculo()));
        orden.setMecanicoAsignado(resolverMecanico(datos.getMecanicoAsignado()));
        return ordenRepository.save(orden);
    }

    public void eliminar(Long id) {
        OrdenDeTrabajo orden = obtener(id);
        ordenRepository.delete(orden);
    }

    private Vehiculo resolverVehiculo(Vehiculo vehiculo) {
        if (vehiculo == null || vehiculo.getId() == null) {
            throw new ResourceNotFoundException("Debe indicar el id del vehiculo");
        }
        return vehiculoRepository.findById(vehiculo.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehiculo no encontrado: " + vehiculo.getId()));
    }

    private Usuario resolverMecanico(Usuario mecanico) {
        if (mecanico == null || mecanico.getId() == null) {
            return null;
        }
        return usuarioRepository.findById(mecanico.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecanico no encontrado: " + mecanico.getId()));
    }
}
