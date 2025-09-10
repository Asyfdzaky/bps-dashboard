import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Logo */}
                    <div className="absolute top-6 left-6">
                        <Link href={route('home')} className="flex items-center">
                            <AppLogoIcon className="mr-3 h-16 w-16 text-primary" />
                            <span className="text-2xl font-semibold text-foreground">{name}</span>
                        </Link>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-8">
                        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">{title}</h1>
                        <p className="text-center text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </div>

                    {/* Auth Form */}
                    <div className="space-y-6">{children}</div>
                </div>
            </div>

            {/* Right Side - Marketing Content */}
            <div className="relative m-3 hidden overflow-hidden rounded-2xl lg:block">
                <div className="absolute inset-0 rounded-2xl bg-primary">
                    {/* Background Pattern using primary color variations */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80"></div>
                    <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    ></div>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-center rounded-2xl p-12 text-primary-foreground">
                    {/* Marketing Content */}
                    <div className="max-w-md">
                        <h2 className="mb-4 text-4xl font-bold">Effortlessly manage your publishing workflow.</h2>
                        <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                            Access your dashboard to manage manuscripts, track progress, and collaborate with your team efficiently.
                        </p>

                        {/* Dashboard Preview */}
                        <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur-sm">
                            <div className="space-y-4">
                                {/* Mock Dashboard Elements */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-primary-foreground/70">Total Manuscripts</div>
                                    <div className="text-2xl font-bold text-primary-foreground">1,247</div>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/20">
                                    <div className="h-full w-3/4 rounded-full bg-secondary"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-primary-foreground">6,248</div>
                                        <div className="text-xs text-primary-foreground/70">Published Books</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-primary-foreground">156</div>
                                        <div className="text-xs text-primary-foreground/70">Active Authors</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center">
                                <div className="mr-3 h-2 w-2 rounded-full bg-secondary"></div>
                                <span className="text-primary-foreground/80">Manuscript Management</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-3 h-2 w-2 rounded-full bg-accent"></div>
                                <span className="text-primary-foreground/80">Publishing Workflow</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-3 h-2 w-2 rounded-full bg-secondary/80"></div>
                                <span className="text-primary-foreground/80">Team Collaboration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
