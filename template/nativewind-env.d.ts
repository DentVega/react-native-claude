/// <reference types="nativewind/types" />

// NativeWind v4 augmenta View/Text/Pressable etc. con `className` via la línea
// de arriba, pero no declara los módulos *.css que se importan como side-effect
// en app/_layout.tsx (`import '../global.css'`). Lo declaramos acá para que el
// import no rompa TypeScript.
declare module '*.css' {}
