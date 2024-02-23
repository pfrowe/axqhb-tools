// IE does not implement "prefers-color-scheme" media queries, so assume "light".
const getDefaultThemeName = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export { getDefaultThemeName };