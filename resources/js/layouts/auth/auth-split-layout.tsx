import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title: string;
    description: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left Side - Auth Form */}
            <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full lg:w-120">
                    {/* Logo */}
                    <div className="absolute top-6 left-6">
                        <Link href={route('home')} className="flex items-center">
                            <AppLogoIcon className="h-16 w-auto" />
                        </Link>
                    </div>

                    {/* Card Wrapper */}
                    <div className="rounded-xl border bg-card p-8">
                        {/* Title & Description */}
                        <div className="mb-8">
                            <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                        </div>

                        {/* Auth Form */}
                        <div className="space-y-6">{children}</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Marketing Content */}
            <div className="relative m-3 hidden overflow-hidden rounded-2xl lg:block">
                <div className="absolute inset-0 rounded-2xl bg-secondary">
                    {/* Background Pattern using primary color variations */}
                    <div className="absolute inset-0 rounded-2xl"></div>
                    <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    ></div>
                </div>

                <div className="relative z-10 flex h-full flex-col items-center justify-center rounded-2xl p-12 text-primary-foreground">
                    {/* Marketing Content */}
                    <div className="max-w-md">
                        <h2 className="mb-4 text-4xl font-bold">Effortlessly manage your publishing workflow.</h2>
                        <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                            Access your dashboard to manage manuscripts, track progress, and collaborate with your team efficiently.
                        </p>

                        {/* Lottie Animation replaces the mock dashboard */}
                        <div className="flex items-center justify-center">
                            <DotLottieReact
                                src="https://lottie.host/f5dd1e15-a0f0-4086-903c-1aee37da7cdd/qF1JKfb5DY.lottie"
                                loop
                                autoplay
                                style={{ width: 620, height: 320 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
