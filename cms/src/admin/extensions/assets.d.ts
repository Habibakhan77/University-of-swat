/** Image imports in the admin panel: Vite turns them into the file's URL. */
declare module '*.png' {
  const src: string;
  export default src;
}
