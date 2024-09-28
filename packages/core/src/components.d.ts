/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ExcelDefinition } from "./types";
export { ExcelDefinition } from "./types";
export namespace Components {
    interface ImexportTable {
        "exportExcel": (data: any[]) => Promise<void>;
        "exportExcelTemplate": () => Promise<void>;
        "importExcel": (options?: { buffer?: Uint8Array; }) => Promise<void>;
        "info"?: ExcelDefinition;
    }
}
export interface ImexportTableCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLImexportTableElement;
}
declare global {
    interface HTMLImexportTableElementEventMap {
        "imported": any;
    }
    interface HTMLImexportTableElement extends Components.ImexportTable, HTMLStencilElement {
        addEventListener<K extends keyof HTMLImexportTableElementEventMap>(type: K, listener: (this: HTMLImexportTableElement, ev: ImexportTableCustomEvent<HTMLImexportTableElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLImexportTableElementEventMap>(type: K, listener: (this: HTMLImexportTableElement, ev: ImexportTableCustomEvent<HTMLImexportTableElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLImexportTableElement: {
        prototype: HTMLImexportTableElement;
        new (): HTMLImexportTableElement;
    };
    interface HTMLElementTagNameMap {
        "imexport-table": HTMLImexportTableElement;
    }
}
declare namespace LocalJSX {
    interface ImexportTable {
        "info"?: ExcelDefinition;
        "onImported"?: (event: ImexportTableCustomEvent<any>) => void;
    }
    interface IntrinsicElements {
        "imexport-table": ImexportTable;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "imexport-table": LocalJSX.ImexportTable & JSXBase.HTMLAttributes<HTMLImexportTableElement>;
        }
    }
}
