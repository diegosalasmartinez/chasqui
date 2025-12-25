export interface MenuItem {
    label: string;
    icon?: string;
    onClick: () => void;
    danger?: boolean;
}

