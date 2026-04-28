<script setup>
import { ref } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';

const { auth } = usePage().props;
const role = auth.user.role;

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- Sidebar -->
        <aside 
            :class="[
                'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#d1e3f8] to-[#242e42] shadow-xl transform transition-transform duration-300 ease-in-out',
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            ]"
        >
            <div class="flex flex-col h-full">
                <!-- Logo -->
                <div class="h-28 flex items-center px-6">
                    <div class="flex items-center space-x-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/Lambang_Badan_Pusat_Statistik_%28BPS%29.svg" alt="BPS Logo" class="h-12 w-12">
                        <div>
                            <p class="text-sm font-bold text-[#1e293b] leading-tight uppercase">Badan Pusat Statistik</p>
                            <p class="text-[10px] font-medium text-slate-500">Pelabuhan Indonesia</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 px-4 py-6 space-y-2">
                    <p class="px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Main Menu</p>
                    
                    <!-- Admin Links -->
                    <template v-if="role === 'admin'">
                        <Link :href="route('admin.dashboard')" :class="[route().current('admin.dashboard*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span class="font-bold text-[13px]">Dashboard</span>
                            <div v-if="route().current('admin.dashboard*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                        <Link :href="route('admin.rekap')" :class="[route().current('admin.rekap*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span class="font-bold text-[13px]">Rekap Data</span>
                            <div v-if="route().current('admin.rekap*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                        <Link :href="route('admin.operators.index')" :class="[route().current('admin.operators*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span class="font-bold text-[13px]">Operators</span>
                            <div v-if="route().current('admin.operators*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                    </template>

                    <!-- Operator Links -->
                    <template v-else>
                        <Link :href="route('operator.dashboard')" :class="[route().current('operator.dashboard*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span class="font-bold text-[13px]">Dashboard</span>
                            <div v-if="route().current('operator.dashboard*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                        <Link :href="route('operator.entries.index')" :class="[route().current('operator.entries*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 16l-2-3V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v3h0-1 1v7L6 16H3v3h18v-3h-3zM5 19v-1h14v1H5z" />
                            </svg>
                            <span class="font-bold text-[13px]">Entri Kapal</span>
                            <div v-if="route().current('operator.entries*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                        <Link :href="route('operator.rekap')" :class="[route().current('operator.rekap*') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-600', 'relative flex items-center px-5 py-2.5 rounded-xl transition-all group']">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span class="font-bold text-[13px]">Laporan Saya</span>
                            <div v-if="route().current('operator.rekap*')" class="absolute right-4 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                        </Link>
                    </template>
                </nav>

                <!-- Footer / Logout -->
                <div class="px-6 py-8 space-y-6">
                    <!-- Profile Section -->
                    <div class="flex items-center px-2">
                        <div class="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shadow-sm backdrop-blur-sm">
                            {{ auth.user.username[0].toUpperCase() }}
                        </div>
                        <div class="ml-3 overflow-hidden">
                            <p class="text-sm font-bold text-white truncate leading-tight">{{ auth.user.username }}</p>
                            <p class="text-[10px] font-medium text-white/40 uppercase tracking-wider mt-0.5">{{ auth.user.role }}</p>
                        </div>
                    </div>

                    <!-- Logout Button -->
                    <Link :href="route('logout')" method="post" as="button" class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 backdrop-blur-sm font-bold text-xs group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Keluar</span>
                    </Link>

                    <p class="text-center text-[10px] font-medium text-white/20 tracking-[0.2em] uppercase pt-2">v2.0.0 Enterprise</p>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main :class="['flex-1 flex flex-col min-h-screen transition-all duration-300', isSidebarOpen ? 'ml-72' : 'ml-0']">
            <!-- Header -->
            <header class="h-20 bg-white/80 backdrop-blur-md flex items-center px-8 sticky top-0 z-40 border-b border-gray-100">
                <button @click="toggleSidebar" class="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
                
                <div class="ml-6 flex items-center text-sm text-gray-400 font-medium">
                    <span>{{ role === 'admin' ? 'Admin Panel' : 'Operator Area' }}</span>
                    <span class="mx-2">/</span>
                    <span class="text-gray-800 font-bold">
                        {{ 
                            route().current('*.dashboard') ? 'Dashboard' : 
                            route().current('*.rekap') ? (role === 'admin' ? 'Rekap Data' : 'Laporan Saya') :
                            route().current('*.entries.*') ? 'Entri Kapal' :
                            route().current('*.operators.*') ? 'Operators' : ''
                        }}
                    </span>
                </div>

                <div class="ml-auto flex items-center space-x-6">
                    <div class="flex items-center space-x-3 pr-4 border-r border-gray-100">
                        <div class="text-right">
                            <p class="text-sm font-black text-gray-800 leading-none">{{ auth.user.username }}</p>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ auth.user.role }}</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="p-10 bg-gray-50/50 min-h-[calc(100vh-80px)]">
                <slot />
            </div>
        </main>
    </div>
</template>
