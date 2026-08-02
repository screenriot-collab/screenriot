/** Public web app origin (e.g. https://screenriot.com), used to link out to live film pages. Empty when unset. */
export const WEB_ORIGIN = (import.meta.env.VITE_WEB_ORIGIN as string | undefined) ?? '';
