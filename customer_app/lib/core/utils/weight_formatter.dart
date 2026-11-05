class WeightFormatter {
  static String format(int grams) {
    if (grams >= 1000) {
      final kg = grams / 1000.0;
      if (grams % 1000 == 0) {
        return '${kg.toInt()} KG';
      } else {
        return '${kg.toStringAsFixed(2)} KG';
      }
    }
    return '$grams GM';
  }
}

