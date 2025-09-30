import authBackground from '@/assets/image.png';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title: string;
    description: string;
    backgroundImage?: string; // Optional prop untuk custom image
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    backgroundImage = authBackground, // Default image path
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Right Side - Marketing Content with Background Image */}
            <div className="relative m-3 hidden overflow-hidden rounded-2xl lg:block">
                {/* Background Image */}
                <div
                    className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url("${backgroundImage}")`,
                    }}
                >
                    {/* Overlay untuk memastikan text tetap terbaca */}
                    <div className="absolute inset-0 rounded-2xl"></div>
                </div>
{/* 
                <div className="relative z-10 flex h-full flex-col justify-center rounded-2xl p-8 text-white">
                    <div className="w-1/2 text-wrap">
                        <h2 className="mb-4 text-4xl font-bold text-primary">Kelola alur penerbitan Anda dengan mudah.</h2>
                        <p className="mb-8 text-justify text-lg leading-relaxed">
                            Akses dashboard untuk mengelola naskah, memantau progres, dan berkolaborasi dengan tim secara efisien.
                        </p>
                    </div>
                </div> */}
            </div>

            {/* Left Side - Auth Form */}
            <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full lg:w-120">
                    {/* Logo */}

                    {/* Card Wrapper */}
                    <div className="rounded-xl border bg-card p-8">
                        {/* Title & Description */}
                        <div className="mb-8 flex justify-center">
                            <Link href={route('home')} className="flex items-center">
                                <AppLogoIcon className="h-16 w-auto" />
                            </Link>
                        </div>
                        <div className="mb-8">
                            <h1 className="mb-2 text-center text-xl font-bold text-foreground">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>

                        {/* Auth Form */}
                        <div className="space-y-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
