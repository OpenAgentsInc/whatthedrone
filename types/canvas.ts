export interface MinimalCanvas {
  width: number;
  height: number;
  style: any;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
  clientHeight: number;
  getContext: () => WebGLRenderingContext;
  toDataURL: () => string;
  toBlob: () => void;
  captureStream: () => MediaStream;
}