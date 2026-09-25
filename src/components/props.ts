export interface FractalOption {
  id: string;
  name: string;
  description: string;
}

export interface PaletteOption {
  id: string;
  name: string;
  /** css = linear-gradient(...) for the swatch */
  css: string;
}

export interface BookmarkItem {
  id: string;
  name: string;
  fractalId: string;
}

export interface JuliaValue {
  re: number;
  im: number;
}
