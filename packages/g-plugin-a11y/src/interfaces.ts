import type { DisplayObject } from '@antv/g-lite';

export interface A11yPluginOptions {
  /**
   * Make text contents in canvas searchable.
   */
  enableExtractingText: boolean;

  /**
   * Enable outputing ARIA labels.
   */
  enableARIA: boolean;

  /**
   * Enable navigating with keyboard such as Tab & Arrow keypress.
   */
  enableKeyboardNavigation: boolean;

  /**
   * tab ring
   */
  tabSequence: DisplayObject[];

  /**
   * Options for the focus border drawn around elements while navigating through them.
   * @see https://api.highcharts.com.cn/highcharts/accessibility.keyboardNavigation.focusBorder.html
   */
  focusBorderColor: string;
  focusBorderLineWidth: number;
  focusBorderRadius: number;

  /**
   * aria-label for container
   */
  containerAriaLabel: string;
}
