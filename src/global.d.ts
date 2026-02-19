declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module 'pdfkit' {
  class PDFDocument {
    constructor(options?: any);
    fontSize(size: number): this;
    font(font: string): this;
    text(text: string, options?: any): this;
    text(text: string, x: number, options?: any): this;
    text(text: string, x: number, y: number, options?: any): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    moveDown(lines?: number): this;
    image(src: any, x?: number, y?: number, options?: any): this;
    addPage(options?: any): this;
    on(event: string, callback: (...args: any[]) => void): void;
    end(): void;
    readonly y: number;
  }
  export = PDFDocument;
}