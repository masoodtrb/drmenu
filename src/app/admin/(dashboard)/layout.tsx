import AdminProtected from '@/components/AdminProtected';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminProtected>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {children}
            </div>
        </AdminProtected>
    );
}
