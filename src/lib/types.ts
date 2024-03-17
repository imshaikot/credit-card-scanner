export type CreditCardScannerType = { 
    start: () => Promise<any>;
    getPreviewNode: () => HTMLDivElement;
    capture: () => void;
    reset: () => void;
}