<script setup>
import BpsLayout from '@/Layouts/BpsLayout.vue';
import { Head, router, Link } from '@inertiajs/vue3';
import { ref, onMounted, watch, computed } from 'vue';
import { Line } from 'vue-chartjs';
import axios from 'axios';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
} from 'chart.js';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
);

const props = defineProps({
    summary: Object,
    filters: Object,
});

const selectedYear = ref(props.filters.tahun);
const chartDataRaw = ref({
    bongkar: { luar_negeri: [], dalam_negeri: [] },
    muat: { luar_negeri: [], dalam_negeri: [] }
});

const toggleBongkar = ref('luar_negeri'); // 'luar_negeri' or 'dalam_negeri'
const toggleMuat = ref('luar_negeri'); // 'luar_negeri' or 'dalam_negeri'

const labels = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const commodityColors = {
    'ammonia': '#EF4444',
    'ammonium-nitrate': '#6366F1',
    'lng': '#10B981',
    'lpg': '#3B82F6',
    'pupuk': '#F59E0B'
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false // We'll use custom legend to match the image
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                color: '#F3F4F6'
            },
            ticks: {
                color: '#9CA3AF',
                font: { size: 10 }
            },
            title: {
                display: true,
                text: 'Volume (Ton)',
                color: '#9CA3AF',
                font: { size: 10 }
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#9CA3AF',
                font: { size: 10 }
            }
        }
    }
};

const getDatasets = (data) => {
    return data.map(item => ({
        label: item.label,
        data: item.data,
        borderColor: commodityColors[item.slug] || '#6B7280',
        backgroundColor: commodityColors[item.slug] || '#6B7280',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
    }));
};

const bongkarChartData = computed(() => ({
    labels,
    datasets: getDatasets(chartDataRaw.value.bongkar[toggleBongkar.value])
}));

const muatChartData = computed(() => ({
    labels,
    datasets: getDatasets(chartDataRaw.value.muat[toggleMuat.value])
}));

const fetchChartData = async () => {
    try {
        const response = await axios.get(route('admin.chart-data'), {
            params: { tahun: selectedYear.value }
        });
        chartDataRaw.value = response.data;
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
};

onMounted(fetchChartData);

watch(selectedYear, (newYear) => {
    router.get(route('admin.dashboard'), { tahun: newYear }, { preserveState: true });
    fetchChartData();
});
</script>

<template>
    <Head title="Admin Dashboard" />

    <BpsLayout>
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Selamat Datang, Administrator!</h1>
                    <p class="text-gray-500 mt-1">
                        Overview kinerja operasional pelabuhan untuk periode 
                        <span class="font-semibold text-blue-600">Tahun {{ selectedYear }}</span>
                    </p>
                </div>
                
                <div class="mt-4 md:mt-0 flex items-center space-x-4">
                    <div class="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                        <span class="text-xs font-medium text-gray-500 mr-2">Filter Tahun:</span>
                        <select v-model="selectedYear" class="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0 pr-6 cursor-pointer">
                            <option v-for="y in [2023, 2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Entries</p>
                        <h3 class="text-3xl font-black text-gray-800 mt-2">{{ summary.total_entries.toLocaleString() }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Laporan Masuk</p>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bongkar</p>
                        <h3 class="text-3xl font-black text-blue-600 mt-2">{{ summary.total_bongkar.toLocaleString() }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Tonase (Bongkar)</p>
                    </div>
                    <div class="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Muat</p>
                        <h3 class="text-3xl font-black text-emerald-600 mt-2">{{ summary.total_muat.toLocaleString() }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Tonase (Muat)</p>
                    </div>
                    <div class="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Operator Aktif</p>
                        <h3 class="text-3xl font-black text-amber-500 mt-2">{{ summary.active_operators }}</h3>
                        <p class="text-xs text-gray-500 mt-1">Petugas Entri</p>
                    </div>
                    <div class="bg-amber-50 p-3 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Bongkar Chart -->
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex flex-col mb-8">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-bold text-gray-800">Tren Realisasi Bongkar</h3>
                                <div class="flex items-center mt-1 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span class="text-sm font-semibold">Bongkar {{ toggleBongkar === 'luar_negeri' ? 'Luar Negeri' : 'Dalam Negeri' }} (Januari - Desember)</span>
                                </div>
                            </div>
                            <div class="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                <button 
                                    @click="toggleBongkar = 'luar_negeri'"
                                    :class="[toggleBongkar === 'luar_negeri' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600', 'px-4 py-1.5 text-xs font-bold rounded-lg transition-all']"
                                >Luar Negeri</button>
                                <button 
                                    @click="toggleBongkar = 'dalam_negeri'"
                                    :class="[toggleBongkar === 'dalam_negeri' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600', 'px-4 py-1.5 text-xs font-bold rounded-lg transition-all']"
                                >Dalam Negeri</button>
                            </div>
                        </div>

                        <!-- Legend -->
                        <div class="flex flex-wrap gap-4 mt-6">
                            <div v-for="(color, slug) in commodityColors" :key="slug" class="flex items-center">
                                <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: color }"></span>
                                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ slug.replace('-', ' ') }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="h-[350px] relative">
                        <Line :data="bongkarChartData" :options="chartOptions" />
                    </div>
                </div>

                <!-- Muat Chart -->
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex flex-col mb-8">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-bold text-gray-800">Tren Realisasi Muatan</h3>
                                <div class="flex items-center mt-1 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span class="text-sm font-semibold">Muat {{ toggleMuat === 'luar_negeri' ? 'Luar Negeri' : 'Dalam Negeri' }} (Januari - Desember)</span>
                                </div>
                            </div>
                            <div class="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                <button 
                                    @click="toggleMuat = 'luar_negeri'"
                                    :class="[toggleMuat === 'luar_negeri' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600', 'px-4 py-1.5 text-xs font-bold rounded-lg transition-all']"
                                >Luar Negeri</button>
                                <button 
                                    @click="toggleMuat = 'dalam_negeri'"
                                    :class="[toggleMuat === 'dalam_negeri' ? 'bg-white shadow-sm text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600', 'px-4 py-1.5 text-xs font-bold rounded-lg transition-all']"
                                >Dalam Negeri</button>
                            </div>
                        </div>

                        <!-- Legend -->
                        <div class="flex flex-wrap gap-4 mt-6">
                            <div v-for="(color, slug) in commodityColors" :key="slug" class="flex items-center">
                                <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: color }"></span>
                                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ slug.replace('-', ' ') }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="h-[350px] relative">
                        <Line :data="muatChartData" :options="chartOptions" />
                    </div>
                </div>
            </div>
        </div>
    </BpsLayout>
</template>

<style scoped>
/* Optional: Add custom styling for the select to match the UI better */
select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 center;
    background-size: 1rem;
    padding-right: 1.5rem;
}
</style>