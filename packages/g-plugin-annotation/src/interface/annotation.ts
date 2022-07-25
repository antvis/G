export type AnnotationType = 'circle' | 'rect' | 'polyline' | 'polygon';
export interface Annotation {
  type: AnnotationType;
  id: string;
  path: AnnotationPath;
  isActive: boolean;
  isHover: boolean;
  isDrawing: boolean;
  tag?: string;
}

export interface Point {
  x: number;
  y: number;
}
export type AnnotationPath = Point[];
