import { Syringe } from '@antv/g';

export const AnnotationPluginOptions = Syringe.defineToken('AnnotationPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface AnnotationPluginOptions {
  onAdd: (annotation: any) => void;
  onActive: (annotation: any) => void;
  onDelete: (annotation: any) => void;
}
