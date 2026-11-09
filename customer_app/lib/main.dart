import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app_links/app_links.dart';
import 'core/routes/app_router.dart';
import 'core/theme/app_theme.dart';
import 'services/mock_data_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize offline mock persistence and seeds
  await MockDataService().init();

  runApp(
    const ProviderScope(
      child: NaturaleCustomerApp(),
    ),
  );
}

class NaturaleCustomerApp extends ConsumerStatefulWidget {
  const NaturaleCustomerApp({super.key});

  @override
  ConsumerState<NaturaleCustomerApp> createState() => _NaturaleCustomerAppState();
}

class _NaturaleCustomerAppState extends ConsumerState<NaturaleCustomerApp> {
  late final AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  void _initDeepLinks() async {
    _appLinks = AppLinks();

    // 1. Handle cold-start deep link (app launched via link or QR code)
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        _handleDeepLink(initialUri);
      }
    } catch (_) {}

    // 2. Handle hot deep link stream (app already running in background or foreground)
    _linkSubscription = _appLinks.uriLinkStream.listen(
      (uri) {
        _handleDeepLink(uri);
      },
      onError: (_) {},
    );
  }

  void _handleDeepLink(Uri uri) {
    String? sku = uri.queryParameters['sku'] ??
        uri.queryParameters['barcode'] ??
        uri.queryParameters['id'];

    if (sku == null || sku.trim().isEmpty) {
      if (uri.pathSegments.isNotEmpty) {
        final lastSeg = uri.pathSegments.last.trim();
        if (!['open', 'product', 'products'].contains(lastSeg.toLowerCase())) {
          sku = lastSeg;
        }
      } else if (uri.host.isNotEmpty && !['product', 'open', 'app', 'dryfruits-api.onrender.com'].contains(uri.host.toLowerCase())) {
        sku = uri.host.trim();
      }
    }

    if (sku != null && sku.trim().isNotEmpty) {
      final cleanSku = sku.trim();
      final router = ref.read(routerProvider);
      Future.delayed(const Duration(milliseconds: 350), () {
        try {
          router.push('/product?sku=$cleanSku');
        } catch (_) {
          router.go('/product?sku=$cleanSku');
        }
      });
    }
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Naturale - Premium Dry Fruits & Spices',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
