/// <reference types="vite/client" />

declare module '*.jsx' {
  import { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}

declare module '*.js' {
  const value: any;
  export default value;
}
