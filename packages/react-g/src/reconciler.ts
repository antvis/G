import type { Canvas, Element } from '@antv/g';
import React from 'react';
import type { OpaqueHandle } from 'react-reconciler';
import ReactReconciler from 'react-reconciler';
import { unstable_now as now } from 'scheduler';
import { bindShapeEvent, updateProps } from './processProps';
import type {
  ChildSet,
  Container,
  HostContext,
  HydratableInstance,
  Instance,
  NoTimeout,
  Props,
  PublicInstance,
  SuspenseInstance,
  TextInstance,
  TimeoutHandle,
  Type,
  UpdatePayload,
} from './types';
import { log } from './util/debug';

export const reconcilor = ReactReconciler<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>({
  getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  },
  getRootHostContext(rootContainerInstance: Container): HostContext {},
  getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
    rootContainerInstance: Container,
  ): HostContext {},

  prepareForCommit(containerInfo: Container): Record<string, any> {
    return null;
  },
  resetAfterCommit(containerInfo: Container): void {},
  preparePortalMount(containerInfo: Container): void {},

  createInstance(
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): Instance {
    const canvas = rootContainerInstance as unknown as Canvas;
    const instance = canvas.document.createElement(type, {
      style: props,
    }) as unknown as Element;
    // @ts-ignore
    bindShapeEvent(props, instance);
    // log('createInstance ', type, instance);
    // @ts-ignore
    return instance;
  },
  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    // log('appendInitialChild', parentInstance, child);
    parentInstance.appendChild(child);
  },
  finalizeInitialChildren(
    parentInstance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): boolean {
    return false;
  },

  prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): null | UpdatePayload {
    // return hasUpdate(newProps, oldProps);
    return true;
  },

  shouldSetTextContent(type: Type, props: Props): boolean {
    return false;
  },
  // shouldDeprioritizeSubtree(type: Type, props: Props): boolean {
  //   return false;
  // },

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
    // @ts-ignore
  ): TextInstance {},

  // scheduleDeferredCallback(callback: () => any, options?: { timeout: number }): any {},
  // scheduleDeferredCallback,
  // cancelDeferredCallback(callbackID: any): void {},

  scheduleTimeout(
    handler: (...args: any[]) => void,
    timeout: number,
  ): TimeoutHandle | NoTimeout {},
  cancelTimeout(handle: TimeoutHandle | NoTimeout): void {},
  noTimeout: undefined,

  now,

  // Temporary workaround for scenario where multiple renderers concurrently
  // render using the same context objects. E.g. React DOM and React ART on the
  // same page. DOM is the primary renderer {}, ART is the secondary renderer.
  isPrimaryRenderer: false,

  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  // -------------------
  //      Mutation
  //     (optional)
  // -------------------
  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    // log('appendChild');
    parentInstance.appendChild(child);
  },
  appendChildToContainer(
    container: Container,
    child: Instance | TextInstance,
  ): void {
    // log('appendChildToContainer', container, child);
    container.appendChild(child);
  },
  commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string,
  ): void {},
  commitMount(
    instance: Instance,
    type: Type,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
  ): void {},
  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
  ): void {
    // log('commitUpdate', instance, newProps);
    updateProps(instance, newProps, oldProps);
  },
  insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    parentInstance.insertBefore(child, beforeChild);
  },
  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    container.insertBefore(child, beforeChild);
  },
  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    // log('removeChild', parentInstance, child);
    parentInstance.removeChild(child);
  },
  removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance,
  ): void {
    container.removeChild(child);
  },
  resetTextContent(instance: Instance): void {},

  /**
   * This method should make the `instance` invisible without removing it from the tree. For example, it can apply visual styling to hide it. It is used by Suspense to hide the tree while the fallback is visible.
   */
  // tslint:enable:max-line-length
  hideInstance(instance: Instance): void {},

  /**
   * Same as `hideInstance`, but for nodes created by `createTextInstance`.
   */
  hideTextInstance(textInstance: TextInstance): void {},

  /**
   * This method should make the `instance` visible, undoing what `hideInstance` did.
   */
  // @ts-ignore
  unhideInstance(instance: Instance, props: Props): void {},

  /**
   * Same as `unhideInstance`, but for nodes created by `createTextInstance`.
   */
  // @ts-ignore
  unhideTextInstance(textInstance: TextInstance, text: string): void {},

  /**
   * This method should mutate the `container` root node and remove all children from it.
   */
  clearContainer(container: Container): void {
    container.removeChildren();
  },

  // -------------------
  //     Persistence
  //     (optional)
  // -------------------
  cloneInstance(
    instance: Instance,
    updatePayload: null | UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
    keepChildren: boolean,
    recyclableInstance: Instance,
  ): Instance {
    return instance;
  },

  createContainerChildSet(container: Container): ChildSet {},

  appendChildToContainerChildSet(
    childSet: ChildSet,
    child: Instance | TextInstance,
  ): void {},
  finalizeContainerChildren(
    container: Container,
    newChildren: ChildSet,
  ): void {},

  replaceContainerChildren(
    container: Container,
    newChildren: ChildSet,
  ): void {},

  // -------------------
  //     Hydration
  //     (optional)
  // -------------------
  canHydrateInstance(
    instance: HydratableInstance,
    type: Type,
    props: Props,
  ): null | Instance {
    return instance;
  },
  canHydrateTextInstance(
    instance: HydratableInstance,
    text: string,
  ): null | TextInstance {
    return null;
  },
  getNextHydratableSibling(
    instance: Instance | TextInstance | HydratableInstance,
  ): null | HydratableInstance {},
  getFirstHydratableChild(
    parentInstance: Instance | Container,
  ): null | HydratableInstance {},
  hydrateInstance(
    instance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): null | UpdatePayload {},
  hydrateTextInstance(
    textInstance: TextInstance,
    text: string,
    internalInstanceHandle: OpaqueHandle,
  ): boolean {
    return false;
  },
  didNotMatchHydratedContainerTextInstance(
    parentContainer: Container,
    textInstance: TextInstance,
    text: string,
  ): void {},
  didNotMatchHydratedTextInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    textInstance: TextInstance,
    text: string,
  ): void {},
  didNotHydrateContainerInstance(
    parentContainer: Container,
    instance: Instance | TextInstance,
  ): void {},
  didNotHydrateInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    instance: Instance | TextInstance,
  ): void {},
  didNotFindHydratableContainerInstance(
    parentContainer: Container,
    type: Type,
    props: Props,
  ): void {},
  didNotFindHydratableContainerTextInstance(
    parentContainer: Container,
    text: string,
  ): void {},
  didNotFindHydratableInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    type: Type,
    props: Props,
  ): void {},
  didNotFindHydratableTextInstance(
    parentType: Type,
    parentProps: Props,
    parentInstance: Instance,
    text: string,
  ): void {},
});

reconcilor.injectIntoDevTools({
  // findFiberByHostInstance: () => {},
  // @ts-ignore
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-g',
  rendererConfig: {
    getInspectorDataForViewTag: (tag: number) => {
      // console.log(tag);
    },
  },
});

/**
 * render react-g component to target g element
 * 将react-g组件渲染到任意的g实例（Canvas/Group/Shape）中
 * @param component react-g component
 * @param target g element, Canvas/Group/Shape instance
 * @param callback callback after render finished
 * @returns void
 */
export const render = (
  component: React.ReactNode,
  target: Element | Canvas,
  callback?: (() => void) | null,
) => {
  // @ts-ignore
  const container = reconcilor.createContainer(target as any, 1, false, null);
  reconcilor.updateContainer(component, container, null, callback);
};
