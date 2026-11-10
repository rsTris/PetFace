export const TRACKS = [
  { id: '0Wl4FGTMYV3sFLUhsX1teG' },
  { id: '4Hzxd8i56xOzIqeMYrJhVj' },
  { id: '0aCtSUDeiprILYdqcOxEV8' },
  { id: '0RLsjFdrB8S1NQRki5glvP' },
  { id: '1mQ1EOHMhBWkLOOQzLbTHK' },
];

export const randomTrack = () => TRACKS[Math.floor(Math.random() * TRACKS.length)];

export const embedUrl = (id) => `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;

export const openUrl = (id) => `https://open.spotify.com/track/${id}`;