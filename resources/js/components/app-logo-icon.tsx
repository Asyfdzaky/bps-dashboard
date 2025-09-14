import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    className?: string;
}

export default function AppLogoIcon({ className, alt = 'BPS Dashboard Logo', ...props }: AppLogoIconProps) {
    return <img src="/image/logo-Rene-Turos-group.png" alt={alt} className={className} {...props} />;
}
