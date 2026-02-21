interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export default function ProgressBar({
    value,
    max = 100,
    size = 'md',
    showLabel = false,
    className = ''
}: ProgressBarProps) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    const heightClass = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    }[size];

    return (
        <div className={`w-full ${className}`}>
            <div className={`progress-bar ${heightClass}`}>
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{Math.round(percent)}% complete</span>
                    <span>{value} / {max}</span>
                </div>
            )}
        </div>
    );
}
