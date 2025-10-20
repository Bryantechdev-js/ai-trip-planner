declare module 'leaflet' {
  import * as L from 'leaflet';
  export = L;
  export as namespace L;
}

declare module 'leaflet/dist/leaflet.css' {
  const content: any;
  export default content;
}