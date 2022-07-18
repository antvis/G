export type AnnotationType = 'circle' | 'rect' | 'polyline' | 'polygon';
export interface Annotation {
  type: AnnotationType;
  id: string;
  path: AnnotationPath;
  isActive: boolean;
  isDrawing: boolean;
}

export interface Point {
  x: number;
  y: number;
}
export type AnnotationPath = Point[];
