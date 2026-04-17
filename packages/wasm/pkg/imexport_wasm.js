/* @ts-self-types="./imexport_wasm.d.ts" */

export class DynamicExcelData {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DynamicExcelData.prototype);
        obj.__wbg_ptr = ptr;
        DynamicExcelDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DynamicExcelDataFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dynamicexceldata_free(ptr, 0);
    }
    /**
     * @param {string} sheet_name
     * @param {string[]} headers
     * @param {ExcelRowData[]} rows
     */
    constructor(sheet_name, headers, rows) {
        const ptr0 = passStringToWasm0(sheet_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(headers, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(rows, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.dynamicexceldata_new(ptr0, len0, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        DynamicExcelDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string[]}
     */
    get headers() {
        const ret = wasm.__wbg_get_dynamicexceldata_headers(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {ExcelRowData[]}
     */
    get rows() {
        const ret = wasm.__wbg_get_dynamicexceldata_rows(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get sheet_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_dynamicexceldata_sheet_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string[]} arg0
     */
    set headers(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_dynamicexceldata_headers(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {ExcelRowData[]} arg0
     */
    set rows(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_dynamicexceldata_rows(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set sheet_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_dynamicexceldata_sheet_name(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) DynamicExcelData.prototype[Symbol.dispose] = DynamicExcelData.prototype.free;

export class ExcelCellFormat {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelCellFormat.prototype);
        obj.__wbg_ptr = ptr;
        ExcelCellFormatFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ExcelCellFormat)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelCellFormatFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_excelcellformat_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.excelcellformat_new();
        this.__wbg_ptr = ret >>> 0;
        ExcelCellFormatFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} align
     * @returns {ExcelCellFormat}
     */
    withAlign(align) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(align, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withAlign(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} align_vertical
     * @returns {ExcelCellFormat}
     */
    withAlignVertical(align_vertical) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(align_vertical, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withAlignVertical(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} background_color
     * @returns {ExcelCellFormat}
     */
    withBackgroundColor(background_color) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(background_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withBackgroundColor(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {boolean} bold
     * @returns {ExcelCellFormat}
     */
    withBold(bold) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcellformat_withBold(ptr, bold);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} border_color
     * @returns {ExcelCellFormat}
     */
    withBorderColor(border_color) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(border_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withBorderColor(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} color
     * @returns {ExcelCellFormat}
     */
    withColor(color) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withColor(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} date_format
     * @returns {ExcelCellFormat}
     */
    withDateFormat(date_format) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(date_format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withDateFormat(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {number} font_size
     * @returns {ExcelCellFormat}
     */
    withFontSize(font_size) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcellformat_withFontSize(ptr, font_size);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {boolean} italic
     * @returns {ExcelCellFormat}
     */
    withItalic(italic) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcellformat_withItalic(ptr, italic);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} rule
     * @returns {ExcelCellFormat}
     */
    withRule(rule) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(rule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withRule(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {boolean} strikethrough
     * @returns {ExcelCellFormat}
     */
    withStrikethrough(strikethrough) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcellformat_withStrikethrough(ptr, strikethrough);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {boolean} underline
     * @returns {ExcelCellFormat}
     */
    withUnderline(underline) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcellformat_withUnderline(ptr, underline);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @param {string} value
     * @returns {ExcelCellFormat}
     */
    withValue(value) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcellformat_withValue(ptr, ptr0, len0);
        return ExcelCellFormat.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get align_vertical() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_align_vertical(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get align() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_align(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get background_color() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_background_color(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    get bold() {
        const ret = wasm.__wbg_get_excelcellformat_bold(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string | undefined}
     */
    get border_color() {
        const ret = wasm.__wbg_get_excelcellformat_border_color(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get color() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_color(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get date_format() {
        const ret = wasm.__wbg_get_excelcellformat_date_format(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {number}
     */
    get font_size() {
        const ret = wasm.__wbg_get_excelcellformat_font_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get italic() {
        const ret = wasm.__wbg_get_excelcellformat_italic(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get rule() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_rule(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    get strikethrough() {
        const ret = wasm.__wbg_get_excelcellformat_strikethrough(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get underline() {
        const ret = wasm.__wbg_get_excelcellformat_underline(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get value() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcellformat_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set align_vertical(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_align_vertical(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set align(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_align(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set background_color(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_background_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} arg0
     */
    set bold(arg0) {
        wasm.__wbg_set_excelcellformat_bold(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string | null} [arg0]
     */
    set border_color(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_border_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set color(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string | null} [arg0]
     */
    set date_format(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_date_format(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} arg0
     */
    set font_size(arg0) {
        wasm.__wbg_set_excelcellformat_font_size(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set italic(arg0) {
        wasm.__wbg_set_excelcellformat_italic(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set rule(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_rule(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} arg0
     */
    set strikethrough(arg0) {
        wasm.__wbg_set_excelcellformat_strikethrough(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set underline(arg0) {
        wasm.__wbg_set_excelcellformat_underline(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set value(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcellformat_value(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ExcelCellFormat.prototype[Symbol.dispose] = ExcelCellFormat.prototype.free;

export class ExcelColumnData {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelColumnData.prototype);
        obj.__wbg_ptr = ptr;
        ExcelColumnDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ExcelColumnData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelColumnDataFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_excelcolumndata_free(ptr, 0);
    }
    /**
     * @param {string} key
     * @param {string} value
     */
    constructor(key, value) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumndata_bind_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        ExcelColumnDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} group_name
     * @param {string} value
     * @param {ExcelRowData[]} children
     * @returns {ExcelColumnData}
     */
    static newGroup(group_name, value, children) {
        const ptr0 = passStringToWasm0(group_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(children, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumndata_newGroup(ptr0, len0, ptr1, len1, ptr2, len2);
        return ExcelColumnData.__wrap(ret);
    }
    /**
     * @param {string} group_name
     * @param {ExcelRowData[]} children
     * @returns {ExcelColumnData}
     */
    static newRootGroup(group_name, children) {
        const ptr0 = passStringToWasm0(group_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(children, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumndata_newRootGroup(ptr0, len0, ptr1, len1);
        return ExcelColumnData.__wrap(ret);
    }
    /**
     * @param {ExcelRowData[]} children
     * @returns {ExcelColumnData}
     */
    withChildren(children) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passArrayJsValueToWasm0(children, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumndata_withChildren(ptr, ptr0, len0);
        return ExcelColumnData.__wrap(ret);
    }
    /**
     * @returns {ExcelRowData[]}
     */
    get children() {
        const ret = wasm.__wbg_get_excelcolumndata_children(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get key() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumndata_key(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get value() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumndata_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {ExcelRowData[]} arg0
     */
    set children(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumndata_children(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set key(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumndata_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set value(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumndata_value(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ExcelColumnData.prototype[Symbol.dispose] = ExcelColumnData.prototype.free;

export class ExcelColumnInfo {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelColumnInfo.prototype);
        obj.__wbg_ptr = ptr;
        ExcelColumnInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ExcelColumnInfo)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelColumnInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_excelcolumninfo_free(ptr, 0);
    }
    /**
     * @param {string} key
     * @param {string} name
     */
    constructor(key, name) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_bind_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        ExcelColumnInfoFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string[]} allowed_values
     * @returns {ExcelColumnInfo}
     */
    withAllowedValues(allowed_values) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passArrayJsValueToWasm0(allowed_values, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withAllowedValues(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {string} group
     * @returns {ExcelColumnInfo}
     */
    withDataGroup(group) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withDataGroup(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {string} group_parent
     * @returns {ExcelColumnInfo}
     */
    withDataGroupParent(group_parent) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(group_parent, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withDataGroupParent(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {string} data_type
     * @returns {ExcelColumnInfo}
     */
    withDataType(data_type) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(data_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withDataType(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {ExcelCellFormat} format
     * @returns {ExcelColumnInfo}
     */
    withFormat(format) {
        const ptr = this.__destroy_into_raw();
        _assertClass(format, ExcelCellFormat);
        var ptr0 = format.__destroy_into_raw();
        const ret = wasm.excelcolumninfo_withFormat(ptr, ptr0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {string} note
     * @returns {ExcelColumnInfo}
     */
    withNote(note) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(note, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withNote(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {string} parent
     * @returns {ExcelColumnInfo}
     */
    withParent(parent) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(parent, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withParent(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {ExcelCellFormat[]} value_format
     * @returns {ExcelColumnInfo}
     */
    withValueFormat(value_format) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passArrayJsValueToWasm0(value_format, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelcolumninfo_withValueFormat(ptr, ptr0, len0);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @param {number} width
     * @returns {ExcelColumnInfo}
     */
    withWidth(width) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelcolumninfo_withWidth(ptr, width);
        return ExcelColumnInfo.__wrap(ret);
    }
    /**
     * @returns {string[]}
     */
    get allowed_values() {
        const ret = wasm.__wbg_get_excelcolumninfo_allowed_values(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get data_group_parent() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_data_group_parent(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get data_group() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_data_group(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get data_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_data_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {ExcelCellFormat | undefined}
     */
    get format() {
        const ret = wasm.__wbg_get_excelcolumninfo_format(this.__wbg_ptr);
        return ret === 0 ? undefined : ExcelCellFormat.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get key() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_key(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get note() {
        const ret = wasm.__wbg_get_excelcolumninfo_note(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get parent() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelcolumninfo_parent(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {ExcelCellFormat[]}
     */
    get value_format() {
        const ret = wasm.__wbg_get_excelcolumninfo_value_format(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    get width() {
        const ret = wasm.__wbg_get_excelcolumninfo_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string[]} arg0
     */
    set allowed_values(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_allowed_values(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set data_group_parent(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_data_group_parent(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set data_group(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_data_group(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set data_type(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_data_type(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {ExcelCellFormat | null} [arg0]
     */
    set format(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ExcelCellFormat);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_excelcolumninfo_format(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {string} arg0
     */
    set key(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string | null} [arg0]
     */
    set note(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_note(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set parent(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_parent(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {ExcelCellFormat[]} arg0
     */
    set value_format(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelcolumninfo_value_format(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} arg0
     */
    set width(arg0) {
        wasm.__wbg_set_excelcolumninfo_width(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) ExcelColumnInfo.prototype[Symbol.dispose] = ExcelColumnInfo.prototype.free;

export class ExcelData {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelData.prototype);
        obj.__wbg_ptr = ptr;
        ExcelDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelDataFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exceldata_free(ptr, 0);
    }
    /**
     * @param {ExcelRowData[]} rows
     */
    constructor(rows) {
        const ptr0 = passArrayJsValueToWasm0(rows, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.exceldata_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        ExcelDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {ExcelRowData[]}
     */
    get rows() {
        const ret = wasm.__wbg_get_exceldata_rows(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {ExcelRowData[]} arg0
     */
    set rows(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_exceldata_rows(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ExcelData.prototype[Symbol.dispose] = ExcelData.prototype.free;

export class ExcelInfo {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelInfo.prototype);
        obj.__wbg_ptr = ptr;
        ExcelInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_excelinfo_free(ptr, 0);
    }
    /**
     * @param {string} name
     * @param {string} sheet_name
     * @param {ExcelColumnInfo[]} columns
     * @param {string} author
     * @param {string} create_time
     */
    constructor(name, sheet_name, columns, author, create_time) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(sheet_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(columns, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(author, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(create_time, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.excelinfo_bind_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        this.__wbg_ptr = ret >>> 0;
        ExcelInfoFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} row_height
     * @returns {ExcelInfo}
     */
    withDefaultRowHeight(row_height) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withDefaultRowHeight(ptr, row_height);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {number} row_height
     * @returns {ExcelInfo}
     */
    withHeaderRowHeight(row_height) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withHeaderRowHeight(ptr, row_height);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {Function} fetcher
     * @returns {ExcelInfo}
     */
    withImageFetcher(fetcher) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withImageFetcher(ptr, fetcher);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {boolean} is_header_freeze
     * @returns {ExcelInfo}
     */
    withIsHeaderFreeze(is_header_freeze) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withIsHeaderFreeze(ptr, is_header_freeze);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {number} dx
     * @param {number} dy
     * @returns {ExcelInfo}
     */
    withOffset(dx, dy) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withOffset(ptr, dx, dy);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {Function} callback
     * @returns {ExcelInfo}
     */
    withProgressCallback(callback) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withProgressCallback(ptr, callback);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {string} title
     * @returns {ExcelInfo}
     */
    withTitle(title) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(title, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelinfo_withTitle(ptr, ptr0, len0);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {ExcelCellFormat} title_format
     * @returns {ExcelInfo}
     */
    withTitleFormat(title_format) {
        const ptr = this.__destroy_into_raw();
        _assertClass(title_format, ExcelCellFormat);
        var ptr0 = title_format.__destroy_into_raw();
        const ret = wasm.excelinfo_withTitleFormat(ptr, ptr0);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @param {number} title_height
     * @returns {ExcelInfo}
     */
    withTitleHeight(title_height) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.excelinfo_withTitleHeight(ptr, title_height);
        return ExcelInfo.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get author() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelinfo_author(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {ExcelColumnInfo[]}
     */
    get columns() {
        const ret = wasm.__wbg_get_excelinfo_columns(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get create_time() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelinfo_create_time(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number | undefined}
     */
    get default_row_height() {
        const ret = wasm.__wbg_get_excelinfo_default_row_height(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @returns {number}
     */
    get dx() {
        const ret = wasm.__wbg_get_excelinfo_dx(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get dy() {
        const ret = wasm.__wbg_get_excelinfo_dy(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number | undefined}
     */
    get header_row_height() {
        const ret = wasm.__wbg_get_excelinfo_header_row_height(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @returns {boolean}
     */
    get is_header_freeze() {
        const ret = wasm.__wbg_get_excelinfo_is_header_freeze(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelinfo_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get sheet_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_excelinfo_sheet_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {ExcelCellFormat | undefined}
     */
    get title_format() {
        const ret = wasm.__wbg_get_excelinfo_title_format(this.__wbg_ptr);
        return ret === 0 ? undefined : ExcelCellFormat.__wrap(ret);
    }
    /**
     * @returns {number | undefined}
     */
    get title_height() {
        const ret = wasm.__wbg_get_excelinfo_title_height(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * @returns {string | undefined}
     */
    get title() {
        const ret = wasm.__wbg_get_excelinfo_title(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string} arg0
     */
    set author(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_author(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {ExcelColumnInfo[]} arg0
     */
    set columns(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_columns(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set create_time(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_create_time(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number | null} [arg0]
     */
    set default_row_height(arg0) {
        wasm.__wbg_set_excelinfo_default_row_height(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
     * @param {number} arg0
     */
    set dx(arg0) {
        wasm.__wbg_set_excelinfo_dx(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set dy(arg0) {
        wasm.__wbg_set_excelinfo_dy(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number | null} [arg0]
     */
    set header_row_height(arg0) {
        wasm.__wbg_set_excelinfo_header_row_height(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set is_header_freeze(arg0) {
        wasm.__wbg_set_excelinfo_is_header_freeze(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} arg0
     */
    set sheet_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_sheet_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {ExcelCellFormat | null} [arg0]
     */
    set title_format(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, ExcelCellFormat);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_excelinfo_title_format(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {number | null} [arg0]
     */
    set title_height(arg0) {
        wasm.__wbg_set_excelinfo_title_height(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
     * @param {string | null} [arg0]
     */
    set title(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelinfo_title(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ExcelInfo.prototype[Symbol.dispose] = ExcelInfo.prototype.free;

export class ExcelRowData {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExcelRowData.prototype);
        obj.__wbg_ptr = ptr;
        ExcelRowDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ExcelRowData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExcelRowDataFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_excelrowdata_free(ptr, 0);
    }
    /**
     * @param {ExcelColumnData[]} columns
     */
    constructor(columns) {
        const ptr0 = passArrayJsValueToWasm0(columns, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.excelrowdata_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        ExcelRowDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {ExcelColumnData[]}
     */
    get columns() {
        const ret = wasm.__wbg_get_excelrowdata_columns(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {ExcelColumnData[]} arg0
     */
    set columns(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_excelrowdata_columns(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) ExcelRowData.prototype[Symbol.dispose] = ExcelRowData.prototype.free;

/**
 * @param {ExcelInfo} info
 * @returns {Uint8Array}
 */
export function createTemplate(info) {
    _assertClass(info, ExcelInfo);
    var ptr0 = info.__destroy_into_raw();
    const ret = wasm.createTemplate(ptr0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {ExcelInfo} info
 * @param {ExcelData} data
 * @returns {Promise<any>}
 */
export function exportData(info, data) {
    _assertClass(info, ExcelInfo);
    var ptr0 = info.__destroy_into_raw();
    _assertClass(data, ExcelData);
    var ptr1 = data.__destroy_into_raw();
    const ret = wasm.exportData(ptr0, ptr1);
    return ret;
}

/**
 * @param {ExcelInfo} info
 * @param {Uint8Array} excel_bytes
 * @returns {ExcelData}
 */
export function importData(info, excel_bytes) {
    _assertClass(info, ExcelInfo);
    var ptr0 = info.__destroy_into_raw();
    const ptr1 = passArray8ToWasm0(excel_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.importData(ptr0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ExcelData.__wrap(ret[0]);
}

/**
 * @param {string | null | undefined} sheet_name
 * @param {number | null | undefined} header_row
 * @param {Uint8Array} excel_bytes
 * @returns {DynamicExcelData}
 */
export function importDynamicData(sheet_name, header_row, excel_bytes) {
    var ptr0 = isLikeNone(sheet_name) ? 0 : passStringToWasm0(sheet_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(excel_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.importDynamicData(ptr0, len0, isLikeNone(header_row) ? 0x100000001 : (header_row) >>> 0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return DynamicExcelData.__wrap(ret[0]);
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_7c536b7a8123d334: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_debug_string_8baecc377ad92880: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_d4c2480b46f29e33: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_e04e3a51a90cde43: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_5957b329897cc39c: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_string_get_ae6081df8158aa73: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_bd5a70920abf0236: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_207c541c2d58dfb3: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_call_1aea13500fe8ff6c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_excelcellformat_new: function(arg0) {
            const ret = ExcelCellFormat.__wrap(arg0);
            return ret;
        },
        __wbg_excelcellformat_unwrap: function(arg0) {
            const ret = ExcelCellFormat.__unwrap(arg0);
            return ret;
        },
        __wbg_excelcolumndata_new: function(arg0) {
            const ret = ExcelColumnData.__wrap(arg0);
            return ret;
        },
        __wbg_excelcolumndata_unwrap: function(arg0) {
            const ret = ExcelColumnData.__unwrap(arg0);
            return ret;
        },
        __wbg_excelcolumninfo_new: function(arg0) {
            const ret = ExcelColumnInfo.__wrap(arg0);
            return ret;
        },
        __wbg_excelcolumninfo_unwrap: function(arg0) {
            const ret = ExcelColumnInfo.__unwrap(arg0);
            return ret;
        },
        __wbg_excelrowdata_new: function(arg0) {
            const ret = ExcelRowData.__wrap(arg0);
            return ret;
        },
        __wbg_excelrowdata_unwrap: function(arg0) {
            const ret = ExcelRowData.__unwrap(arg0);
            return ret;
        },
        __wbg_length_090b6aa6235450ba: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_new_4774b8d4db1224e4: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_new_from_slice_2733a138cec5cdcf: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_typed_5101eada2c6754de: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h1f6390709e7a2f81(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_now_cd850b0a28a6e656: function() {
            const ret = Date.now();
            return ret;
        },
        __wbg_prototypesetcall_7dca54d31cb9d2dc: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_queueMicrotask_1f50b4bdf2c98605: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_queueMicrotask_805204511f79bee8: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_resolve_bb4df27803d377b2: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_static_accessor_GLOBAL_44bef9fa6011e260: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_13002645baf43d84: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_91d0abd4d035416c: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_513f857c65724fc7: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_then_d9ebfadd74ddfbb2: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_then_f6dedb0d880db23a: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 366, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__ha7d74a6bd6ac009d);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./imexport_wasm_bg.js": import0,
    };
}

function wasm_bindgen__convert__closures_____invoke__ha7d74a6bd6ac009d(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__ha7d74a6bd6ac009d(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h1f6390709e7a2f81(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h1f6390709e7a2f81(arg0, arg1, arg2, arg3);
}

const DynamicExcelDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dynamicexceldata_free(ptr >>> 0, 1));
const ExcelCellFormatFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_excelcellformat_free(ptr >>> 0, 1));
const ExcelColumnDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_excelcolumndata_free(ptr >>> 0, 1));
const ExcelColumnInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_excelcolumninfo_free(ptr >>> 0, 1));
const ExcelDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_exceldata_free(ptr >>> 0, 1));
const ExcelInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_excelinfo_free(ptr >>> 0, 1));
const ExcelRowDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_excelrowdata_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('imexport_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
