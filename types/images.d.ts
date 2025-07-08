// src/types/images.d.ts ou src/images.d.ts
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.gif' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.bmp' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.tiff' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

// Se você estiver usando SVGs como arquivos de imagem (não componentes React)
declare module '*.svg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}