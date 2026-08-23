import 'package:flutter/material.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';

/// Placas ecuatorianas: 3 letras + 3 o 4 dígitos (con o sin guion en el
/// texto reconocido). Se normaliza a "AAA-1234" para las búsquedas.
String? detectarPlaca(String textoReconocido) {
  final normalizado = textoReconocido.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
  final match = RegExp(r'[A-Z]{3}\d{3,4}').firstMatch(normalizado);
  if (match == null) return null;
  final raw = match.group(0)!;
  final letras = raw.substring(0, 3);
  final numeros = raw.substring(3);
  return '$letras-$numeros';
}

class PlacaScannerScreen extends StatefulWidget {
  const PlacaScannerScreen({super.key});

  @override
  State<PlacaScannerScreen> createState() => _PlacaScannerScreenState();
}

class _PlacaScannerScreenState extends State<PlacaScannerScreen> {
  final _placaController = TextEditingController();
  bool _procesando = false;
  String? _mensaje;

  @override
  void dispose() {
    _placaController.dispose();
    super.dispose();
  }

  Future<void> _tomarFoto() async {
    setState(() {
      _procesando = true;
      _mensaje = null;
    });
    try {
      final picker = ImagePicker();
      final foto = await picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.rear,
        imageQuality: 90,
      );
      if (foto == null) {
        setState(() => _procesando = false);
        return;
      }

      final recognizer = TextRecognizer(script: TextRecognitionScript.latin);
      final resultado = await recognizer.processImage(InputImage.fromFilePath(foto.path));
      await recognizer.close();

      final placaDetectada = detectarPlaca(resultado.text);
      setState(() {
        _procesando = false;
        if (placaDetectada != null) {
          _placaController.text = placaDetectada;
          _mensaje = null;
        } else {
          _mensaje = 'No se detectó una placa automáticamente. Revisa/escribe el texto manualmente.';
        }
      });
    } catch (e) {
      setState(() {
        _procesando = false;
        _mensaje = 'No se pudo procesar la foto: $e';
      });
    }
  }

  void _confirmar() {
    final placa = _placaController.text.trim().toUpperCase();
    if (placa.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ingresa o escanea una placa primero')),
      );
      return;
    }
    Navigator.of(context).pop(placa);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear placa')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton.icon(
              onPressed: _procesando ? null : _tomarFoto,
              icon: const Icon(Icons.camera_alt),
              label: Text(_procesando ? 'Procesando...' : 'Tomar foto de la placa'),
            ),
            if (_procesando) ...[
              const SizedBox(height: 16),
              const Center(child: CircularProgressIndicator()),
            ],
            if (_mensaje != null) ...[
              const SizedBox(height: 16),
              Text(_mensaje!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 24),
            TextField(
              controller: _placaController,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                labelText: 'Placa',
                hintText: 'AAA-1234',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _confirmar,
              child: const Text('Usar esta placa'),
            ),
          ],
        ),
      ),
    );
  }
}
