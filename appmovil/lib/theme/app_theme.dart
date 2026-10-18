import 'package:flutter/material.dart';

/// Paleta oscura "navy + azul eléctrico": fondo azul noche, superficies un
/// paso más claras y un único acento azul reservado para la acción primaria
/// y el estado activo (igual que las tarjetas encendidas de la referencia).
abstract final class AppColors {
  static const background = Color(0xFF0A1628);
  static const backgroundTop = Color(0xFF12284A);
  static const surface = Color(0xFF13233B);
  static const surfaceHigh = Color(0xFF1B2F4D);
  static const border = Color(0xFF233A5C);

  static const accent = Color(0xFF1C74DB);
  static const accentBright = Color(0xFF3D9BFF);

  static const text = Color(0xFFEAF1FB);
  static const textMuted = Color(0xFF8EA3BF);
  static const error = Color(0xFFFF8A80);
  static const success = Color(0xFF5BD6A0);
}

abstract final class AppRadius {
  static const card = 16.0;
  static const control = 14.0;
}

/// Fondo con degradado vertical sutil (más claro arriba) para pantallas
/// "de portada" como inicio y login.
class GradientBackground extends StatelessWidget {
  final Widget child;

  const GradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.backgroundTop, AppColors.background],
          stops: [0, 0.55],
        ),
      ),
      child: child,
    );
  }
}

ThemeData buildAppTheme() {
  const scheme = ColorScheme.dark(
    primary: AppColors.accent,
    onPrimary: Colors.white,
    secondary: AppColors.accentBright,
    onSecondary: AppColors.background,
    surface: AppColors.surface,
    onSurface: AppColors.text,
    onSurfaceVariant: AppColors.textMuted,
    surfaceContainerHighest: AppColors.surfaceHigh,
    outline: AppColors.border,
    outlineVariant: AppColors.border,
    error: AppColors.error,
    onError: AppColors.background,
  );

  final base = ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    brightness: Brightness.dark,
  );

  OutlineInputBorder border(Color color, [double width = 1]) =>
      OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.control),
        borderSide: BorderSide(color: color, width: width),
      );

  final buttonShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(AppRadius.control),
  );

  return base.copyWith(
    scaffoldBackgroundColor: AppColors.background,
    textTheme: base.textTheme
        .apply(bodyColor: AppColors.text, displayColor: AppColors.text)
        .copyWith(
          headlineSmall: base.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            color: AppColors.text,
          ),
          titleLarge: base.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
            color: AppColors.text,
          ),
        ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      foregroundColor: AppColors.text,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.6,
        color: AppColors.text,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      labelStyle: const TextStyle(color: AppColors.textMuted),
      floatingLabelStyle: const TextStyle(color: AppColors.accentBright),
      hintStyle: const TextStyle(color: AppColors.textMuted),
      prefixIconColor: AppColors.textMuted,
      suffixIconColor: AppColors.textMuted,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: border(AppColors.border),
      enabledBorder: border(AppColors.border),
      focusedBorder: border(AppColors.accentBright, 1.5),
      errorBorder: border(AppColors.error),
      focusedErrorBorder: border(AppColors.error, 1.5),
      errorStyle: const TextStyle(color: AppColors.error),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        disabledBackgroundColor: AppColors.surfaceHigh,
        disabledForegroundColor: AppColors.textMuted,
        elevation: 0,
        minimumSize: const Size.fromHeight(52),
        shape: buttonShape,
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.3,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.text,
        side: const BorderSide(color: AppColors.border),
        minimumSize: const Size.fromHeight(52),
        shape: buttonShape,
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: AppColors.accentBright),
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.accent,
      foregroundColor: Colors.white,
      elevation: 0,
      highlightElevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
    ),
    listTileTheme: ListTileThemeData(
      iconColor: AppColors.textMuted,
      textColor: AppColors.text,
      subtitleTextStyle: const TextStyle(
        color: AppColors.textMuted,
        fontSize: 13,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.control),
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: const BorderSide(color: AppColors.border),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.surfaceHigh,
      contentTextStyle: const TextStyle(color: AppColors.text),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.control),
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.accentBright,
    ),
    datePickerTheme: DatePickerThemeData(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, space: 1),
  );
}
