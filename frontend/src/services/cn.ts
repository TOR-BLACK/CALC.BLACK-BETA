export interface CnModifierType {
    [value: string]: string | boolean | number | undefined | null;
}

const cnService = {
    createCn: (
        block: string,
        separator: string = '_',
    ): ((element?: string, mods?: CnModifierType) => string) => {
        return (element?: string, mods: CnModifierType = {}): string => {
            const elementClass: string = element
                ? `${block}${separator}${separator}${element}`
                : block;
            const classNames: string[] = [elementClass];

            Object.keys(mods).forEach((key) => {
                if (mods[key]) {
                    classNames.push(`${elementClass}${separator}${key}`);
                }
            });

            return classNames.join(' ');
        };
    },
    concatCn: (...classNames: string[]): string => {
        return classNames.join(' ');
    },
};

export default cnService;
