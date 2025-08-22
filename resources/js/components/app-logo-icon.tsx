import { BookOpen } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement> & { className?: string }) {
    return <BookOpen {...props} />;
}
