declare module "gantt" {
    export interface GanttLink {
        target: number;
        type: "FS" | "FF" | "SS" | "SF";
    }

    export interface GanttItem {
        id: number;
        parent?: number;
        text: string;
        start: Date;
        end: Date;
        percent: number;
        links: GanttLink[];
        type?: "group" | "task" | "milestone";
    }

    export interface GanttStyleOptions {
        bgColor?: string;
        lineColor?: string;
        redLineColor?: string;
        groupBack?: string;
        groupFront?: string;
        taskBack?: string;
        taskFront?: string;
        milestone?: string;
        warning?: string;
        danger?: string;
        link?: string;
        textColor?: string;
        lightTextColor?: string;
        lineWidth?: string;
        thickLineWidth?: string;
        fontSize?: string;
        smallFontSize?: string;
        fontFamily?: string;
    }

    export interface GanttOptions {
        viewMode?: "day" | "week" | "month";
        onClick?: (item: GanttItem) => void;
        offsetY?: number;
        rowHeight?: number;
        barHeight?: number;
        thickWidth?: number;
        styleOptions?: GanttStyleOptions;
    }

    export class SVGGantt {
        constructor(
            element: string | HTMLElement,
            data: GanttItem[],
            options?: GanttOptions,
        );
        setData(data: GanttItem[]): void;
        setOptions(options: GanttOptions): void;
        render(): void;
    }

    export class CanvasGantt {
        constructor(
            element: string | HTMLElement,
            data: GanttItem[],
            options?: GanttOptions,
        );
        setData(data: GanttItem[]): void;
        setOptions(options: GanttOptions): void;
        render(): void;
    }

    export class StrGantt {
        constructor(data: GanttItem[], options?: GanttOptions);
        setData(data: GanttItem[]): void;
        setOptions(options: GanttOptions): void;
        render(): string;
    }
}
