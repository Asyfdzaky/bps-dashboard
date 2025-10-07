import authBackground from '@/assets/image.jpg';
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
            <div className="relative hidden overflow-hidden lg:block">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url("${backgroundImage}")`,
                    }}
                >
                    {/* Overlay dengan warna semi-transparan untuk membuat gambar tidak terlalu jelas */}
                    <div className="absolute inset-0 bg-black/50"></div> {/* Tambahkan bg-black/40 untuk overlay hitam 40% opacity */}
                </div>

                {/* Jika ada text di atas overlay, pastikan kontras (misal, tambahkan di sini jika belum ada) */}
                <div className="relative z-10 flex h-full items-center justify-center p-8">
                    <div className="text-center font-semibold text-white">
                        <h2 className="mb-4 text-4xl font-bold">Kelola Alur Penerbitan Anda dengan Mudah</h2>
                        <p className="text-lg">
                            Akses dashboard untuk mengelola naskah, memantau progres, dan berkolaborasi dengan tim secara efisien.
                        </p>
                    </div>
                </div>
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
