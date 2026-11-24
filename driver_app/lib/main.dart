import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/constants/app_colors.dart';
import 'core/services/api_service.dart';
import 'models/driver_model.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService().init();
  final savedDriver = await ApiService().getSavedDriverSession();

  runApp(NaturaleDriverApp(initialDriver: savedDriver));
}

class NaturaleDriverApp extends StatelessWidget {
  final DriverModel? initialDriver;

  const NaturaleDriverApp({super.key, this.initialDriver});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Naturale Driver',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryOrange,
          primary: AppColors.primaryOrange,
        ),
        scaffoldBackgroundColor: AppColors.lightBackground,
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.textDark,
          elevation: 0,
        ),
      ),
      home: initialDriver != null
          ? HomeScreen(driver: initialDriver!)
          : const LoginScreen(),
    );
  }
}

