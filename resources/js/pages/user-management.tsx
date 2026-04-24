import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Plus,
    Edit,
    Power,
    Shield,
    Users,
    UserCog,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';
import {
    store as storeUser,
    toggleStatus as toggleUserStatus,
    update as updateUser,
} from '@/actions/App/Http/Controllers/UserController';
import { type DashboardPageProps } from '@/components/console-panels';
import { cn } from '@/lib/utils';
import { dashboard as dashboardRoute } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    barangay: string | null;
    contact_number: string;
    status: 'Active' | 'Inactive';
    last_active: string | null;
}

interface UserManagementProps extends DashboardPageProps {
    users: User[];
    roles: string[];
    barangays: string[];
    summary: {
        total: number;
        admins: number;
        barangayCommittee: number;
        operators: number;
    };
}

const roleColors: Record<string, string> = {
    'CDRRMO Admin': 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    'Barangay Committee': 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300',
    'Operator': 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
};

const statusColors: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Inactive: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
};

function StatusPill({ children, className }: { children: React.ReactNode; className: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                className,
            )}
        >
            {children}
        </span>
    );
}

export default function UserManagement({ users, roles, barangays, summary }: UserManagementProps) {
    const isScopedToSingleBarangay = barangays.length === 1;
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [barangayFilter, setBarangayFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        contact_number: '',
        role: '',
        barangay: '',
        password: '',
        password_confirmation: '',
    });

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesBarangay = !barangayFilter || user.barangay === barangayFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesBarangay && matchesStatus;
    });

    const handleAddUser = () => {
        setEditingUser(null);
        reset();
        setData('barangay', isScopedToSingleBarangay ? barangays[0] : '');
        setShowAddModal(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            contact_number: user.contact_number,
            role: user.role,
            barangay: user.barangay || '',
            password: '',
            password_confirmation: '',
        });
        setShowAddModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(updateUser.url(editingUser.id), {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                },
            });
        } else {
            post(storeUser.url(), {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                },
            });
        }
    };

    const handleToggleStatus = (user: User) => {
        put(toggleUserStatus.url(user.id));
    };

    const summaryCards = [
        {
            icon: Users,
            label: 'Total Users',
            value: summary.total,
            color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
        },
        {
            icon: Shield,
            label: 'Admins',
            value: summary.admins,
            color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        },
        {
            icon: UserCog,
            label: 'Barangay Committee',
            value: summary.barangayCommittee,
            color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        },
        {
            icon: Users,
            label: 'Operators',
            value: summary.operators,
            color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        },
    ];

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_26%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_100%)] md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-orange-700 uppercase dark:text-orange-300">
                                User Management
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Manage authorized users and access roles
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Administrative page for console access control. Resident evacuee accounts stay under the household registry.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-[28px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={cn('rounded-2xl p-3', card.color)}>
                                    <card.icon className="size-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                placeholder="Search user by name or email..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <select
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                value={barangayFilter}
                                onChange={(e) => setBarangayFilter(e.target.value)}
                            >
                                <option value="">All Barangays</option>
                                {barangays.map((barangay) => (
                                    <option key={barangay} value={barangay}>
                                        {barangay}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <button
                                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                                onClick={handleAddUser}
                            >
                                <Plus className="size-4" />
                                Add User
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Name
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Email
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Role
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Barangay
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Contact
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Status
                                    </th>
                                    <th className="pb-4 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/50"
                                    >
                                        <td className="py-4 text-sm font-medium text-foreground">
                                            {user.name}
                                        </td>
                                        <td className="py-4 text-sm text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="py-4">
                                            <StatusPill className={roleColors[user.role] || roleColors['Operator']}>
                                                {user.role}
                                            </StatusPill>
                                        </td>
                                        <td className="py-4 text-sm text-muted-foreground">
                                            {user.barangay || '-'}
                                        </td>
                                        <td className="py-4 text-sm text-muted-foreground">
                                            {user.contact_number}
                                        </td>
                                        <td className="py-4">
                                            <StatusPill className={statusColors[user.status]}>
                                                {user.status}
                                            </StatusPill>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="rounded-full bg-sky-500/10 p-2 text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-300"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    className={cn(
                                                        'rounded-full p-2 transition',
                                                        user.status === 'Active'
                                                            ? 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-300'
                                                            : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300',
                                                    )}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    <Power className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No users found matching your filters.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-foreground">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button
                                className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-900"
                                onClick={() => setShowAddModal(false)}
                            >
                                <X className="size-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Full Name
                                    </label>
                                    <input
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Email
                                    </label>
                                    <input
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Contact Number
                                    </label>
                                    <input
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                    />
                                    {errors.contact_number && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            {errors.contact_number}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Role
                                        </label>
                                        <select
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && (
                                            <p className="mt-1 text-xs text-rose-600">{errors.role}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Barangay
                                        </label>
                                        <select
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            disabled={
                                                data.role === 'CDRRMO Admin' ||
                                                isScopedToSingleBarangay
                                            }
                                            value={data.barangay}
                                            onChange={(e) => setData('barangay', e.target.value)}
                                        >
                                            <option value="">Select Barangay</option>
                                            {barangays.map((barangay) => (
                                                <option key={barangay} value={barangay}>
                                                    {barangay}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.barangay && (
                                            <p className="mt-1 text-xs text-rose-600">
                                                {errors.barangay}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {!editingUser && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                />
                                                <button
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-foreground focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-800 dark:bg-slate-900"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) =>
                                                        setData('password_confirmation', e.target.value)
                                                    }
                                                />
                                                <button
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(!showConfirmPassword)
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    className="flex-1 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                                    disabled={processing}
                                    type="submit"
                                >
                                    {editingUser ? 'Update User' : 'Save User'}
                                </button>
                                <button
                                    className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

UserManagement.layout = {
    breadcrumbs: [
        {
            title: 'CDRRMO Dashboard',
            href: dashboardRoute(),
        },
        {
            title: 'User Management',
            href: '/user-management',
        },
    ],
};
