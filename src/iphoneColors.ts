// Colores reales por modelo de iPhone
export const IPHONE_COLORS_BY_MODEL: Record<string, string[]> = {
  'iPhone 11': ['Negro', 'Blanco', 'Verde', 'Amarillo', 'Púrpura', 'Rojo'],
  'iPhone 11 Pro': ['Gris Espacial', 'Plateado', 'Dorado', 'Verde Noche'],
  'iPhone 11 Pro Max': ['Gris Espacial', 'Plateado', 'Dorado', 'Verde Noche'],
  
  'iPhone 12': ['Negro', 'Blanco', 'Rojo', 'Verde', 'Azul', 'Púrpura'],
  'iPhone 12 Pro': ['Gris Grafito', 'Plateado', 'Dorado', 'Azul Pacífico'],
  'iPhone 12 Pro Max': ['Gris Grafito', 'Plateado', 'Dorado', 'Azul Pacífico'],
  
  'iPhone 13': ['Medianoche', 'Estelar', 'Azul', 'Rosa', 'Rojo', 'Verde'],
  'iPhone 13 Pro': ['Gris Grafito', 'Dorado', 'Plateado', 'Azul Sierra'],
  'iPhone 13 Pro Max': ['Gris Grafito', 'Dorado', 'Plateado', 'Azul Sierra'],
  
  'iPhone 14': ['Medianoche', 'Estelar', 'Azul', 'Rosa', 'Rojo', 'Púrpura'],
  'iPhone 14 Pro': ['Negro Espacial', 'Plateado', 'Dorado', 'Púrpura Profundo'],
  'iPhone 14 Pro Max': ['Negro Espacial', 'Plateado', 'Dorado', 'Púrpura Profundo'],
  
  'iPhone 15': ['Negro', 'Azul', 'Verde', 'Rosa', 'Amarillo'],
  'iPhone 15 Pro': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Azul'],
  'iPhone 15 Pro Max': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Azul'],
  
  'iPhone 16': ['Negro', 'Ultramarino', 'Verde', 'Rosa', 'Blanco'],
  'iPhone 16 Pro': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Desierto'],
  'iPhone 16 Pro Max': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Desierto'],
  
  'iPhone 17': ['Negro', 'Azul', 'Verde', 'Rosa', 'Blanco'],
  'iPhone 17 Pro': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Desierto'],
  'iPhone 17 Pro Max': ['Negro Titanio', 'Titanio Natural', 'Titanio Blanco', 'Titanio Desierto'],
};

// Función para obtener colores según el modelo
export function getColorsForModel(model: string): string[] {
  return IPHONE_COLORS_BY_MODEL[model] || ['Negro', 'Blanco', 'Plateado'];
}
