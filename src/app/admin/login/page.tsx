'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                if (user.role === 'ADMIN') {
                    router.push('/admin/dashboard');
                    return;
                }
            } catch (error) {
                console.error('Error parsing admin user data:', error);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
            }
        }
        setIsCheckingAuth(false);
    }, [router]);

    const loginMutation = trpc.auth.adminLogin.useMutation({
        onSuccess: (data) => {
            // Store the token in localStorage or secure storage
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify({
                id: data.userId,
                username: data.username,
                role: data.role
            }));

            // Redirect to admin dashboard
            router.push('/admin/dashboard');
        },
        onError: (error) => {
            setError(error.message || 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.');
            setIsLoading(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username.trim() || !password.trim()) {
            setError('لطفاً تمام فیلدها را پر کنید');
            setIsLoading(false);
            return;
        }

        try {
            await loginMutation.mutateAsync({
                username: username.trim(),
                password: password.trim()
            });
        } catch (err) {
            // Error is handled in onError callback
        }
    };

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            ورود مدیر سیستم
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                            دسترسی به پنل مدیریت ابری
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                نام کاربری
                            </label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="نام کاربری خود را وارد کنید"
                                className="w-full text-right"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                رمز عبور
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="رمز عبور خود را وارد کنید"
                                    className="w-full pr-10 text-right"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>در حال ورود...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Lock className="w-4 h-4" />
                                    <span>ورود</span>
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            این بخش فقط برای مدیران مجاز قابل دسترسی است.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
