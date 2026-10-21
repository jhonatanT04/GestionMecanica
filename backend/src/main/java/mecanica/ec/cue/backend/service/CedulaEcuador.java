package mecanica.ec.cue.backend.service;

/**
 * Validación de la cédula de identidad ecuatoriana (10 dígitos): código de
 * provincia 01-24 (o 30 para ecuatorianos en el exterior), tercer dígito menor
 * a 6 (persona natural) y dígito verificador por módulo 10.
 */
public final class CedulaEcuador {

    private static final int[] COEFICIENTES = { 2, 1, 2, 1, 2, 1, 2, 1, 2 };

    private CedulaEcuador() {
    }

    public static boolean esValida(String cedula) {
        if (cedula == null || !cedula.matches("\\d{10}")) {
            return false;
        }
        int provincia = Integer.parseInt(cedula.substring(0, 2));
        if (!((provincia >= 1 && provincia <= 24) || provincia == 30)) {
            return false;
        }
        if (cedula.charAt(2) - '0' >= 6) {
            return false;
        }
        int suma = 0;
        for (int i = 0; i < 9; i++) {
            int producto = (cedula.charAt(i) - '0') * COEFICIENTES[i];
            suma += producto >= 10 ? producto - 9 : producto;
        }
        int verificador = (10 - suma % 10) % 10;
        return verificador == cedula.charAt(9) - '0';
    }
}
